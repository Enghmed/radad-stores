import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Package, Plus, Search, Edit2, Trash2, Loader2, CheckCircle, MapPin, Star, Phone, Clock, Globe, ArrowLeft, Download, Image, UtensilsCrossed } from 'lucide-react'

const SUPABASE_FUNCTIONS_URL = 'https://jchcpswvlpdatudrstzl.supabase.co/functions/v1'

interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  category: string | null
  is_available: boolean
}

interface GooglePlace {
  name: string
  address: string
  phone: string
  rating: number | null
  reviews_count: number | null
  type: string
  price_range: string
  hours: string
  data_id: string
  place_id: string
  thumbnail: string
  website: string
  description: string
}

interface PopularItem {
  name: string
  mentions: number
  selected?: boolean
}

interface MenuItem {
  name: string
  description: string
  price: number | null
  category: string
  selected: boolean
  photo_url?: string
}

export default function Products() {
  const { store, user, refreshStore } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategory, setFormCategory] = useState('')

  // Google Maps Import state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importStep, setImportStep] = useState<'search' | 'results' | 'details' | 'importing'>('search')
  const [importQuery, setImportQuery] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importResults, setImportResults] = useState<GooglePlace[]>([])
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null)
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [importError, setImportError] = useState('')

  // Menu extraction state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuStep, setMenuStep] = useState<'idle' | 'scanning' | 'extracting' | 'done' | 'error'>('idle')
  const [menuPhotosCount, setMenuPhotosCount] = useState(0)
  const [menuError, setMenuError] = useState('')

  useEffect(() => {
    if (store?.id) loadProducts()
  }, [store?.id])

  async function loadProducts() {
    if (!store?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, category, is_available')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (!error && data) setProducts(data)
    setLoading(false)
  }

  function openAddModal() {
    setFormName('')
    setFormDescription('')
    setFormPrice('')
    setFormCategory('')
    setEditingProduct(null)
    setShowAddModal(true)
  }

  function openEditModal(product: Product) {
    setFormName(product.name)
    setFormDescription(product.description || '')
    setFormPrice(product.price?.toString() || '')
    setFormCategory(product.category || '')
    setEditingProduct(product)
    setShowAddModal(true)
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!store?.id || !formName.trim()) return
    setSaving(true)

    if (editingProduct) {
      await supabase
        .from('products')
        .update({
          name: formName.trim(),
          description: formDescription.trim() || null,
          price: formPrice ? parseFloat(formPrice) : null,
          category: formCategory.trim() || null,
        })
        .eq('id', editingProduct.id)
      setSuccess('تم تعديل المنتج')
    } else {
      await supabase
        .from('products')
        .insert({
          store_id: store.id,
          name: formName.trim(),
          description: formDescription.trim() || null,
          price: formPrice ? parseFloat(formPrice) : null,
          category: formCategory.trim() || null,
          is_available: true,
          source: 'manual',
        })
      setSuccess('تم إضافة المنتج')
    }

    setSaving(false)
    setShowAddModal(false)
    setTimeout(() => setSuccess(''), 3000)
    await loadProducts()
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter(p => p.id !== id))
    setSuccess('تم حذف المنتج')
    setTimeout(() => setSuccess(''), 3000)
  }

  // ========================================
  // Google Maps Import
  // ========================================
  function openImportModal() {
    setShowImportModal(true)
    setImportStep('search')
    setImportQuery('')
    setImportResults([])
    setSelectedPlace(null)
    setPopularItems([])
    setImportError('')
    setMenuItems([])
    setMenuStep('idle')
    setMenuPhotosCount(0)
    setMenuError('')
  }

  // ========================================
  // Menu Photo Extraction (AI-powered)
  // ========================================
  async function extractMenuFromPhotos() {
    if (!selectedPlace?.data_id) return
    setMenuLoading(true)
    setMenuStep('scanning')
    setMenuError('')

    try {
      // Step 1: Get photos and classify menu photos
      const photosRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/extract-menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-photos', data_id: selectedPlace.data_id }),
      })
      const photosData = await photosRes.json()

      if (!photosData.success || !photosData.menu_photos?.length) {
        setMenuStep('error')
        setMenuError(photosData.error || 'لم يتم العثور على صور قائمة لهذا المتجر')
        setMenuLoading(false)
        return
      }

      setMenuPhotosCount(photosData.menu_photos.length)
      setMenuStep('extracting')

      // Step 2: Extract items from menu photos
      const extractRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/extract-menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extract-items',
          menu_photos: photosData.menu_photos,
          store_name: selectedPlace.name,
        }),
      })
      const extractData = await extractRes.json()

      if (extractData.success && extractData.items?.length > 0) {
        setMenuItems(extractData.items.map((item: any) => ({
          name: item.name,
          description: item.description || '',
          price: item.price || null,
          category: item.category || 'عام',
          selected: true,
          photo_url: item.photo_url || null,
        })))
        setMenuStep('done')
      } else {
        setMenuStep('error')
        setMenuError('لم نتمكن من استخراج عناصر من صور القائمة')
      }
    } catch (err) {
      setMenuStep('error')
      setMenuError('خطأ في الاتصال، حاول مرة ثانية')
    }
    setMenuLoading(false)
  }

  function toggleMenuItem(index: number) {
    setMenuItems(items =>
      items.map((item, i) => i === index ? { ...item, selected: !item.selected } : item)
    )
  }

  async function searchGoogleMaps(e: React.FormEvent) {
    e.preventDefault()
    if (!importQuery.trim()) return
    setImportLoading(true)
    setImportError('')

    try {
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/google-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: importQuery.trim() }),
      })
      const data = await res.json()

      if (data.success && data.results?.length > 0) {
        setImportResults(data.results)
        setImportStep('results')
      } else {
        setImportError('لم يتم العثور على نتائج. جرّب اسم مختلف أو أضف اسم المدينة.')
      }
    } catch (err) {
      setImportError('خطأ في الاتصال، حاول مرة ثانية')
    }
    setImportLoading(false)
  }

  async function selectPlace(place: GooglePlace) {
    setSelectedPlace(place)
    setImportLoading(true)
    setImportStep('details')

    try {
      // Fetch popular items from reviews
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/google-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place_data_id: place.data_id }),
      })
      const data = await res.json()

      if (data.success && data.popular_items?.length > 0) {
        setPopularItems(data.popular_items.map((item: PopularItem) => ({ ...item, selected: true })))
      }
    } catch (err) {
      console.error('Error fetching place details:', err)
    }
    setImportLoading(false)
  }

  function toggleItem(index: number) {
    setPopularItems(items =>
      items.map((item, i) => i === index ? { ...item, selected: !item.selected } : item)
    )
  }

  async function doImport() {
    if (!store?.id || !selectedPlace) return
    setImportStep('importing')

    // 1. Update store info from Google Maps
    const storeUpdate: Record<string, any> = {}
    if (selectedPlace.name && !store.store_name) storeUpdate.store_name = selectedPlace.name
    if (selectedPlace.phone) storeUpdate.phone = selectedPlace.phone
    if (selectedPlace.address) storeUpdate.address = selectedPlace.address
    if (selectedPlace.website) storeUpdate.google_maps_url = selectedPlace.website
    if (selectedPlace.type) storeUpdate.business_type = selectedPlace.type

    if (Object.keys(storeUpdate).length > 0 && user) {
      await supabase.from('store_owners').update(storeUpdate).eq('auth_user_id', user.id)
    }

    // 2. Import selected popular items as products
    const selectedItems = popularItems.filter(item => item.selected)
    if (selectedItems.length > 0) {
      const rows = selectedItems.map(item => ({
        store_id: store.id,
        name: item.name,
        description: `عنصر شائع — ذُكر ${item.mentions} مرة في تقييمات قوقل`,
        is_available: true,
        source: 'google_maps',
      }))
      await supabase.from('products').insert(rows)
    }

    // 3. Import selected menu-extracted items
    const selectedMenuItems = menuItems.filter(item => item.selected)
    if (selectedMenuItems.length > 0) {
      const menuRows = selectedMenuItems.map(item => ({
        store_id: store.id,
        name: item.name,
        description: item.description || null,
        price: item.price,
        category: item.category || null,
        is_available: true,
        source: 'google_maps_menu',
      }))
      await supabase.from('products').insert(menuRows)
    }

    const totalImported = selectedItems.length + selectedMenuItems.length
    await refreshStore?.()
    await loadProducts()
    setSuccess(`تم الاستيراد! ${totalImported} منتج من قوقل ماب`)
    setTimeout(() => setSuccess(''), 4000)
    setShowImportModal(false)
  }

  const filteredProducts = products.filter(p =>
    p.name.includes(search) || p.description?.includes(search) || p.category?.includes(search)
  )

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-muted mt-1">أضف منتجاتك وخدماتك عشان الذكاء الاصطناعي يعرف يرد عنها</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openImportModal}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-secondary rounded-lg hover:bg-background transition-colors"
          >
            <MapPin size={18} />
            استيراد من قوقل
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={18} />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500" />
          <span className="text-sm text-green-800">{success}</span>
        </div>
      )}

      {/* Search */}
      {products.length > 0 && (
        <div className="relative mb-6">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في المنتجات..."
            className="w-full pr-10 pl-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 && !search ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted font-medium">لا توجد منتجات بعد</p>
          <p className="text-sm text-muted mt-2">أضف منتجاتك عشان الذكاء الاصطناعي يعرف يرد عنها لعملائك</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={openAddModal} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
              إضافة يدوياً
            </button>
            <button onClick={openImportModal} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-background transition-colors flex items-center gap-2">
              <MapPin size={16} />
              استيراد من قوقل
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 && search ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted font-medium">لا توجد نتائج لـ "{search}"</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{product.name}</h3>
                  {product.category && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{product.category}</span>
                  )}
                </div>
                {product.description && <p className="text-sm text-muted mt-1">{product.description}</p>}
                {product.price != null && <p className="text-sm text-primary font-bold mt-1">{product.price} ريال</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEditModal(product)} className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted text-center mt-2">{filteredProducts.length} منتج</p>
        </div>
      )}

      {/* ========================================
          Add/Edit Product Modal
      ======================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-lg border border-border" dir="rtl">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
            <form className="space-y-4" onSubmit={handleSaveProduct}>
              <div>
                <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: كيكة شوكولاتة" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea rows={3} value={formDescription} onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="وصف قصير عن المنتج..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">السعر (ريال)</label>
                  <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <input type="text" value={formCategory} onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="مثال: حلويات" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-border rounded-lg hover:bg-background transition-colors">إلغاء</button>
                <button type="submit" disabled={saving || !formName.trim()}
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</> : editingProduct ? 'حفظ التعديل' : 'حفظ المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          Google Maps Import Modal
      ======================================== */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-surface rounded-2xl w-full max-w-2xl border border-border my-8" dir="rtl">

            {/* Header */}
            <div className="p-6 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <MapPin size={20} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">استيراد من قوقل ماب</h2>
                <p className="text-xs text-muted">ابحث عن متجرك واستورد معلوماته ومنتجاته الشائعة</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-muted hover:text-secondary text-xl p-1">&times;</button>
            </div>

            <div className="p-6">
              {/* Step 1: Search */}
              {importStep === 'search' && (
                <div>
                  <form onSubmit={searchGoogleMaps} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">ابحث عن متجرك في قوقل ماب</label>
                      <input
                        type="text"
                        value={importQuery}
                        onChange={e => setImportQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="مثال: مطعم صالح الرياض"
                        autoFocus
                      />
                      <p className="text-xs text-muted mt-2">أضف اسم المدينة للنتائج الأدق</p>
                    </div>
                    {importError && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{importError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={importLoading || !importQuery.trim()}
                      className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {importLoading ? <><Loader2 size={18} className="animate-spin" /> جاري البحث...</> : <><Search size={18} /> بحث</>}
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Results */}
              {importStep === 'results' && (
                <div>
                  <button
                    onClick={() => setImportStep('search')}
                    className="flex items-center gap-1 text-sm text-muted hover:text-secondary mb-4"
                  >
                    <ArrowLeft size={14} className="rotate-180" />
                    رجوع للبحث
                  </button>
                  <p className="text-sm font-medium mb-3">اختر متجرك من النتائج ({importResults.length} نتيجة)</p>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {importResults.map((place, i) => (
                      <button
                        key={i}
                        onClick={() => selectPlace(place)}
                        className="w-full text-right p-4 bg-background border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          {place.thumbnail ? (
                            <img src={place.thumbnail} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <MapPin size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm">{place.name}</h3>
                            <p className="text-xs text-muted mt-0.5">{place.type}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {place.rating && (
                                <span className="flex items-center gap-1 text-xs">
                                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                  {place.rating} ({place.reviews_count})
                                </span>
                              )}
                              {place.price_range && (
                                <span className="text-xs text-muted">{place.price_range}</span>
                              )}
                              {place.hours && (
                                <span className="flex items-center gap-1 text-xs text-muted">
                                  <Clock size={10} />
                                  {place.hours}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted mt-1 truncate">{place.address}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Place Details + Popular Items */}
              {importStep === 'details' && selectedPlace && (
                <div>
                  <button
                    onClick={() => setImportStep('results')}
                    className="flex items-center gap-1 text-sm text-muted hover:text-secondary mb-4"
                  >
                    <ArrowLeft size={14} className="rotate-180" />
                    رجوع للنتائج
                  </button>

                  {/* Selected place info */}
                  <div className="bg-background rounded-xl p-4 mb-5 border border-border">
                    <h3 className="font-bold">{selectedPlace.name}</h3>
                    <p className="text-xs text-muted mt-1">{selectedPlace.type}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      {selectedPlace.address && (
                        <div className="flex items-center gap-1.5 text-muted">
                          <MapPin size={12} /> {selectedPlace.address}
                        </div>
                      )}
                      {selectedPlace.phone && (
                        <div className="flex items-center gap-1.5 text-muted">
                          <Phone size={12} /> <span dir="ltr">{selectedPlace.phone}</span>
                        </div>
                      )}
                      {selectedPlace.rating && (
                        <div className="flex items-center gap-1.5">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          {selectedPlace.rating} ({selectedPlace.reviews_count} تقييم)
                        </div>
                      )}
                      {selectedPlace.website && (
                        <div className="flex items-center gap-1.5 text-muted">
                          <Globe size={12} /> موقع إلكتروني
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store info import */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-500 shrink-0" />
                    <span className="text-xs text-blue-800">سيتم تحديث معلومات متجرك (العنوان، الهاتف، نوع النشاط) من قوقل ماب</span>
                  </div>

                  {/* Popular items */}
                  {importLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className="text-sm text-muted mr-2">جاري جلب المنتجات الشائعة...</span>
                    </div>
                  ) : popularItems.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold">المنتجات الشائعة من التقييمات ({popularItems.filter(i => i.selected).length} مختار)</h3>
                        <button
                          onClick={() => setPopularItems(items => items.map(i => ({ ...i, selected: !items.every(x => x.selected) })))}
                          className="text-xs text-primary hover:underline"
                        >
                          {popularItems.every(i => i.selected) ? 'إلغاء الكل' : 'اختيار الكل'}
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                        {popularItems.map((item, i) => (
                          <label
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              item.selected
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-background border-border hover:border-primary/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleItem(i)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                            />
                            <span className="flex-1 text-sm font-medium">{item.name}</span>
                            <span className="text-xs text-muted bg-background px-2 py-0.5 rounded-full">
                              {item.mentions} ذكر
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm text-muted">لم يتم العثور على منتجات شائعة في التقييمات</p>
                      <p className="text-xs text-muted mt-1">سيتم استيراد معلومات المتجر فقط</p>
                    </div>
                  )}

                  {/* Menu Extraction Section */}
                  <div className="mt-5 border-t border-border pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <UtensilsCrossed size={16} className="text-orange-500" />
                        استخراج من صور القائمة (AI)
                      </h3>
                    </div>

                    {menuStep === 'idle' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                        <Image size={28} className="mx-auto mb-2 text-orange-400" />
                        <p className="text-xs text-orange-800 mb-3">
                          يمكن للذكاء الاصطناعي مسح صور القائمة من قوقل ماب واستخراج المنتجات والأسعار تلقائياً
                        </p>
                        <button
                          onClick={extractMenuFromPhotos}
                          disabled={menuLoading}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Image size={16} />
                          استخراج من صور القائمة
                        </button>
                      </div>
                    )}

                    {menuStep === 'scanning' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                        <Loader2 size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-orange-800">جاري مسح الصور وتصنيفها...</p>
                        <p className="text-xs text-orange-600 mt-1">يتم البحث عن صور القائمة بالذكاء الاصطناعي</p>
                      </div>
                    )}

                    {menuStep === 'extracting' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                        <Loader2 size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-orange-800">جاري استخراج المنتجات من {menuPhotosCount} صورة...</p>
                        <p className="text-xs text-orange-600 mt-1">الذكاء الاصطناعي يقرأ القائمة ويستخرج الأسماء والأسعار</p>
                      </div>
                    )}

                    {menuStep === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <p className="text-sm text-red-700">{menuError}</p>
                        <button
                          onClick={() => { setMenuStep('idle'); setMenuError('') }}
                          className="mt-2 text-xs text-red-600 hover:underline"
                        >
                          حاول مرة ثانية
                        </button>
                      </div>
                    )}

                    {menuStep === 'done' && menuItems.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted">
                            تم استخراج {menuItems.length} عنصر من {menuPhotosCount} صورة ({menuItems.filter(i => i.selected).length} مختار)
                          </span>
                          <button
                            onClick={() => setMenuItems(items => items.map(i => ({ ...i, selected: !items.every(x => x.selected) })))}
                            className="text-xs text-primary hover:underline"
                          >
                            {menuItems.every(i => i.selected) ? 'إلغاء الكل' : 'اختيار الكل'}
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                          {menuItems.map((item, i) => (
                            <label
                              key={i}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                item.selected
                                  ? 'bg-orange-50 border-orange-300'
                                  : 'bg-background border-border hover:border-orange-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleMenuItem(i)}
                                className="w-4 h-4 rounded border-border text-orange-500 focus:ring-orange-400"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium block">{item.name}</span>
                                {item.description && (
                                  <span className="text-xs text-muted block truncate">{item.description}</span>
                                )}
                              </div>
                              <div className="text-left shrink-0">
                                {item.price != null && (
                                  <span className="text-xs font-bold text-orange-600">{item.price} ريال</span>
                                )}
                                {item.category && (
                                  <span className="text-xs text-muted block">{item.category}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={doImport}
                    className="w-full mt-5 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {(() => {
                      const popCount = popularItems.filter(i => i.selected).length
                      const menuCount = menuItems.filter(i => i.selected).length
                      const total = popCount + menuCount
                      return total > 0 ? `استيراد (${total} منتج + معلومات المتجر)` : 'استيراد (معلومات المتجر فقط)'
                    })()}
                  </button>
                </div>
              )}

              {/* Step 4: Importing */}
              {importStep === 'importing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={40} className="animate-spin text-primary mb-4" />
                  <p className="font-medium">جاري الاستيراد...</p>
                  <p className="text-sm text-muted mt-1">يتم حفظ المعلومات والمنتجات</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

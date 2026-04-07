import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Package, Plus, Search, Edit2, Trash2, Loader2, CheckCircle, MapPin, Star, Phone, Clock, Globe, ArrowLeft, Download, Image, UtensilsCrossed, X, Eye, EyeOff, Tag } from 'lucide-react'

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

  async function handleToggleAvailability(product: Product) {
    const newValue = !product.is_available
    await supabase
      .from('products')
      .update({ is_available: newValue })
      .eq('id', product.id)
    setProducts(products.map(p => p.id === product.id ? { ...p, is_available: newValue } : p))
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

    const storeUpdate: Record<string, any> = {}
    if (selectedPlace.name && !store.store_name) storeUpdate.store_name = selectedPlace.name
    if (selectedPlace.phone) storeUpdate.phone = selectedPlace.phone
    if (selectedPlace.address) storeUpdate.address = selectedPlace.address
    if (selectedPlace.website) storeUpdate.google_maps_url = selectedPlace.website
    if (selectedPlace.type) storeUpdate.business_type = selectedPlace.type

    if (Object.keys(storeUpdate).length > 0 && user) {
      await supabase.from('store_owners').update(storeUpdate).eq('auth_user_id', user.id)
    }

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

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-in">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold gradient-text">المنتجات</h1>
                {products.length > 0 && (
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full animate-scale-in">
                    {products.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">أضف منتجاتك وخدماتك عشان الذكاء الاصطناعي يعرف يرد عنها</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openImportModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-emerald-200 transition-all duration-200 shadow-sm"
            >
              <MapPin size={18} className="text-red-500" />
              <span className="text-sm font-medium">استيراد من قوقل</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              <Plus size={18} />
              <span className="text-sm font-bold">إضافة منتج</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="animate-fade-in-up bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-800">{success}</span>
          </div>
        )}

        {/* Search Bar */}
        {products.length > 0 && (
          <div className="relative animate-fade-in-up">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في المنتجات..."
              className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 shadow-sm text-sm"
            />
          </div>
        )}

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap animate-fade-in-up">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSearch(search === cat ? '' : cat!)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  search === cat
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-emerald-500 mb-3" />
            <p className="text-sm text-gray-400">جاري تحميل المنتجات...</p>
          </div>
        ) : filteredProducts.length === 0 && !search ? (
          /* Empty State */
          <div className="animate-fade-in-up glass rounded-2xl p-12 text-center border border-gray-200/50">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-5">
              <Package size={36} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">لا توجد منتجات بعد</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              أضف منتجاتك عشان الذكاء الاصطناعي يعرف يرد عنها لعملائك
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
              >
                إضافة يدوياً
              </button>
              <button
                onClick={openImportModal}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <MapPin size={16} className="text-red-500" />
                استيراد من قوقل
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 && search ? (
          <div className="animate-fade-in glass rounded-2xl p-12 text-center border border-gray-200/50">
            <Search size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">لا توجد نتائج لـ "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image Placeholder */}
                <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                  <Package size={40} className="text-gray-300" />
                  {/* Availability indicator */}
                  <div className={`absolute top-3 left-3 w-3 h-3 rounded-full ${product.is_available ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`} />
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300 delay-75"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{product.name}</h3>
                    {product.category && (
                      <span className="shrink-0 px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {product.price != null ? (
                      <span className="text-base font-bold text-emerald-600">
                        {product.price} <span className="text-xs font-medium text-gray-400">ر.س</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">بدون سعر</span>
                    )}

                    {/* Availability Toggle */}
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
                        product.is_available
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {product.is_available ? (
                        <>
                          <Eye size={12} />
                          متوفر
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          غير متوفر
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length > 0 && (
          <p className="text-xs text-gray-400 text-center animate-fade-in">
            عرض {filteredProducts.length} من {products.length} منتج
          </p>
        )}

        {/* ========================================
            Add/Edit Product Modal
        ======================================== */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass rounded-2xl p-0 w-full max-w-lg border border-white/20 shadow-2xl animate-scale-in overflow-hidden" dir="rtl">
              {/* Modal Header */}
              <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    {editingProduct ? <Edit2 size={20} className="text-white" /> : <Plus size={20} className="text-white" />}
                  </div>
                  <h2 className="text-lg font-bold text-white">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form className="p-6 space-y-5" onSubmit={handleSaveProduct}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنتج *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="مثال: كيكة شوكولاتة"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm resize-none"
                    placeholder="وصف قصير عن المنتج..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">السعر (ر.س)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="0.00"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                    <div className="relative">
                      <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                        className="w-full pr-9 pl-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm"
                        placeholder="مثال: حلويات"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-600"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formName.trim()}
                    className="flex-1 py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-emerald-500/20"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : editingProduct ? 'حفظ التعديل' : 'حفظ المنتج'}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
            <div className="glass rounded-2xl w-full max-w-2xl border border-white/20 shadow-2xl my-8 animate-scale-in overflow-hidden" dir="rtl">

              {/* Header */}
              <div className="bg-gradient-to-l from-red-500 to-red-600 p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">استيراد من قوقل ماب</h2>
                  <p className="text-xs text-white/70">ابحث عن متجرك واستورد معلوماته ومنتجاته الشائعة</p>
                </div>
                <button onClick={() => setShowImportModal(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                {/* Step 1: Search */}
                {importStep === 'search' && (
                  <div className="animate-fade-in-up">
                    <form onSubmit={searchGoogleMaps} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ابحث عن متجرك في قوقل ماب</label>
                        <input
                          type="text"
                          value={importQuery}
                          onChange={e => setImportQuery(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="مثال: مطعم صالح الرياض"
                          autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-2">أضف اسم المدينة للنتائج الأدق</p>
                      </div>
                      {importError && (
                        <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">{importError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={importLoading || !importQuery.trim()}
                        className="w-full py-3.5 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                      >
                        {importLoading ? <><Loader2 size={18} className="animate-spin" /> جاري البحث...</> : <><Search size={18} /> بحث</>}
                      </button>
                    </form>
                  </div>
                )}

                {/* Step 2: Results */}
                {importStep === 'results' && (
                  <div className="animate-fade-in-up">
                    <button
                      onClick={() => setImportStep('search')}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                      <ArrowLeft size={14} className="rotate-180" />
                      رجوع للبحث
                    </button>
                    <p className="text-sm font-bold mb-3 text-gray-700">اختر متجرك من النتائج ({importResults.length} نتيجة)</p>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {importResults.map((place, i) => (
                        <button
                          key={i}
                          onClick={() => selectPlace(place)}
                          className="w-full text-right p-4 bg-gray-50/50 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            {place.thumbnail ? (
                              <img src={place.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                            ) : (
                              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm">{place.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">{place.type}</p>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {place.rating && (
                                  <span className="flex items-center gap-1 text-xs">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    {place.rating} ({place.reviews_count})
                                  </span>
                                )}
                                {place.price_range && (
                                  <span className="text-xs text-gray-500">{place.price_range}</span>
                                )}
                                {place.hours && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock size={10} />
                                    {place.hours}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 truncate">{place.address}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Place Details + Popular Items */}
                {importStep === 'details' && selectedPlace && (
                  <div className="animate-fade-in-up">
                    <button
                      onClick={() => setImportStep('results')}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                    >
                      <ArrowLeft size={14} className="rotate-180" />
                      رجوع للنتائج
                    </button>

                    {/* Selected place info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
                      <h3 className="font-bold">{selectedPlace.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{selectedPlace.type}</p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        {selectedPlace.address && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <MapPin size={12} /> {selectedPlace.address}
                          </div>
                        )}
                        {selectedPlace.phone && (
                          <div className="flex items-center gap-1.5 text-gray-500">
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
                          <div className="flex items-center gap-1.5 text-gray-500">
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
                        <Loader2 size={24} className="animate-spin text-emerald-500" />
                        <span className="text-sm text-gray-500 mr-2">جاري جلب المنتجات الشائعة...</span>
                      </div>
                    ) : popularItems.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-gray-700">المنتجات الشائعة من التقييمات ({popularItems.filter(i => i.selected).length} مختار)</h3>
                          <button
                            onClick={() => setPopularItems(items => items.map(i => ({ ...i, selected: !items.every(x => x.selected) })))}
                            className="text-xs text-emerald-600 hover:underline font-medium"
                          >
                            {popularItems.every(i => i.selected) ? 'إلغاء الكل' : 'اختيار الكل'}
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                          {popularItems.map((item, i) => (
                            <label
                              key={i}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                item.selected
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-gray-50/50 border-gray-200 hover:border-emerald-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleItem(i)}
                                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                              />
                              <span className="flex-1 text-sm font-medium">{item.name}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {item.mentions} ذكر
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Package size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">لم يتم العثور على منتجات شائعة في التقييمات</p>
                        <p className="text-xs text-gray-400 mt-1">سيتم استيراد معلومات المتجر فقط</p>
                      </div>
                    )}

                    {/* Menu Extraction Section */}
                    <div className="mt-5 border-t border-gray-200 pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700">
                          <UtensilsCrossed size={16} className="text-orange-500" />
                          استخراج من صور القائمة (AI)
                        </h3>
                      </div>

                      {menuStep === 'idle' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Image size={24} className="text-orange-500" />
                          </div>
                          <p className="text-xs text-orange-800 mb-4">
                            يمكن للذكاء الاصطناعي مسح صور القائمة من قوقل ماب واستخراج المنتجات والأسعار تلقائياً
                          </p>
                          <button
                            onClick={extractMenuFromPhotos}
                            disabled={menuLoading}
                            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg shadow-orange-500/20"
                          >
                            <Image size={16} />
                            استخراج من صور القائمة
                          </button>
                        </div>
                      )}

                      {menuStep === 'scanning' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
                          <Loader2 size={28} className="animate-spin text-orange-500 mx-auto mb-3" />
                          <p className="text-sm font-bold text-orange-800">جاري مسح الصور وتصنيفها...</p>
                          <p className="text-xs text-orange-600 mt-1">يتم البحث عن صور القائمة بالذكاء الاصطناعي</p>
                        </div>
                      )}

                      {menuStep === 'extracting' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
                          <Loader2 size={28} className="animate-spin text-orange-500 mx-auto mb-3" />
                          <p className="text-sm font-bold text-orange-800">جاري استخراج المنتجات من {menuPhotosCount} صورة...</p>
                          <p className="text-xs text-orange-600 mt-1">الذكاء الاصطناعي يقرأ القائمة ويستخرج الأسماء والأسعار</p>
                        </div>
                      )}

                      {menuStep === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                          <p className="text-sm text-red-700 font-medium">{menuError}</p>
                          <button
                            onClick={() => { setMenuStep('idle'); setMenuError('') }}
                            className="mt-3 text-xs text-red-600 hover:underline font-medium"
                          >
                            حاول مرة ثانية
                          </button>
                        </div>
                      )}

                      {menuStep === 'done' && menuItems.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                              تم استخراج {menuItems.length} عنصر من {menuPhotosCount} صورة ({menuItems.filter(i => i.selected).length} مختار)
                            </span>
                            <button
                              onClick={() => setMenuItems(items => items.map(i => ({ ...i, selected: !items.every(x => x.selected) })))}
                              className="text-xs text-emerald-600 hover:underline font-medium"
                            >
                              {menuItems.every(i => i.selected) ? 'إلغاء الكل' : 'اختيار الكل'}
                            </button>
                          </div>
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                            {menuItems.map((item, i) => (
                              <label
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                  item.selected
                                    ? 'bg-orange-50 border-orange-300'
                                    : 'bg-gray-50/50 border-gray-200 hover:border-orange-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={item.selected}
                                  onChange={() => toggleMenuItem(i)}
                                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium block">{item.name}</span>
                                  {item.description && (
                                    <span className="text-xs text-gray-400 block truncate">{item.description}</span>
                                  )}
                                </div>
                                <div className="text-left shrink-0">
                                  {item.price != null && (
                                    <span className="text-xs font-bold text-orange-600">{item.price} ر.س</span>
                                  )}
                                  {item.category && (
                                    <span className="text-xs text-gray-400 block">{item.category}</span>
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
                      className="w-full mt-5 py-3.5 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
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
                  <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                    <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
                    <p className="font-bold text-gray-800">جاري الاستيراد...</p>
                    <p className="text-sm text-gray-500 mt-1">يتم حفظ المعلومات والمنتجات</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

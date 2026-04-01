import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Store, Package, MessageCircle, CheckCircle, ArrowLeft, Plus, Trash2, Phone, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

const META_APP_ID = '1474338047691178'
const META_CONFIG_ID = '919168294428127'
const SUPABASE_FUNCTIONS_URL = 'https://jchcpswvlpdatudrstzl.supabase.co/functions/v1'

type Step = 'store' | 'products' | 'whatsapp' | 'done'

interface Product {
  id: string
  name: string
  price: string
  description: string
}

export default function Setup() {
  const [currentStep, setCurrentStep] = useState<Step>('store')
  const { store, user, refreshStore } = useAuth()
  const navigate = useNavigate()

  // Store form
  const [storeName, setStoreName] = useState(store?.store_name || '')
  const [businessType, setBusinessType] = useState('')
  const [description, setDescription] = useState('')
  const [workHours, setWorkHours] = useState('')
  const [saving, setSaving] = useState(false)

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' })
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  const [showGoogleImport, setShowGoogleImport] = useState(false)
  const [addingProduct, setAddingProduct] = useState(false)

  // WhatsApp
  const [whatsappConnecting, setWhatsappConnecting] = useState(false)
  const [whatsappConnected, setWhatsappConnected] = useState(store?.whatsapp_connected || false)
  const [fbReady, setFbReady] = useState(false)
  const embeddedSignupData = useRef<{ waba_id?: string; phone_number_id?: string }>({})

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'store', label: 'معلومات المتجر', icon: Store },
    { key: 'products', label: 'أضف منتجاتك', icon: Package },
    { key: 'whatsapp', label: 'ربط الواتساب', icon: MessageCircle },
    { key: 'done', label: 'جاهز!', icon: CheckCircle },
  ]

  const currentIndex = steps.findIndex(s => s.key === currentStep)

  // Load Facebook SDK
  useEffect(() => {
    if (window.FB) {
      setFbReady(true)
      return
    }
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v21.0',
      })
      setFbReady(true)
    }
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  // Session logging — captures WABA ID and Phone Number ID from Embedded Signup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.origin !== 'string' || !event.origin.endsWith('facebook.com')) return
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('[Setup] Embedded Signup event:', data)
          if (data.data?.waba_id) embeddedSignupData.current.waba_id = data.data.waba_id
          if (data.data?.phone_number_id) embeddedSignupData.current.phone_number_id = data.data.phone_number_id
        }
      } catch { /* Not JSON */ }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  async function saveStoreInfo() {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('store_owners').update({
        store_name: storeName,
        business_type: businessType,
        description: description,
        working_hours: workHours,
      }).eq('auth_user_id', user.id)
      goNext()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  function goNext() {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key)
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  // Products
  function addProduct() {
    if (!newProduct.name || !newProduct.price) return
    setAddingProduct(true)
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: newProduct.price,
      description: newProduct.description,
    }
    setProducts([...products, product])
    setNewProduct({ name: '', price: '', description: '' })
    setShowAddProduct(false)
    setAddingProduct(false)
  }

  function removeProduct(id: string) {
    setProducts(products.filter(p => p.id !== id))
  }

  async function saveProducts() {
    if (!store?.id || products.length === 0) {
      goNext()
      return
    }
    setSaving(true)
    try {
      const rows = products.map(p => ({
        store_id: store.id,
        name: p.name,
        price: parseFloat(p.price) || 0,
        description: p.description,
      }))
      await supabase.from('products').insert(rows)
      goNext()
    } catch (err) {
      console.error(err)
      goNext()
    } finally {
      setSaving(false)
    }
  }

  // WhatsApp Embedded Signup
  const connectWhatsApp = useCallback(() => {
    if (!window.FB || !fbReady) {
      alert('جاري تحميل فيسبوك، حاول مرة ثانية')
      return
    }
    setWhatsappConnecting(true)

    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code
          try {
            const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/meta-oauth-callback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code,
                store_id: store?.id,
                waba_id: embeddedSignupData.current.waba_id || null,
                phone_number_id: embeddedSignupData.current.phone_number_id || null,
              }),
            })
            if (res.ok) {
              setWhatsappConnected(true)
              if (refreshStore) await refreshStore()
            } else {
              const err = await res.json()
              console.error('OAuth callback error:', err)
              alert('حصل خطأ في ربط الواتساب، حاول مرة ثانية')
            }
          } catch (err) {
            console.error('Network error:', err)
            alert('خطأ في الاتصال')
          }
        }
        setWhatsappConnecting(false)
      },
      {
        config_id: META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: '3',
        },
      }
    )
  }, [fbReady, store?.id, refreshStore])

  async function finishSetup() {
    if (!user) return
    await supabase.from('store_owners').update({
      setup_completed: true,
    }).eq('auth_user_id', user.id)
    if (refreshStore) await refreshStore()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-primary">رداد ستورز</h1>
          <p className="text-sm text-muted mt-1">إعداد متجرك — {steps[currentIndex].label}</p>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < currentIndex ? 'bg-primary text-white' :
                i === currentIndex ? 'bg-primary text-white' :
                'bg-border text-muted'
              }`}>
                {i < currentIndex ? <CheckCircle size={20} /> : <step.icon size={20} />}
              </div>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-16 h-0.5 ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step: Store Info */}
        {currentStep === 'store' && (
          <div className="bg-surface rounded-2xl border border-border p-8">
            <h2 className="text-xl font-bold mb-2">معلومات متجرك</h2>
            <p className="text-muted text-sm mb-6">هالمعلومات بتساعد الذكاء الاصطناعي يفهم طبيعة متجرك ويرد بشكل أفضل</p>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveStoreInfo() }}>
              <div>
                <label className="block text-sm font-medium mb-1">اسم المتجر</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: مطعم لذة"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع النشاط</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">اختر نوع النشاط...</option>
                  <option value="restaurant">مطعم</option>
                  <option value="cafe">كافيه</option>
                  <option value="bakery">حلويات ومخبوزات</option>
                  <option value="salon">صالون تجميل</option>
                  <option value="clinic">عيادة</option>
                  <option value="retail">محل بيع بالتجزئة</option>
                  <option value="clothing">ملابس وأزياء</option>
                  <option value="electronics">إلكترونيات</option>
                  <option value="services">خدمات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وصف قصير عن متجرك</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: مطعم سعودي متخصص في الكبسة والمندي، عندنا فرعين في الرياض..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ساعات العمل</label>
                <input
                  type="text"
                  value={workHours}
                  onChange={e => setWorkHours(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: يومياً من ٩ ص لـ١٢ م، الجمعة مغلق"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !storeName}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'التالي'}
              </button>
            </form>
          </div>
        )}

        {/* Step: Products */}
        {currentStep === 'products' && (
          <div className="bg-surface rounded-2xl border border-border p-8">
            <h2 className="text-xl font-bold mb-2">أضف منتجاتك</h2>
            <p className="text-muted text-sm mb-6">أضف منتجاتك أو خدماتك عشان الذكاء الاصطناعي يقدر يجاوب عنها</p>

            {/* Added products list */}
            {products.length > 0 && (
              <div className="space-y-2 mb-6">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted">{p.price} ريال {p.description && `— ${p.description}`}</p>
                    </div>
                    <button onClick={() => removeProduct(p.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add product form */}
            {showAddProduct && (
              <div className="bg-background border border-primary/30 rounded-xl p-5 mb-4 space-y-3">
                <h3 className="font-medium text-sm mb-2">منتج جديد</h3>
                <div>
                  <label className="block text-xs text-muted mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="مثال: كيكة شوكولاتة"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">السعر (ريال) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="120"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">وصف (اختياري)</label>
                  <input
                    type="text"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="كيكة بلجيكية فاخرة تكفي ١٢ شخص"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addProduct}
                    disabled={!newProduct.name || !newProduct.price}
                    className="flex-1 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    أضف
                  </button>
                  <button
                    onClick={() => { setShowAddProduct(false); setNewProduct({ name: '', price: '', description: '' }) }}
                    className="py-2 px-4 border border-border text-sm rounded-lg hover:bg-surface transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Google Maps import */}
            {showGoogleImport && (
              <div className="bg-background border border-primary/30 rounded-xl p-5 mb-4 space-y-3">
                <h3 className="font-medium text-sm mb-2">استيراد من قوقل ماب</h3>
                <div>
                  <label className="block text-xs text-muted mb-1">رابط قوقل ماب</label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={e => setGoogleMapsUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted">هالخاصية قريباً بتكون متوفرة، الحين أضف منتجاتك يدوياً</p>
                <button
                  onClick={() => { setShowGoogleImport(false); setGoogleMapsUrl('') }}
                  className="py-2 px-4 border border-border text-sm rounded-lg hover:bg-surface transition-colors"
                >
                  إغلاق
                </button>
              </div>
            )}

            {/* Action buttons */}
            {!showAddProduct && !showGoogleImport && (
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => { setShowAddProduct(true); setShowGoogleImport(false) }}
                  className="w-full p-4 bg-background border-2 border-dashed border-primary/30 rounded-xl text-right hover:border-primary/60 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">إضافة يدوياً</p>
                      <p className="text-sm text-muted">أضف منتجاتك وحدة وحدة مع الأسعار</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setShowGoogleImport(true); setShowAddProduct(false) }}
                  className="w-full p-4 bg-background border-2 border-dashed border-primary/30 rounded-xl text-right hover:border-primary/60 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="text-primary" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">استيراد من قوقل ماب</p>
                      <p className="text-sm text-muted">حط رابط متجرك من قوقل ماب وبنستورد المعلومات</p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            <p className="text-sm text-muted text-center mb-4">
              {products.length > 0
                ? `تم إضافة ${products.length} منتج`
                : 'تقدر تضيف المنتجات لاحقاً من لوحة التحكم'
              }
            </p>

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-3 border border-border rounded-lg hover:bg-background transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={16} className="rotate-180" />
                رجوع
              </button>
              <button
                onClick={saveProducts}
                disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'التالي'}
              </button>
            </div>
          </div>
        )}

        {/* Step: WhatsApp */}
        {currentStep === 'whatsapp' && (
          <div className="bg-surface rounded-2xl border border-border p-8">
            <h2 className="text-xl font-bold mb-2">ربط الواتساب</h2>
            <p className="text-muted text-sm mb-6">وصّل رقم الواتساب عشان الذكاء الاصطناعي يبدأ يرد على عملائك</p>

            <div className="bg-background rounded-xl p-6 mb-6">
              {whatsappConnected ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg text-green-700 mb-1">تم ربط الواتساب بنجاح!</h3>
                  <p className="text-sm text-muted">الذكاء الاصطناعي جاهز يرد على عملائك</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone size={28} className="text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2">اربط واتساب للأعمال</h3>
                  <p className="text-sm text-muted mb-6">اضغط الزر وسجّل دخول بحسابك في فيسبوك. العملية تاخذ دقيقة وحدة.</p>

                  <button
                    onClick={connectWhatsApp}
                    disabled={whatsappConnecting || !fbReady}
                    className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-lg hover:bg-[#20bd5a] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {whatsappConnecting ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        جاري الربط...
                      </>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        ربط واتساب
                      </>
                    )}
                  </button>

                  <p className="text-xs text-muted mt-4">تحتاج حساب Meta Business وخط واتساب للأعمال</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-3 border border-border rounded-lg hover:bg-background transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={16} className="rotate-180" />
                رجوع
              </button>
              <button onClick={goNext} className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                {whatsappConnected ? 'التالي' : 'التالي'}
              </button>
              {!whatsappConnected && (
                <button onClick={goNext} className="py-3 px-4 text-muted hover:text-secondary text-sm transition-colors">
                  تخطي
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step: Done */}
        {currentStep === 'done' && (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">متجرك جاهز!</h2>
            <p className="text-muted mb-4">
              تم إعداد متجرك بنجاح. الذكاء الاصطناعي جاهز يبدأ يرد على عملائك.
            </p>

            {products.length > 0 && (
              <p className="text-sm text-primary mb-2">تم إضافة {products.length} منتج</p>
            )}
            {whatsappConnected && (
              <p className="text-sm text-green-600 mb-2">تم ربط واتساب بنجاح</p>
            )}

            <button
              onClick={finishSetup}
              className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-medium text-lg hover:bg-primary-dark transition-colors"
            >
              ادخل لوحة التحكم
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

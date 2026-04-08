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

const META_APP_ID = '832615316524558'
const META_CONFIG_ID = '931322849541908'
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

  const inputClass = "w-full pr-12 pl-4 py-3.5 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
  const inputClassSimple = "w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Cairo, sans-serif' }}>رداد ستورز</h1>
            <p className="text-xs text-gray-400 mt-0.5">إعداد متجرك</p>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {currentIndex + 1} / {steps.length}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Premium Progress Bar */}
        <div className="mb-10 animate-fade-in">
          {/* Progress line */}
          <div className="relative flex items-center justify-between mb-2">
            {/* Background line */}
            <div className="absolute top-5 right-5 left-5 h-0.5 bg-gray-200 rounded-full" />
            {/* Active line */}
            <div
              className="absolute top-5 right-5 h-0.5 bg-gradient-to-l from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, i) => {
              const isCompleted = i < currentIndex
              const isActive = i === currentIndex
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-200'
                      : isActive
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-100'
                        : 'bg-white text-gray-300 border-2 border-gray-200'
                  }`}>
                    {isCompleted ? <CheckCircle size={20} /> : <step.icon size={18} />}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors hidden sm:block ${
                    isActive ? 'text-emerald-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step: Store Info */}
        {currentStep === 'store' && (
          <div className="glass rounded-3xl border border-white/60 p-8 shadow-xl shadow-gray-200/40 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <Store size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">معلومات متجرك</h2>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-8 mr-13">هالمعلومات بتساعد الذكاء الاصطناعي يفهم طبيعة متجرك ويرد بشكل أفضل</p>

            <form className="space-y-5" onSubmit={e => { e.preventDefault(); saveStoreInfo() }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Store size={18} />
                  </div>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className={inputClass}
                    placeholder="مثال: مطعم لذة"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع النشاط</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className={inputClassSimple}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف قصير عن متجرك</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={inputClassSimple}
                  placeholder="مثال: مطعم سعودي متخصص في الكبسة والمندي، عندنا فرعين في الرياض..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ساعات العمل</label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={workHours}
                    onChange={e => setWorkHours(e.target.value)}
                    className={inputClass}
                    placeholder="مثال: يومياً من ٩ ص لـ١٢ م، الجمعة مغلق"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !storeName}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    التالي
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step: Products */}
        {currentStep === 'products' && (
          <div className="glass rounded-3xl border border-white/60 p-8 shadow-xl shadow-gray-200/40 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">أضف منتجاتك</h2>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-8 mr-13">أضف منتجاتك أو خدماتك عشان الذكاء الاصطناعي يقدر يجاوب عنها</p>

            {/* Added products list */}
            {products.length > 0 && (
              <div className="space-y-2 mb-6">
                {products.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between bg-white/60 border border-gray-100 rounded-xl px-5 py-4 card-hover animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.price} ريال {p.description && `- ${p.description}`}</p>
                      </div>
                    </div>
                    <button onClick={() => removeProduct(p.id)} className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add product form */}
            {showAddProduct && (
              <div className="bg-white/80 border border-emerald-100 rounded-2xl p-6 mb-6 space-y-4 animate-scale-in">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Plus size={14} className="text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-700">منتج جديد</h3>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">اسم المنتج *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    placeholder="مثال: كيكة شوكولاتة"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">السعر (ريال) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    placeholder="120"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">وصف (اختياري)</label>
                  <input
                    type="text"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    placeholder="كيكة بلجيكية فاخرة تكفي ١٢ شخص"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={addProduct}
                    disabled={!newProduct.name || !newProduct.price}
                    className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    أضف المنتج
                  </button>
                  <button
                    onClick={() => { setShowAddProduct(false); setNewProduct({ name: '', price: '', description: '' }) }}
                    className="py-2.5 px-5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Google Maps import */}
            {showGoogleImport && (
              <div className="bg-white/80 border border-emerald-100 rounded-2xl p-6 mb-6 space-y-4 animate-scale-in">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" className="text-blue-600" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm text-gray-700">استيراد من قوقل ماب</h3>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">رابط قوقل ماب</label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={e => setGoogleMapsUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-gray-400">هالخاصية قريبا بتكون متوفرة، الحين أضف منتجاتك يدويا</p>
                <button
                  onClick={() => { setShowGoogleImport(false); setGoogleMapsUrl('') }}
                  className="py-2.5 px-5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                >
                  إغلاق
                </button>
              </div>
            )}

            {/* Action buttons */}
            {!showAddProduct && !showGoogleImport && (
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => { setShowAddProduct(true); setShowGoogleImport(false) }}
                  className="p-5 bg-white/60 border-2 border-dashed border-emerald-200 rounded-2xl text-right hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group card-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-100 transition-colors">
                      <Plus size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-700">إضافة يدويا</p>
                      <p className="text-xs text-gray-400">أضف منتجاتك مع الأسعار</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setShowGoogleImport(true); setShowAddProduct(false) }}
                  className="p-5 bg-white/60 border-2 border-dashed border-gray-200 rounded-2xl text-right hover:border-blue-300 hover:bg-blue-50/50 transition-all group card-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-sky-50 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-sky-100 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="text-blue-600" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-700">استيراد من قوقل</p>
                      <p className="text-xs text-gray-400">حط رابط متجرك من قوقل ماب</p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Products count */}
            <div className="text-center mb-6">
              {products.length > 0 ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
                  <Package size={14} />
                  تم إضافة {products.length} منتج
                </span>
              ) : (
                <p className="text-sm text-gray-400">تقدر تضيف المنتجات لاحقا من لوحة التحكم</p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-600 font-medium text-sm">
                <ArrowLeft size={16} className="rotate-180" />
                رجوع
              </button>
              <button
                onClick={saveProducts}
                disabled={saving}
                className="btn-primary flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    التالي
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: WhatsApp */}
        {currentStep === 'whatsapp' && (
          <div className="glass rounded-3xl border border-white/60 p-8 shadow-xl shadow-gray-200/40 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <MessageCircle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">ربط الواتساب</h2>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-8 mr-13">وصّل رقم الواتساب عشان الذكاء الاصطناعي يبدأ يرد على عملائك</p>

            <div className="bg-white/70 rounded-2xl p-8 mb-6 border border-gray-100">
              {whatsappConnected ? (
                <div className="text-center py-6 animate-scale-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-100">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2">تم ربط الواتساب بنجاح!</h3>
                  <p className="text-sm text-gray-500">الذكاء الاصطناعي جاهز يرد على عملائك</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    متصل
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Phone size={32} className="text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">اربط واتساب للأعمال</h3>
                  <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">اضغط الزر وسجّل دخول بحسابك في فيسبوك. العملية تاخذ دقيقة وحدة.</p>

                  {/* Status indicators */}
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      غير متصل
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      اتصال آمن
                    </div>
                  </div>

                  <button
                    onClick={connectWhatsApp}
                    disabled={whatsappConnecting || !fbReady}
                    className="w-full max-w-sm mx-auto py-4 bg-[#25D366] text-white rounded-2xl font-bold text-lg hover:bg-[#20bd5a] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-200 hover:-translate-y-0.5"
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

                  <p className="text-xs text-gray-400 mt-5">تحتاج حساب Meta Business وخط واتساب للأعمال</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-600 font-medium text-sm">
                <ArrowLeft size={16} className="rotate-180" />
                رجوع
              </button>
              <button onClick={goNext} className="btn-primary flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                التالي
                <ArrowLeft size={16} />
              </button>
              {!whatsappConnected && (
                <button onClick={goNext} className="py-3.5 px-5 text-gray-400 hover:text-gray-600 text-sm transition-colors rounded-xl hover:bg-gray-50">
                  تخطي
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step: Done */}
        {currentStep === 'done' && (
          <div className="glass rounded-3xl border border-white/60 p-10 shadow-xl shadow-gray-200/40 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 animate-scale-in">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Cairo, sans-serif' }}>متجرك جاهز!</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              تم إعداد متجرك بنجاح. الذكاء الاصطناعي جاهز يبدأ يرد على عملائك.
            </p>

            {/* Status badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {products.length > 0 && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium animate-fade-in">
                  <Package size={14} />
                  {products.length} منتج
                </span>
              )}
              {whatsappConnected && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium animate-fade-in">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  واتساب متصل
                </span>
              )}
            </div>

            <button
              onClick={finishSetup}
              className="btn-primary px-12 py-4 rounded-2xl font-bold text-base inline-flex items-center gap-3 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all"
            >
              ادخل لوحة التحكم
              <ArrowLeft size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

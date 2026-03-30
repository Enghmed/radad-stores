import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Store, Package, MessageCircle, CheckCircle, ArrowLeft } from 'lucide-react'

type Step = 'store' | 'products' | 'whatsapp' | 'done'

export default function Setup() {
  const [currentStep, setCurrentStep] = useState<Step>('store')
  const { store } = useAuth()
  const navigate = useNavigate()

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'store', label: 'معلومات المتجر', icon: Store },
    { key: 'products', label: 'أضف منتجاتك', icon: Package },
    { key: 'whatsapp', label: 'ربط الواتساب', icon: MessageCircle },
    { key: 'done', label: 'جاهز!', icon: CheckCircle },
  ]

  const currentIndex = steps.findIndex(s => s.key === currentStep)

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
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); goNext() }}>
              <div>
                <label className="block text-sm font-medium mb-1">اسم المتجر</label>
                <input
                  type="text"
                  defaultValue={store?.store_name || ''}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: مطعم لذة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع النشاط</label>
                <select className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">اختر نوع النشاط...</option>
                  <option value="restaurant">مطعم</option>
                  <option value="cafe">كافيه</option>
                  <option value="salon">صالون تجميل</option>
                  <option value="clinic">عيادة</option>
                  <option value="retail">محل بيع بالتجزئة</option>
                  <option value="services">خدمات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وصف قصير عن متجرك</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: مطعم سعودي متخصص في الكبسة والمندي، عندنا فرعين في الرياض..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ساعات العمل</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: يومياً من ٩ ص لـ١٢ م، الجمعة مغلق"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                التالي
              </button>
            </form>
          </div>
        )}

        {/* Step: Products */}
        {currentStep === 'products' && (
          <div className="bg-surface rounded-2xl border border-border p-8">
            <h2 className="text-xl font-bold mb-2">أضف منتجاتك</h2>
            <p className="text-muted text-sm mb-6">أضف منتجاتك أو خدماتك عشان الذكاء الاصطناعي يقدر يجاوب عنها</p>

            <div className="space-y-4 mb-6">
              <button className="w-full p-4 bg-background border border-border rounded-xl text-right hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Package size={24} className="text-primary" />
                  <div>
                    <p className="font-medium">إضافة يدوياً</p>
                    <p className="text-sm text-muted">أضف منتجاتك وحدة وحدة مع الأسعار</p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 bg-background border border-border rounded-xl text-right hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" className="text-primary" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div>
                    <p className="font-medium">استيراد من قوقل ماب</p>
                    <p className="text-sm text-muted">حط رابط متجرك من قوقل ماب وبنستورد المعلومات</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-sm text-muted text-center mb-4">تقدر تضيف المنتجات لاحقاً من لوحة التحكم</p>

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-3 border border-border rounded-lg hover:bg-background transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={16} className="rotate-180" />
                رجوع
              </button>
              <button onClick={goNext} className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                التالي
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
              <p className="text-sm text-muted mb-4">تقدر تربط الواتساب الحين أو لاحقاً من لوحة التحكم</p>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="من حساب Meta Business"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Access Token</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="EAAxxxxxxx..."
                    dir="ltr"
                  />
                </div>
              </form>
            </div>

            <div className="flex gap-3">
              <button onClick={goBack} className="flex-1 py-3 border border-border rounded-lg hover:bg-background transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={16} className="rotate-180" />
                رجوع
              </button>
              <button onClick={goNext} className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                التالي
              </button>
              <button onClick={goNext} className="py-3 px-4 text-muted hover:text-secondary text-sm transition-colors">
                تخطي
              </button>
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
            <p className="text-muted mb-8">
              تم إعداد متجرك بنجاح. الذكاء الاصطناعي جاهز يبدأ يرد على عملائك.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-primary text-white rounded-xl font-medium text-lg hover:bg-primary-dark transition-colors"
            >
              ادخل لوحة التحكم
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Store, Bot, Bell, Globe, CheckCircle, Loader2, Sparkles, SmilePlus, Briefcase, Zap } from 'lucide-react'

const toneOptions = [
  {
    value: 'friendly',
    label: 'ودّي وعامّي',
    description: 'مناسب للمطاعم والكافيهات',
    icon: SmilePlus,
    emoji: '😊',
  },
  {
    value: 'professional',
    label: 'رسمي ومهني',
    description: 'مناسب للعيادات والمكاتب',
    icon: Briefcase,
    emoji: '💼',
  },
  {
    value: 'casual',
    label: 'شبابي وخفيف',
    description: 'مناسب للمتاجر الشبابية',
    icon: Zap,
    emoji: '⚡',
  },
]

export default function SettingsPage() {
  const { store, user, refreshStore } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  // Store form state
  const [storeName, setStoreName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [description, setDescription] = useState('')

  // AI form state
  const [aiTone, setAiTone] = useState('friendly')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [aiInstructions, setAiInstructions] = useState('')

  // Language form state
  const [dashboardLang, setDashboardLang] = useState('ar')
  const [aiLang, setAiLang] = useState('ar-sa')

  // Load store data into form when store loads
  useEffect(() => {
    if (store) {
      setStoreName(store.store_name || '')
      setBusinessType(store.business_type || '')
      setDescription(store.description || '')
    }
  }, [store])

  async function saveStoreSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    setSavingSection('store')

    const { error } = await supabase
      .from('store_owners')
      .update({
        store_name: storeName,
        business_type: businessType,
        description: description,
      })
      .eq('auth_user_id', user.id)

    if (!error) {
      setSaved(true)
      await refreshStore?.()
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
    setSavingSection(null)
  }

  async function saveAiSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    setSavingSection('ai')

    const { error } = await supabase
      .from('store_owners')
      .update({
        ai_tone: aiTone,
        ai_welcome_message: welcomeMessage,
        ai_custom_instructions: aiInstructions,
      })
      .eq('auth_user_id', user.id)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
    setSavingSection(null)
  }

  return (
    <DashboardLayout>
      <div dir="rtl" className="font-[Cairo] max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-500 mt-2 text-base">تخصيص إعدادات متجرك والذكاء الاصطناعي</p>
        </div>

        {/* Success message */}
        {saved && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <span className="text-sm text-emerald-800 font-medium">تم حفظ التغييرات بنجاح</span>
          </div>
        )}

        {/* Store Info Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-fade-in-up card-hover">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Store size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">معلومات المتجر</h2>
              <p className="text-xs text-gray-400 mt-0.5">البيانات الأساسية لمتجرك</p>
            </div>
          </div>
          <form className="space-y-5" onSubmit={saveStoreSettings}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المتجر</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-gray-800 placeholder:text-gray-400"
                placeholder="مثال: حلويات الريان"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">نوع النشاط</label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-gray-800 appearance-none"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف المتجر</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                placeholder="وصف قصير يساعد الذكاء الاصطناعي يفهم طبيعة متجرك"
              />
            </div>
            <button
              type="submit"
              disabled={saving && savingSection === 'store'}
              className="px-8 py-3 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              {saving && savingSection === 'store' ? <><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</> : 'حفظ التغييرات'}
            </button>
          </form>
        </div>

        {/* AI Settings Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-fade-in-up card-hover" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Bot size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">إعدادات الذكاء الاصطناعي</h2>
              <p className="text-xs text-gray-400 mt-0.5">تحكم بأسلوب ونبرة الردود</p>
            </div>
          </div>
          <form className="space-y-6" onSubmit={saveAiSettings}>
            {/* Tone Selector - Visual Radio Cards */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">نبرة الرد</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {toneOptions.map(tone => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => setAiTone(tone.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-right ${
                      aiTone === tone.value
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    {aiTone === tone.value && (
                      <div className="absolute top-2 left-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                    <span className="text-2xl mb-2 block">{tone.emoji}</span>
                    <p className="font-bold text-sm text-gray-900">{tone.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{tone.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة الترحيب</label>
              <textarea
                rows={2}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                placeholder="هلا وغلا! كيف أقدر أساعدك؟"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  تعليمات إضافية للذكاء الاصطناعي
                  <Sparkles size={14} className="text-amber-500" />
                </span>
              </label>
              <textarea
                rows={3}
                value={aiInstructions}
                onChange={e => setAiInstructions(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                placeholder="مثال: لا تعطي خصم أبداً، دائماً وجّه العميل للفرع الرئيسي..."
              />
            </div>
            <button
              type="submit"
              disabled={saving && savingSection === 'ai'}
              className="px-8 py-3 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              {saving && savingSection === 'ai' ? <><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</> : 'حفظ التغييرات'}
            </button>
          </form>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-fade-in-up card-hover" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bell size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">إعدادات الإشعارات</h2>
              <p className="text-xs text-gray-400 mt-0.5">تحكم بالإشعارات اللي توصلك</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div>
                <p className="font-semibold text-sm text-gray-900">إشعارات تلقرام</p>
                <p className="text-xs text-gray-500 mt-1">استلم إشعار لما الذكاء الاصطناعي يحتاج مساعدتك</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-[-24px]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div>
                <p className="font-semibold text-sm text-gray-900">تقرير يومي</p>
                <p className="text-xs text-gray-500 mt-1">ملخص يومي بعدد المحادثات والأسئلة الجديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-[-24px]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-fade-in-up card-hover" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">إعدادات اللغة</h2>
              <p className="text-xs text-gray-400 mt-0.5">لغة لوحة التحكم وردود الذكاء الاصطناعي</p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">لغة لوحة التحكم</label>
              <select
                value={dashboardLang}
                onChange={e => setDashboardLang(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-gray-800 appearance-none"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">لغة ردود الذكاء الاصطناعي</label>
              <select
                value={aiLang}
                onChange={e => setAiLang(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-gray-800 appearance-none"
              >
                <option value="ar-sa">عربي سعودي (عامّي)</option>
                <option value="ar">عربي فصحى</option>
                <option value="en">English</option>
                <option value="auto">تلقائي (حسب لغة العميل)</option>
              </select>
            </div>
            <button className="px-8 py-3 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

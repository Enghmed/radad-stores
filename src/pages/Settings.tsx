import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Store, Bot, Bell, Globe, CheckCircle, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { store, user, refreshStore } = useAuth()
  const [activeTab, setActiveTab] = useState('store')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
  }

  async function saveAiSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)

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
  }

  const tabs = [
    { key: 'store', label: 'المتجر', icon: Store },
    { key: 'ai', label: 'الذكاء الاصطناعي', icon: Bot },
    { key: 'notifications', label: 'الإشعارات', icon: Bell },
    { key: 'language', label: 'اللغة', icon: Globe },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-muted mt-1">تخصيص إعدادات متجرك والذكاء الاصطناعي</p>
      </div>

      {/* Success message */}
      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500" />
          <span className="text-sm text-green-800">تم حفظ التغييرات بنجاح</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-muted hover:text-secondary'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === 'store' && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">معلومات المتجر</h2>
          <form className="space-y-4 max-w-lg" onSubmit={saveStoreSettings}>
            <div>
              <label className="block text-sm font-medium mb-1">اسم المتجر</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="مثال: حلويات الريان"
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
              <label className="block text-sm font-medium mb-1">وصف المتجر</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="وصف قصير يساعد الذكاء الاصطناعي يفهم طبيعة متجرك"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</> : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      )}

      {/* AI Settings */}
      {activeTab === 'ai' && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">إعدادات الذكاء الاصطناعي</h2>
          <form className="space-y-6 max-w-lg" onSubmit={saveAiSettings}>
            <div>
              <label className="block text-sm font-medium mb-1">نبرة الرد</label>
              <select
                value={aiTone}
                onChange={e => setAiTone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="friendly">ودّي وعامّي (مناسب للمطاعم والكافيهات)</option>
                <option value="professional">رسمي ومهني (مناسب للعيادات والمكاتب)</option>
                <option value="casual">شبابي وخفيف</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رسالة الترحيب</label>
              <textarea
                rows={2}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="هلا وغلا! كيف أقدر أساعدك؟"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تعليمات إضافية للذكاء الاصطناعي</label>
              <textarea
                rows={3}
                value={aiInstructions}
                onChange={e => setAiInstructions(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="مثال: لا تعطي خصم أبداً، دائماً وجّه العميل للفرع الرئيسي..."
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</> : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">إعدادات الإشعارات</h2>
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-sm">إشعارات تلقرام</p>
                <p className="text-xs text-muted mt-1">استلم إشعار لما الذكاء الاصطناعي يحتاج مساعدتك</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-20px]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-sm">تقرير يومي</p>
                <p className="text-xs text-muted mt-1">ملخص يومي بعدد المحادثات والأسئلة الجديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-20px]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Language */}
      {activeTab === 'language' && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">إعدادات اللغة</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">لغة لوحة التحكم</label>
              <select
                value={dashboardLang}
                onChange={e => setDashboardLang(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">لغة ردود الذكاء الاصطناعي</label>
              <select
                value={aiLang}
                onChange={e => setAiLang(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="ar-sa">عربي سعودي (عامّي)</option>
                <option value="ar">عربي فصحى</option>
                <option value="en">English</option>
                <option value="auto">تلقائي (حسب لغة العميل)</option>
              </select>
            </div>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              حفظ التغييرات
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

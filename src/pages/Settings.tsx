import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Store, Bot, Bell, Globe } from 'lucide-react'

export default function SettingsPage() {
  const { store } = useAuth()
  const [activeTab, setActiveTab] = useState('store')

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
          <form className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المتجر</label>
              <input
                type="text"
                defaultValue={store?.store_name || ''}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نوع النشاط</label>
              <input
                type="text"
                defaultValue={store?.business_type || ''}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="مثال: مطعم، كافيه، صالون..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">وصف المتجر</label>
              <textarea
                rows={3}
                defaultValue={store?.description || ''}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="وصف قصير يساعد الذكاء الاصطناعي يفهم طبيعة متجرك"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              حفظ التغييرات
            </button>
          </form>
        </div>
      )}

      {/* AI Settings */}
      {activeTab === 'ai' && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">إعدادات الذكاء الاصطناعي</h2>
          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">نبرة الرد</label>
              <select className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="friendly">ودّي وعامّي (مناسب للمطاعم والكافيهات)</option>
                <option value="professional">رسمي ومهني (مناسب للعيادات والمكاتب)</option>
                <option value="casual">شبابي وخفيف</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رسالة الترحيب</label>
              <textarea
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="هلا وغلا! كيف أقدر أساعدك؟"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تعليمات إضافية للذكاء الاصطناعي</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="مثال: لا تعطي خصم أبداً، دائماً وجّه العميل للفرع الرئيسي..."
              />
            </div>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              حفظ التغييرات
            </button>
          </div>
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
              <select className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">لغة ردود الذكاء الاصطناعي</label>
              <select className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
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

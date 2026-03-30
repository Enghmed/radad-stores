import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { MessageCircle, CheckCircle, ExternalLink, Copy } from 'lucide-react'

export default function WhatsAppPage() {
  const { store } = useAuth()
  const isConnected = store?.whatsapp_connected || false

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ربط الواتساب</h1>
        <p className="text-muted mt-1">وصّل رقم الواتساب عشان الذكاء الاصطناعي يبدأ يرد على عملائك</p>
      </div>

      {isConnected ? (
        <div className="bg-surface rounded-xl border border-border p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">الواتساب متصل!</h2>
              <p className="text-sm text-muted">الذكاء الاصطناعي يرد على عملائك الحين</p>
            </div>
          </div>

          <div className="bg-background rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">رقم الواتساب</span>
              <span className="font-medium" dir="ltr">{store?.whatsapp_number || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">الحالة</span>
              <span className="text-sm text-primary font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                نشط
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step by step guide */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold mb-4">خطوات ربط الواتساب</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-sm font-bold">١</div>
                <div>
                  <h3 className="font-medium">أنشئ حساب Meta Business</h3>
                  <p className="text-sm text-muted mt-1">ادخل على business.facebook.com وأنشئ حساب أعمال لو ما عندك</p>
                  <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline">
                    Meta Business <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-sm font-bold">٢</div>
                <div>
                  <h3 className="font-medium">فعّل WhatsApp Business API</h3>
                  <p className="text-sm text-muted mt-1">من Meta Business، أضف تطبيق واتساب وأضف رقم جوالك</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-sm font-bold">٣</div>
                <div>
                  <h3 className="font-medium">أضف رابط الـWebhook</h3>
                  <p className="text-sm text-muted mt-1">في إعدادات الواتساب، أضف الرابط التالي كـ Webhook URL:</p>
                  <div className="flex items-center gap-2 mt-2 bg-background rounded-lg p-3">
                    <code className="text-sm flex-1" dir="ltr">https://api-stores.radadai.com/functions/v1/whatsapp-webhook</code>
                    <button className="p-1 text-muted hover:text-secondary transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-sm font-bold">٤</div>
                <div>
                  <h3 className="font-medium">أدخل بيانات الـ API</h3>
                  <p className="text-sm text-muted mt-1">أدخل Phone Number ID و Access Token من حسابك في Meta</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Credentials Form */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold mb-4">بيانات WhatsApp API</h2>
            <form className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: 123456789012345"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Business Account ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: 123456789012345"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Access Token</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="EAAxxxxxxx..."
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                ربط الواتساب
              </button>
            </form>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <MessageCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">تحتاج مساعدة؟</p>
              <p className="text-sm text-blue-700 mt-1">تواصل معنا على تلقرام وبنساعدك نربط الواتساب خلال دقائق</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

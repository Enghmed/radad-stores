import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { CreditCard, CheckCircle, AlertTriangle, Zap } from 'lucide-react'

export default function Subscription() {
  const { store } = useAuth()

  // Placeholder data — will be connected to Supabase later
  const plan = {
    type: 'trial' as 'trial' | 'monthly' | 'yearly',
    status: 'active',
    replies_used: 0,
    replies_limit: 100,
    trial_days_left: 10,
    expires_at: null as string | null,
  }

  const isTrialExpired = plan.type === 'trial' && plan.trial_days_left <= 0
  const usagePercent = Math.round((plan.replies_used / plan.replies_limit) * 100)

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الاشتراك</h1>
        <p className="text-muted mt-1">إدارة اشتراكك والاستخدام</p>
      </div>

      {/* Current Plan */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">خطتك الحالية</h2>
          {plan.type === 'trial' && (
            <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full font-medium">
              تجربة مجانية
            </span>
          )}
          {plan.type !== 'trial' && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium flex items-center gap-1">
              <CheckCircle size={14} />
              {plan.type === 'monthly' ? 'شهري' : 'سنوي'}
            </span>
          )}
        </div>

        {plan.type === 'trial' && !isTrialExpired && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-accent" />
              <span className="font-medium text-sm">متبقي {plan.trial_days_left} أيام من التجربة المجانية</span>
            </div>
            <p className="text-xs text-muted">اشترك قبل انتهاء التجربة عشان ما ينقطع الذكاء الاصطناعي عن الرد</p>
          </div>
        )}

        {isTrialExpired && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-danger" />
              <span className="font-medium text-sm text-danger">انتهت التجربة المجانية</span>
            </div>
            <p className="text-xs text-muted">الذكاء الاصطناعي متوقف عن الرد. اشترك الحين عشان يرجع يشتغل</p>
          </div>
        )}

        {/* Usage */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">الردود المستخدمة هالشهر</span>
            <span className="font-medium">{plan.replies_used.toLocaleString('ar-SA')} / {plan.replies_limit.toLocaleString('ar-SA')}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${usagePercent > 90 ? 'bg-danger' : usagePercent > 70 ? 'bg-accent' : 'bg-primary'}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <h2 className="text-lg font-bold mb-4">اختر خطتك</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Monthly */}
        <div className={`bg-surface rounded-xl border p-6 cursor-pointer transition-all ${plan.type === 'monthly' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
          <h3 className="font-bold text-lg mb-1">شهري</h3>
          <p className="text-3xl font-bold text-primary mb-1">١٠٠ <span className="text-base font-normal">ريال/شهر</span></p>
          <ul className="text-sm text-muted space-y-1 mt-3 mb-4">
            <li>١٠,٠٠٠ رد بالشهر</li>
            <li>منتجات غير محدودة</li>
            <li>قاعدة معرفة ذكية</li>
            <li>دعم فني</li>
          </ul>
          <button className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            اشترك شهرياً
          </button>
        </div>

        {/* Yearly */}
        <div className={`bg-surface rounded-xl border p-6 cursor-pointer transition-all relative ${plan.type === 'yearly' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
            وفّر شهرين
          </span>
          <h3 className="font-bold text-lg mb-1">سنوي</h3>
          <p className="text-3xl font-bold text-primary mb-1">١,٠٠٠ <span className="text-base font-normal">ريال/سنة</span></p>
          <p className="text-xs text-muted">(٨٣ ريال/شهر)</p>
          <ul className="text-sm text-muted space-y-1 mt-3 mb-4">
            <li>١٠,٠٠٠ رد بالشهر</li>
            <li>منتجات غير محدودة</li>
            <li>قاعدة معرفة ذكية</li>
            <li>دعم فني + أولوية</li>
          </ul>
          <button className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            اشترك سنوياً
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={20} className="text-primary" />
          <h2 className="text-lg font-bold">طريقة الدفع</h2>
        </div>
        <p className="text-sm text-muted">
          الدفع عن طريق Moyasar — يدعم مدى، فيزا، ماستركارد، Apple Pay، STC Pay
        </p>
        <div className="flex gap-3 mt-4">
          <div className="px-3 py-1 bg-background rounded border border-border text-xs font-medium">مدى</div>
          <div className="px-3 py-1 bg-background rounded border border-border text-xs font-medium">Visa</div>
          <div className="px-3 py-1 bg-background rounded border border-border text-xs font-medium">Mastercard</div>
          <div className="px-3 py-1 bg-background rounded border border-border text-xs font-medium">Apple Pay</div>
          <div className="px-3 py-1 bg-background rounded border border-border text-xs font-medium">STC Pay</div>
        </div>
      </div>
    </DashboardLayout>
  )
}

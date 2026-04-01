import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { CreditCard, CheckCircle, AlertTriangle, Zap, Loader2, Shield } from 'lucide-react'

// Moyasar config — use TEST keys for testing, switch to LIVE for production
const MOYASAR_PUBLISHABLE_KEY = import.meta.env.VITE_MOYASAR_KEY || 'pk_test_cdiDBmmVM8oLjpvxgnVjikCVcFKM4cuuGjZC9SG6'
const PAYMENT_CALLBACK_URL = `${window.location.origin}/subscription?payment=callback`
const FUNCTIONS_URL = 'https://jchcpswvlpdatudrstzl.supabase.co/functions/v1'

declare global {
  interface Window {
    Moyasar: any
  }
}

export default function Subscription() {
  const { store, user, refreshStore } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const formRef = useRef<HTMLDivElement>(null)
  const moyasarLoaded = useRef(false)

  // Calculate plan info
  const plan = store?.plan || 'trial'
  const trialStarted = store?.trial_started_at ? new Date(store.trial_started_at as string) : new Date()
  const trialEnds = store?.trial_ends_at ? new Date(store.trial_ends_at as string) : new Date(trialStarted.getTime() + 10 * 24 * 60 * 60 * 1000)
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
  const isTrialExpired = plan === 'trial' && trialDaysLeft <= 0
  const planExpiresAt = (store as any)?.plan_expires_at ? new Date((store as any).plan_expires_at) : null

  // Check for payment callback — verify payment SERVER-SIDE before updating plan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'callback') {
      const paymentId = params.get('id')
      const status = params.get('status')

      if (status === 'paid' && paymentId) {
        // SECURITY: Do NOT trust URL params. Call edge function to verify with Moyasar API
        const verifyPayment = async () => {
          if (!store?.id) return
          try {
            const res = await fetch(`${FUNCTIONS_URL}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payment_id: paymentId, store_id: store.id }),
            })
            const result = await res.json()
            if (result.verified && result.status === 'paid') {
              setPaymentSuccess(true)
              refreshStore?.()
            } else {
              setPaymentError('لم نتمكن من التحقق من الدفع. تواصل معنا إذا تم خصم المبلغ.')
            }
          } catch {
            setPaymentError('حدث خطأ في التحقق من الدفع')
          }
        }
        verifyPayment()
      } else if (status === 'failed') {
        setPaymentError('فشلت عملية الدفع. حاول مرة ثانية.')
      }
      window.history.replaceState({}, '', '/subscription')
    }
  }, [store?.id])

  // Load payment history
  useEffect(() => {
    if (store?.id) loadHistory()
  }, [store?.id])

  async function loadHistory() {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('store_id', store?.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistory(data)
  }

  // Load Moyasar SDK
  function loadMoyasarSDK(): Promise<void> {
    return new Promise((resolve) => {
      if (window.Moyasar) {
        resolve()
        return
      }

      // Load CSS
      if (!document.getElementById('moyasar-css')) {
        const css = document.createElement('link')
        css.id = 'moyasar-css'
        css.rel = 'stylesheet'
        css.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
        document.head.appendChild(css)
      }

      // Load JS
      if (!document.getElementById('moyasar-js')) {
        const script = document.createElement('script')
        script.id = 'moyasar-js'
        script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'
        script.async = true
        script.onload = () => resolve()
        document.body.appendChild(script)
      } else {
        resolve()
      }
    })
  }

  async function startPayment(planType: 'monthly' | 'yearly') {
    setSelectedPlan(planType)
    setShowPayment(true)
    setPaymentError('')
    setPaymentLoading(true)

    await loadMoyasarSDK()

    // Small delay for DOM to update
    setTimeout(() => {
      if (!formRef.current || !window.Moyasar) {
        setPaymentError('خطأ في تحميل نموذج الدفع')
        setPaymentLoading(false)
        return
      }

      // Clear previous form
      formRef.current.innerHTML = ''

      const amount = planType === 'yearly' ? 100000 : 10000 // In halalas (1000 SAR or 100 SAR)

      try {
        window.Moyasar.init({
          element: formRef.current,
          amount: amount,
          currency: 'SAR',
          description: planType === 'yearly'
            ? 'رداد ستورز — اشتراك سنوي'
            : 'رداد ستورز — اشتراك شهري',
          publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
          callback_url: PAYMENT_CALLBACK_URL,
          metadata: {
            store_id: store?.id,
            plan_type: planType,
          },
          methods: ['creditcard', 'stcpay'],
          supported_networks: ['visa', 'mastercard', 'mada'],
          on_completed: async function (payment: any) {
            if (payment.status === 'paid' && payment.id) {
              // SECURITY: Verify payment server-side before updating plan
              try {
                const res = await fetch(`${FUNCTIONS_URL}/verify-payment`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ payment_id: payment.id, store_id: store?.id }),
                })
                const result = await res.json()
                if (result.verified) {
                  setPaymentSuccess(true)
                  setShowPayment(false)
                  await refreshStore?.()
                  await loadHistory()
                } else {
                  setPaymentError('لم نتمكن من التحقق من الدفع')
                }
              } catch {
                // Webhook will handle it as fallback
                setPaymentSuccess(true)
                setShowPayment(false)
                await refreshStore?.()
              }
            }
          },
          on_failure: function () {
            setPaymentError('فشلت عملية الدفع')
          },
        })
        setPaymentLoading(false)
      } catch (err: any) {
        console.error('[Moyasar] Init error')
        setPaymentError('خطأ في تهيئة نموذج الدفع: ' + err.message)
        setPaymentLoading(false)
      }
    }, 500)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الاشتراك</h1>
        <p className="text-muted mt-1">إدارة اشتراكك والاستخدام</p>
      </div>

      {/* Payment Success */}
      {paymentSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle size={24} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-800">تم الدفع بنجاح!</h3>
            <p className="text-sm text-green-700 mt-1">تم تفعيل اشتراكك. الذكاء الاصطناعي جاهز يرد على عملائك.</p>
            <button onClick={() => setPaymentSuccess(false)} className="text-xs text-green-600 underline mt-2">إغلاق</button>
          </div>
        </div>
      )}

      {/* Payment Error */}
      {paymentError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{paymentError}</p>
            <button onClick={() => setPaymentError('')} className="text-xs text-red-600 underline mt-1">إغلاق</button>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">خطتك الحالية</h2>
          {plan === 'trial' && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-medium">
              تجربة مجانية
            </span>
          )}
          {plan === 'monthly' && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium flex items-center gap-1">
              <CheckCircle size={14} /> شهري
            </span>
          )}
          {plan === 'yearly' && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium flex items-center gap-1">
              <CheckCircle size={14} /> سنوي
            </span>
          )}
        </div>

        {plan === 'trial' && !isTrialExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-amber-600" />
              <span className="font-medium text-sm">متبقي {trialDaysLeft} أيام من التجربة المجانية</span>
            </div>
            <p className="text-xs text-muted">اشترك قبل انتهاء التجربة عشان ما ينقطع الذكاء الاصطناعي عن الرد</p>
          </div>
        )}

        {isTrialExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="font-medium text-sm text-red-700">انتهت التجربة المجانية</span>
            </div>
            <p className="text-xs text-muted">الذكاء الاصطناعي متوقف عن الرد. اشترك الحين عشان يرجع يشتغل</p>
          </div>
        )}

        {(plan === 'monthly' || plan === 'yearly') && planExpiresAt && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-primary" />
              <span className="font-medium text-sm">اشتراكك فعّال</span>
            </div>
            <p className="text-xs text-muted">
              ينتهي في {planExpiresAt.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

        {/* Usage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">الردود المستخدمة هالشهر</span>
            <span className="font-medium">٠ / {plan === 'trial' ? '١٠٠' : '١٠,٠٠٠'}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2.5">
            <div className="h-2.5 rounded-full bg-primary" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {showPayment && (
        <div className="bg-surface rounded-xl border-2 border-primary/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">
                {selectedPlan === 'yearly' ? 'الاشتراك السنوي — ١,٠٠٠ ريال' : 'الاشتراك الشهري — ١٠٠ ريال'}
              </h2>
              <p className="text-sm text-muted mt-1">ادخل بيانات الدفع</p>
            </div>
            <button
              onClick={() => setShowPayment(false)}
              className="text-muted hover:text-secondary text-xl p-1"
            >
              &times;
            </button>
          </div>

          {paymentLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="text-sm text-muted mr-2">جاري تحميل نموذج الدفع...</span>
            </div>
          )}

          {/* Moyasar form renders here */}
          <div ref={formRef} className="moyasar-form" dir="ltr" />

          <div className="flex items-center gap-2 mt-4 justify-center">
            <Shield size={14} className="text-muted" />
            <span className="text-xs text-muted">دفع آمن عبر Moyasar — مشفّر ومحمي</span>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      {!showPayment && (
        <>
          <h2 className="text-lg font-bold mb-4">اختر خطتك</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Monthly */}
            <div className={`bg-surface rounded-xl border p-6 transition-all ${plan === 'monthly' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
              <h3 className="font-bold text-lg mb-1">شهري</h3>
              <p className="text-3xl font-bold text-primary mb-1">١٠٠ <span className="text-base font-normal">ريال/شهر</span></p>
              <ul className="text-sm text-muted space-y-1.5 mt-3 mb-5">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> ١٠,٠٠٠ رد بالشهر</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> منتجات غير محدودة</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> قاعدة معرفة ذكية</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> دعم فني</li>
              </ul>
              <button
                onClick={() => startPayment('monthly')}
                disabled={plan === 'monthly'}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {plan === 'monthly' ? 'خطتك الحالية' : 'اشترك شهرياً'}
              </button>
            </div>

            {/* Yearly */}
            <div className={`bg-surface rounded-xl border p-6 transition-all relative ${plan === 'yearly' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                وفّر شهرين
              </span>
              <h3 className="font-bold text-lg mb-1">سنوي</h3>
              <p className="text-3xl font-bold text-primary mb-1">١,٠٠٠ <span className="text-base font-normal">ريال/سنة</span></p>
              <p className="text-xs text-muted">(٨٣ ريال/شهر)</p>
              <ul className="text-sm text-muted space-y-1.5 mt-3 mb-5">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> ١٠,٠٠٠ رد بالشهر</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> منتجات غير محدودة</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> قاعدة معرفة ذكية</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary shrink-0" /> دعم فني + أولوية</li>
              </ul>
              <button
                onClick={() => startPayment('yearly')}
                disabled={plan === 'yearly'}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {plan === 'yearly' ? 'خطتك الحالية' : 'اشترك سنوياً'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Payment Methods */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={20} className="text-primary" />
          <h2 className="text-lg font-bold">طرق الدفع المدعومة</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium flex items-center gap-2">
            <div className="w-6 h-4 bg-[#1A1F71] rounded-sm flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">mada</span>
            </div>
            مدى
          </div>
          <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium">Visa</div>
          <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium">Mastercard</div>
          <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium">STC Pay</div>
        </div>
      </div>

      {/* Payment History */}
      {history.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">سجل المدفوعات</h2>
          <div className="space-y-2">
            {history.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="text-sm font-medium">{h.plan_type === 'yearly' ? 'اشتراك سنوي' : 'اشتراك شهري'}</p>
                  <p className="text-xs text-muted">{new Date(h.created_at).toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{h.amount} ريال</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    h.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {h.status === 'paid' ? 'مدفوع' : 'فشل'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

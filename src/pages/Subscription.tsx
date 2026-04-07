import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { CreditCard, CheckCircle, AlertTriangle, Zap, Loader2, Shield, Crown, Star, Clock, Receipt } from 'lucide-react'

// Moyasar config
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

  // Usage data (placeholder)
  const usedReplies = 0
  const maxReplies = plan === 'trial' ? 100 : 10000
  const usagePercent = maxReplies > 0 ? Math.min((usedReplies / maxReplies) * 100, 100) : 0

  // Check for payment callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'callback') {
      const paymentId = params.get('id')
      const status = params.get('status')

      if (status === 'paid' && paymentId) {
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

      if (!document.getElementById('moyasar-css')) {
        const css = document.createElement('link')
        css.id = 'moyasar-css'
        css.rel = 'stylesheet'
        css.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
        document.head.appendChild(css)
      }

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

    setTimeout(() => {
      if (!formRef.current || !window.Moyasar) {
        setPaymentError('خطأ في تحميل نموذج الدفع')
        setPaymentLoading(false)
        return
      }

      formRef.current.innerHTML = ''

      const amount = planType === 'yearly' ? 100000 : 10000

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
      <div dir="rtl" className="font-[Cairo] max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">الاشتراك</h1>
          <p className="text-gray-500 mt-2 text-base">إدارة اشتراكك والاستخدام</p>
        </div>

        {/* Payment Success */}
        {paymentSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3 animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-base">تم الدفع بنجاح!</h3>
              <p className="text-sm text-emerald-700 mt-1">تم تفعيل اشتراكك. الذكاء الاصطناعي جاهز يرد على عملائك.</p>
              <button onClick={() => setPaymentSuccess(false)} className="text-xs text-emerald-500 hover:text-emerald-700 mt-2 font-medium">إغلاق</button>
            </div>
          </div>
        )}

        {/* Payment Error */}
        {paymentError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-800 font-medium">{paymentError}</p>
              <button onClick={() => setPaymentError('')} className="text-xs text-red-500 hover:text-red-700 mt-1 font-medium">إغلاق</button>
            </div>
          </div>
        )}

        {/* Current Plan Status Card */}
        <div className="relative overflow-hidden rounded-2xl mb-8 animate-fade-in-up">
          <div className={`p-6 ${
            plan === 'trial'
              ? 'bg-gradient-to-l from-amber-500 via-orange-500 to-amber-600'
              : plan === 'yearly'
              ? 'bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700'
              : 'bg-gradient-to-l from-emerald-500 to-teal-600'
          }`}>
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12" />

            <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={20} className="text-white/90" />
                  <span className="text-white/80 text-sm font-medium">خطتك الحالية</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {plan === 'trial' ? 'تجربة مجانية' : plan === 'monthly' ? 'الخطة الشهرية' : 'الخطة السنوية'}
                </h2>
                {plan === 'trial' && !isTrialExpired && (
                  <p className="text-white/80 text-sm">متبقي <strong className="text-white">{trialDaysLeft}</strong> أيام من التجربة</p>
                )}
                {isTrialExpired && (
                  <p className="text-red-200 text-sm font-bold">انتهت التجربة المجانية --- اشترك الحين</p>
                )}
                {(plan === 'monthly' || plan === 'yearly') && planExpiresAt && (
                  <p className="text-white/80 text-sm">
                    ينتهي في {planExpiresAt.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                isTrialExpired ? 'bg-red-500/30 text-red-100' : 'bg-white/20 text-white'
              }`}>
                {isTrialExpired ? 'منتهية' : plan === 'trial' ? 'مجانية' : 'فعّالة'}
              </div>
            </div>

            {/* Usage Bar */}
            <div className="relative z-10 mt-6 bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-white/80 font-medium">الردود المستخدمة هالشهر</span>
                <span className="font-bold text-white">{usedReplies.toLocaleString('ar-SA')} / {maxReplies.toLocaleString('ar-SA')}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-white/60 text-xs mt-2">{usagePercent.toFixed(0)}% مستخدم</p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {showPayment && (
          <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-lg shadow-emerald-500/10 p-6 mb-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedPlan === 'yearly' ? 'الاشتراك السنوي --- 1,000 ريال' : 'الاشتراك الشهري --- 100 ريال'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">ادخل بيانات الدفع</p>
              </div>
              <button
                onClick={() => setShowPayment(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                &times;
              </button>
            </div>

            {paymentLoading && (
              <div className="flex items-center justify-center py-10 gap-3">
                <Loader2 size={24} className="animate-spin text-emerald-500" />
                <span className="text-sm text-gray-500">جاري تحميل نموذج الدفع...</span>
              </div>
            )}

            <div ref={formRef} className="moyasar-form" dir="ltr" />

            <div className="flex items-center gap-2 mt-5 justify-center bg-gray-50 rounded-xl py-3">
              <Shield size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">دفع آمن عبر Moyasar --- مشفّر ومحمي</span>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        {!showPayment && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">اختر خطتك</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Trial Plan */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up relative">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <Zap size={20} className="text-gray-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">التجربة المجانية</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">0 <span className="text-sm font-normal text-gray-500">ريال</span></p>
                <p className="text-xs text-gray-400 mb-5">10 أيام</p>
                <ul className="text-sm text-gray-600 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> 100 رد بالشهر</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> قناة واحدة</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> قاعدة معرفة أساسية</li>
                </ul>
                <button
                  disabled
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed text-sm"
                >
                  {plan === 'trial' ? 'خطتك الحالية' : 'مجانية'}
                </button>
              </div>

              {/* Monthly Plan - Highlighted */}
              <div className="relative bg-white rounded-2xl p-6 animate-fade-in-up border-2 border-emerald-500 shadow-xl shadow-emerald-500/10" style={{ animationDelay: '0.1s' }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-l from-emerald-600 to-emerald-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-lg shadow-emerald-500/30">
                    الأكثر شيوعاً
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <Star size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">شهري</h3>
                <p className="text-3xl font-bold text-emerald-600 mb-1">100 <span className="text-sm font-normal text-gray-500">ريال/شهر</span></p>
                <p className="text-xs text-gray-400 mb-5">تجدد تلقائياً</p>
                <ul className="text-sm text-gray-600 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> 10,000 رد بالشهر</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> منتجات غير محدودة</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> قاعدة معرفة ذكية</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> دعم فني</li>
                </ul>
                <button
                  onClick={() => startPayment('monthly')}
                  disabled={plan === 'monthly'}
                  className="w-full py-3.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {plan === 'monthly' ? 'خطتك الحالية' : 'اشترك شهرياً'}
                </button>
              </div>

              {/* Yearly Plan */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up relative" style={{ animationDelay: '0.2s' }}>
                <div className="absolute -top-3 left-4">
                  <span className="bg-amber-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">
                    وفّر شهرين
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <Crown size={20} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">سنوي</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">1,000 <span className="text-sm font-normal text-gray-500">ريال/سنة</span></p>
                <p className="text-xs text-emerald-600 font-semibold mb-5">83 ريال/شهر</p>
                <ul className="text-sm text-gray-600 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> 10,000 رد بالشهر</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> منتجات غير محدودة</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> قاعدة معرفة ذكية</li>
                  <li className="flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500 shrink-0" /> دعم فني + أولوية</li>
                </ul>
                <button
                  onClick={() => startPayment('yearly')}
                  disabled={plan === 'yearly'}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {plan === 'yearly' ? 'خطتك الحالية' : 'اشترك سنوياً'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supported Payment Methods */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CreditCard size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">طرق الدفع المدعومة</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="px-5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 flex items-center gap-2 hover:border-emerald-300 transition-colors">
              <div className="w-7 h-5 bg-[#1A1F71] rounded flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">mada</span>
              </div>
              مدى
            </div>
            <div className="px-5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-emerald-300 transition-colors">Visa</div>
            <div className="px-5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-emerald-300 transition-colors">Mastercard</div>
            <div className="px-5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-emerald-300 transition-colors">STC Pay</div>
          </div>
        </div>

        {/* Payment History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Receipt size={16} className="text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">سجل المدفوعات</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">الخطة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">التاريخ</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">المبلغ</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((h: any) => (
                    <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900">{h.plan_type === 'yearly' ? 'اشتراك سنوي' : 'اشتراك شهري'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(h.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{h.amount} ريال</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                          h.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {h.status === 'paid' ? (
                            <><CheckCircle size={12} /> مدفوع</>
                          ) : (
                            <><AlertTriangle size={12} /> فشل</>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

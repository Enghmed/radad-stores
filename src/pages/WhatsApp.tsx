import { useState, useEffect, useCallback, useRef } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { MessageCircle, CheckCircle, Wifi, WifiOff, Camera, Phone, RefreshCw, AlertCircle, Send, Loader2 } from 'lucide-react'

// Meta App Config
const META_APP_ID = '1474338047691178'
const META_CONFIG_ID = '919168294428127'
const SUPABASE_FUNCTIONS_URL = 'https://jchcpswvlpdatudrstzl.supabase.co/functions/v1'

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

export default function WhatsAppPage() {
  const { store, user, refreshStore } = useAuth()
  const [loading, setLoading] = useState(false)
  const [igLoading, setIgLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Embedded Signup session data (captured from message event)
  const embeddedSignupData = useRef<{ waba_id?: string; phone_number_id?: string }>({})

  // Telegram state
  const [telegramChatId, setTelegramChatId] = useState('')
  const [telegramSaving, setTelegramSaving] = useState(false)
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [storedTelegramChatId, setStoredTelegramChatId] = useState<string | null>(null)

  // Check URL params for success/error from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setSuccess('تم ربط الواتساب بنجاح! الذكاء الاصطناعي جاهز يرد على عملائك.')
      window.history.replaceState({}, '', '/whatsapp')
      refreshStore?.()
    }
    if (params.get('error')) {
      setError(`حدث خطأ أثناء الربط: ${params.get('error')}`)
      window.history.replaceState({}, '', '/whatsapp')
    }
  }, [])

  // Load Telegram status
  useEffect(() => {
    if (store?.id) {
      loadTelegramStatus()
    }
  }, [store?.id])

  async function loadTelegramStatus() {
    if (!store?.id) return
    const { data } = await supabase
      .from('store_owners')
      .select('telegram_chat_id')
      .eq('id', store.id)
      .single()
    if (data?.telegram_chat_id) {
      setTelegramConnected(true)
      setStoredTelegramChatId(data.telegram_chat_id)
      setTelegramChatId(data.telegram_chat_id)
    }
  }

  // Load Facebook SDK
  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) return

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v21.0',
      })
    }

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  // Session logging message event listener — captures WABA ID and Phone Number ID
  // from the Embedded Signup flow BEFORE the fbLoginCallback fires
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.origin !== 'string' || !event.origin.endsWith('facebook.com')) return
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('[WhatsApp] Embedded signup event received')
          if (data.data?.waba_id) {
            embeddedSignupData.current.waba_id = data.data.waba_id
          }
          if (data.data?.phone_number_id) {
            embeddedSignupData.current.phone_number_id = data.data.phone_number_id
          }
        }
      } catch {
        // Not JSON, ignore
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // ========================================
  // WhatsApp Embedded Signup
  // ========================================
  const handleWhatsAppConnect = useCallback(() => {
    if (!window.FB) {
      setError('جاري تحميل Facebook SDK، حاول مرة ثانية بعد ثواني')
      return
    }

    setLoading(true)
    setError(null)

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code
          console.log('[WhatsApp] Got code from embedded signup')
          processWhatsAppCode(code)
        } else {
          setLoading(false)
          setError('تم إلغاء عملية الربط')
        }
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
  }, [store])

  const processWhatsAppCode = async (code: string) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/meta-oauth-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store?.id,
          code: code,
          waba_id: embeddedSignupData.current.waba_id || undefined,
          phone_number_id: embeddedSignupData.current.phone_number_id || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(`تم ربط الواتساب بنجاح! الرقم: ${result.phone_number || 'جاري التحقق'}`)
        refreshStore?.()
      } else {
        setError(result.error || 'حدث خطأ أثناء معالجة الربط')
      }
    } catch (err: any) {
      setError('حدث خطأ في الاتصال: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // Instagram Connection
  // ========================================
  const handleInstagramConnect = useCallback(() => {
    if (!window.FB) {
      setError('جاري تحميل Facebook SDK، حاول مرة ثانية')
      return
    }

    setIgLoading(true)
    setError(null)

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken
          // SECURITY: Send token to server-side edge function instead of calling Graph API from browser
          fetch(`${SUPABASE_FUNCTIONS_URL}/instagram-connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              store_id: store?.id,
              access_token: accessToken,
            }),
          })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                setSuccess(`تم ربط إنستقرام بنجاح! @${result.username}`)
                refreshStore?.()
              } else {
                setError(result.error || 'حدث خطأ في ربط إنستقرام')
              }
            })
            .catch((err: any) => {
              setError('حدث خطأ في الاتصال: ' + err.message)
            })
            .finally(() => setIgLoading(false))
        } else {
          setError('تم إلغاء عملية الربط')
          setIgLoading(false)
        }
      },
      {
        scope: 'instagram_business_basic,instagram_business_manage_messages',
        return_scopes: true,
      }
    )
  }, [store])

  // ========================================
  // Telegram Connection
  // ========================================
  async function handleTelegramConnect() {
    if (!telegramChatId.trim()) {
      setError('ادخل Chat ID من بوت تلقرام')
      return
    }
    setTelegramSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('store_owners')
      .update({ telegram_chat_id: telegramChatId.trim() })
      .eq('id', store?.id)

    if (updateError) {
      setError('حدث خطأ في حفظ بيانات تلقرام')
    } else {
      setTelegramConnected(true)
      setStoredTelegramChatId(telegramChatId.trim())
      setSuccess('تم ربط تلقرام بنجاح! بتستلم إشعارات لما الذكاء الاصطناعي يحتاج مساعدتك.')
    }
    setTelegramSaving(false)
  }

  async function handleTelegramDisconnect() {
    if (!confirm('هل أنت متأكد من فصل تلقرام؟ لن تستلم إشعارات.')) return

    const { error: err } = await supabase
      .from('store_owners')
      .update({ telegram_chat_id: null })
      .eq('id', store?.id)

    if (!err) {
      setTelegramConnected(false)
      setStoredTelegramChatId(null)
      setTelegramChatId('')
      setSuccess('تم فصل تلقرام')
    }
  }

  // ========================================
  // Disconnect handlers
  // ========================================
  const handleWhatsAppDisconnect = async () => {
    if (!confirm('هل أنت متأكد من فصل الواتساب؟ سيتوقف الذكاء الاصطناعي عن الرد على العملاء.')) return

    const { error } = await supabase
      .from('store_owners')
      .update({
        whatsapp_connected: false,
        whatsapp_number: null,
        whatsapp_phone_number_id: null,
        waba_id: null,
        whatsapp_access_token: null,
      })
      .eq('id', store?.id)

    if (!error) {
      setSuccess('تم فصل الواتساب')
      refreshStore?.()
    }
  }

  const handleInstagramDisconnect = async () => {
    if (!confirm('هل أنت متأكد من فصل إنستقرام؟')) return

    const { error } = await supabase
      .from('store_owners')
      .update({
        instagram_connected: false,
        instagram_page_id: null,
        instagram_username: null,
        instagram_access_token: null,
      })
      .eq('id', store?.id)

    if (!error) {
      setSuccess('تم فصل إنستقرام')
      refreshStore?.()
    }
  }

  const whatsappConnected = store?.whatsapp_connected || false
  const instagramConnected = (store as any)?.instagram_connected || false

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ربط القنوات</h1>
        <p className="text-muted mt-1">وصّل واتساب وإنستقرام وتلقرام عشان الذكاء الاصطناعي يرد على عملائك وتستلم إشعاراتك</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-600 underline mt-1">إغلاق</button>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-800">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-xs text-green-600 underline mt-1">إغلاق</button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* ========================================
            WhatsApp Card
        ======================================== */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${whatsappConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Phone size={24} className={whatsappConnected ? 'text-green-600' : 'text-gray-400'} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">واتساب</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {whatsappConnected ? (
                  <>
                    <Wifi size={14} className="text-green-500" />
                    <span className="text-sm text-green-600 font-medium">متصل</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-gray-400" />
                    <span className="text-sm text-muted">غير متصل</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {whatsappConnected ? (
            <div className="space-y-3">
              <div className="bg-background rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">الرقم</span>
                  <span className="font-medium text-sm" dir="ltr">{store?.whatsapp_number || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">الحالة</span>
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    الذكاء الاصطناعي نشط
                  </span>
                </div>
              </div>
              <button
                onClick={handleWhatsAppDisconnect}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                فصل الواتساب
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                اربط رقم واتساب للأعمال عشان الذكاء الاصطناعي يبدأ يرد على عملائك تلقائياً.
                بس اضغط الزر وسجّل دخول بحساب فيسبوك.
              </p>
              <button
                onClick={handleWhatsAppConnect}
                disabled={loading}
                className="w-full py-3 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#1da851] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    جاري الربط...
                  </>
                ) : (
                  <>
                    <Phone size={18} />
                    ربط واتساب
                  </>
                )}
              </button>
              <p className="text-xs text-muted text-center">
                تحتاج حساب Meta Business وخط واتساب للأعمال
              </p>
            </div>
          )}
        </div>

        {/* ========================================
            Instagram Card
        ======================================== */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${instagramConnected ? 'bg-pink-100' : 'bg-gray-100'}`}>
              <Camera size={24} className={instagramConnected ? 'text-pink-600' : 'text-gray-400'} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">إنستقرام</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {instagramConnected ? (
                  <>
                    <Wifi size={14} className="text-green-500" />
                    <span className="text-sm text-green-600 font-medium">متصل</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-gray-400" />
                    <span className="text-sm text-muted">غير متصل</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {instagramConnected ? (
            <div className="space-y-3">
              <div className="bg-background rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">الحساب</span>
                  <span className="font-medium text-sm" dir="ltr">@{(store as any)?.instagram_username || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">الحالة</span>
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    الذكاء الاصطناعي نشط
                  </span>
                </div>
              </div>
              <button
                onClick={handleInstagramDisconnect}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                فصل إنستقرام
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                اربط حساب إنستقرام عشان الذكاء الاصطناعي يرد على رسائل العملاء في الدايركت تلقائياً.
              </p>
              <button
                onClick={handleInstagramConnect}
                disabled={igLoading}
                className="w-full py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {igLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    جاري الربط...
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    ربط إنستقرام
                  </>
                )}
              </button>
              <p className="text-xs text-muted text-center">
                تحتاج حساب إنستقرام للأعمال مرتبط بصفحة فيسبوك
              </p>
            </div>
          )}
        </div>

        {/* ========================================
            Telegram Card
        ======================================== */}
        <div className="bg-surface rounded-xl border border-border p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${telegramConnected ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Send size={24} className={telegramConnected ? 'text-blue-500' : 'text-gray-400'} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">تلقرام (الإشعارات)</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {telegramConnected ? (
                  <>
                    <Wifi size={14} className="text-green-500" />
                    <span className="text-sm text-green-600 font-medium">متصل — بتستلم إشعارات</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-gray-400" />
                    <span className="text-sm text-muted">غير متصل</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-lg">
            {telegramConnected ? (
              <div className="space-y-3">
                <div className="bg-background rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Chat ID</span>
                    <span className="font-medium text-sm font-mono" dir="ltr">{storedTelegramChatId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">الوظيفة</span>
                    <span className="text-sm text-blue-600 font-medium">إشعارات + رد على أسئلة العملاء</span>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  لما الذكاء الاصطناعي ما يعرف جواب سؤال، بيرسلك إشعار على تلقرام. ترد على الإشعار والذكاء الاصطناعي يتعلم الجواب ويرد تلقائياً المرة الجاية.
                </p>
                <button
                  onClick={handleTelegramDisconnect}
                  className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  فصل تلقرام
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  تلقرام يستخدم لإشعاراتك — لما الذكاء الاصطناعي ما يعرف جواب سؤال عميل، بيرسلك إشعار على تلقرام.
                  ترد على الإشعار والذكاء الاصطناعي يرد على العميل ويحفظ الجواب للأبد.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-sm text-blue-900">كيف تحصل على Chat ID؟</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>افتح تلقرام وابحث عن <span className="font-mono bg-blue-100 px-1 rounded">@RadadAIBot</span></li>
                    <li>اضغط <strong>Start</strong> أو أرسل <span className="font-mono bg-blue-100 px-1 rounded">/start</span></li>
                    <li>البوت بيرسلك رقم الـ Chat ID — انسخه وحطه هنا</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telegram Chat ID</label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={e => setTelegramChatId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-400/50 font-mono"
                    placeholder="مثال: 123456789"
                    dir="ltr"
                  />
                </div>

                <button
                  onClick={handleTelegramConnect}
                  disabled={telegramSaving || !telegramChatId.trim()}
                  className="w-full py-3 bg-[#0088cc] text-white rounded-lg font-medium hover:bg-[#006daa] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {telegramSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      ربط تلقرام
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
        <MessageCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">تحتاج مساعدة في الربط؟</p>
          <p className="text-sm text-blue-700 mt-1">
            تواصل معنا على تلقرام وبنساعدك تربط واتساب وإنستقرام وتلقرام خلال دقائق.
            تأكد إن عندك حساب Meta Business وحساب واتساب/إنستقرام للأعمال.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { MessageCircle, CheckCircle, Camera, Phone, RefreshCw, AlertCircle, Send, Loader2, Link2, Unlink, HelpCircle } from 'lucide-react'

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
        version: 'v25.0',
      })
    }

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  // Session logging message event listener
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
        scope: 'instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,pages_messaging,pages_manage_metadata',
        return_scopes: true,
        extras: {
          setup: {
            channel: 'IG_API_ONBOARDING',
          },
        },
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
      <div dir="rtl" className="font-[Cairo] max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">ربط القنوات</h1>
          <p className="text-gray-500 mt-2 text-base">وصّل واتساب وإنستقرام وتلقرام عشان الذكاء الاصطناعي يرد على عملائك</p>
        </div>

        {/* Connection Flow Visualization */}
        <div className="mb-8 bg-gradient-to-l from-emerald-50 via-white to-emerald-50 rounded-2xl border border-emerald-100 p-5 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${whatsappConnected ? 'bg-emerald-500 animate-pulse-glow' : 'bg-gray-300'}`} />
              <span className={whatsappConnected ? 'text-emerald-700 font-semibold' : 'text-gray-500'}>واتساب</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${instagramConnected ? 'bg-pink-500 animate-pulse-glow' : 'bg-gray-300'}`} />
              <span className={instagramConnected ? 'text-pink-700 font-semibold' : 'text-gray-500'}>إنستقرام</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${telegramConnected ? 'bg-blue-500 animate-pulse-glow' : 'bg-gray-300'}`} />
              <span className={telegramConnected ? 'text-blue-700 font-semibold' : 'text-gray-500'}>تلقرام</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 font-semibold">رداد AI</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-500 hover:text-red-700 mt-1 font-medium">إغلاق</button>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-emerald-800 font-medium">{success}</p>
              <button onClick={() => setSuccess(null)} className="text-xs text-emerald-500 hover:text-emerald-700 mt-1 font-medium">إغلاق</button>
            </div>
          </div>
        )}

        {/* Channel Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* ========================================
              WhatsApp Card
          ======================================== */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up card-hover">
            {/* Card Header */}
            <div className={`p-4 ${whatsappConnected ? 'bg-gradient-to-l from-green-500 to-emerald-600' : 'bg-gradient-to-l from-gray-100 to-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${whatsappConnected ? 'bg-white/20 backdrop-blur-sm' : 'bg-white shadow-sm'}`}>
                  <Phone size={24} className={whatsappConnected ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${whatsappConnected ? 'text-white' : 'text-gray-900'}`}>واتساب</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${whatsappConnected ? 'bg-green-300 animate-pulse' : 'bg-red-400'}`} />
                    <span className={`text-xs font-medium ${whatsappConnected ? 'text-white/90' : 'text-red-500'}`}>
                      {whatsappConnected ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
              {whatsappConnected ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">الرقم</span>
                      <span className="font-bold text-sm text-gray-900" dir="ltr">{store?.whatsapp_number || '---'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">الحالة</span>
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        AI نشط
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleWhatsAppDisconnect}
                    className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlink size={14} />
                    فصل الواتساب
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    اربط رقم واتساب للأعمال عشان الذكاء الاصطناعي يبدأ يرد تلقائياً.
                  </p>
                  <button
                    onClick={handleWhatsAppConnect}
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-l from-[#25D366] to-[#128C7E] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        جاري الربط...
                      </>
                    ) : (
                      <>
                        <Link2 size={18} />
                        ربط واتساب
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    تحتاج حساب Meta Business وخط واتساب للأعمال
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================
              Instagram Card
          ======================================== */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up card-hover" style={{ animationDelay: '0.1s' }}>
            {/* Card Header */}
            <div className={`p-4 ${instagramConnected ? 'bg-gradient-to-l from-[#833AB4] via-[#FD1D1D] to-[#F77737]' : 'bg-gradient-to-l from-gray-100 to-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${instagramConnected ? 'bg-white/20 backdrop-blur-sm' : 'bg-white shadow-sm'}`}>
                  <Camera size={24} className={instagramConnected ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${instagramConnected ? 'text-white' : 'text-gray-900'}`}>إنستقرام</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${instagramConnected ? 'bg-pink-200 animate-pulse' : 'bg-red-400'}`} />
                    <span className={`text-xs font-medium ${instagramConnected ? 'text-white/90' : 'text-red-500'}`}>
                      {instagramConnected ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
              {instagramConnected ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">الحساب</span>
                      <span className="font-bold text-sm text-gray-900" dir="ltr">@{(store as any)?.instagram_username || '---'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">الحالة</span>
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        AI نشط
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleInstagramDisconnect}
                    className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlink size={14} />
                    فصل إنستقرام
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    اربط حساب إنستقرام عشان الذكاء الاصطناعي يرد على رسائل الدايركت.
                  </p>
                  <button
                    onClick={handleInstagramConnect}
                    disabled={igLoading}
                    className="w-full py-3.5 bg-gradient-to-l from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {igLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        جاري الربط...
                      </>
                    ) : (
                      <>
                        <Link2 size={18} />
                        ربط إنستقرام
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    تحتاج حساب إنستقرام للأعمال مرتبط بصفحة فيسبوك
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================
              Telegram Card
          ======================================== */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up card-hover" style={{ animationDelay: '0.2s' }}>
            {/* Card Header */}
            <div className={`p-4 ${telegramConnected ? 'bg-gradient-to-l from-[#0088cc] to-[#229ED9]' : 'bg-gradient-to-l from-gray-100 to-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${telegramConnected ? 'bg-white/20 backdrop-blur-sm' : 'bg-white shadow-sm'}`}>
                  <Send size={24} className={telegramConnected ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${telegramConnected ? 'text-white' : 'text-gray-900'}`}>تلقرام</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${telegramConnected ? 'bg-blue-200 animate-pulse' : 'bg-red-400'}`} />
                    <span className={`text-xs font-medium ${telegramConnected ? 'text-white/90' : 'text-red-500'}`}>
                      {telegramConnected ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
              {telegramConnected ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Chat ID</span>
                      <span className="font-bold text-sm font-mono text-gray-900" dir="ltr">{storedTelegramChatId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">الوظيفة</span>
                      <span className="text-xs text-blue-600 font-bold">إشعارات + ردود</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    لما الذكاء الاصطناعي ما يعرف جواب سؤال، بيرسلك إشعار على تلقرام.
                  </p>
                  <button
                    onClick={handleTelegramDisconnect}
                    className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlink size={14} />
                    فصل تلقرام
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    استلم إشعارات عندما يحتاج الذكاء الاصطناعي مساعدتك.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Telegram Chat ID</label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={e => setTelegramChatId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all font-mono text-sm"
                      placeholder="123456789"
                      dir="ltr"
                    />
                  </div>

                  <button
                    onClick={handleTelegramConnect}
                    disabled={telegramSaving || !telegramChatId.trim()}
                    className="w-full py-3.5 bg-gradient-to-l from-[#0088cc] to-[#229ED9] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {telegramSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Link2 size={18} />
                        ربط تلقرام
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telegram Setup Instructions (shown when not connected) */}
        {!telegramConnected && (
          <div className="mt-6 bg-blue-50 rounded-2xl border border-blue-100 p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-blue-900 mb-2">كيف تحصل على Chat ID؟</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>افتح تلقرام وابحث عن <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-xs">@RadadAIBot</span></li>
                  <li>اضغط <strong>Start</strong> أو أرسل <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-xs">/start</span></li>
                  <li>البوت بيرسلك رقم الـ Chat ID --- انسخه وحطه في الحقل أعلاه</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 bg-gradient-to-l from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <MessageCircle size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">تحتاج مساعدة في الربط؟</p>
              <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                تواصل معنا على تلقرام وبنساعدك تربط واتساب وإنستقرام وتلقرام خلال دقائق.
                تأكد إن عندك حساب Meta Business وحساب واتساب/إنستقرام للأعمال.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

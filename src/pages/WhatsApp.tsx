import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { MessageCircle, CheckCircle, Wifi, WifiOff, Instagram, Phone, RefreshCw, AlertCircle } from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

          // The embedded signup may also return WABA ID and phone number ID
          // through the onSuccess callback data
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

    setLoading(true)
    setError(null)

    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken
          try {
            // Get the user's Instagram accounts via their Facebook pages
            const pagesRes = await fetch(
              `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
            )
            const pagesData = await pagesRes.json()

            if (!pagesData.data?.[0]) {
              setError('لم يتم العثور على صفحة فيسبوك مرتبطة. يجب ربط حساب إنستقرام بصفحة فيسبوك أولاً.')
              setLoading(false)
              return
            }

            // Get Instagram business account from the first page
            const pageId = pagesData.data[0].id
            const pageToken = pagesData.data[0].access_token

            const igRes = await fetch(
              `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
            )
            const igData = await igRes.json()

            if (!igData.instagram_business_account?.id) {
              setError('لم يتم العثور على حساب إنستقرام للأعمال. تأكد إن حسابك محوّل لحساب أعمال.')
              setLoading(false)
              return
            }

            const igPageId = igData.instagram_business_account.id

            // Get Instagram username
            const igProfileRes = await fetch(
              `https://graph.facebook.com/v21.0/${igPageId}?fields=name,username&access_token=${pageToken}`
            )
            const igProfile = await igProfileRes.json()

            // Save to database
            const { error: updateError } = await supabase
              .from('store_owners')
              .update({
                instagram_connected: true,
                instagram_page_id: igPageId,
                instagram_username: igProfile.username || igProfile.name,
                instagram_access_token: pageToken,
              })
              .eq('id', store?.id)

            if (updateError) {
              setError('حدث خطأ في حفظ بيانات إنستقرام')
            } else {
              setSuccess(`تم ربط إنستقرام بنجاح! @${igProfile.username || igProfile.name}`)
              refreshStore?.()
            }
          } catch (err: any) {
            setError('حدث خطأ: ' + err.message)
          }
        } else {
          setError('تم إلغاء عملية الربط')
        }
        setLoading(false)
      },
      {
        scope: 'instagram_basic,instagram_manage_messages,pages_show_list,pages_messaging',
        return_scopes: true,
      }
    )
  }, [store])

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
        <p className="text-muted mt-1">وصّل واتساب وإنستقرام عشان الذكاء الاصطناعي يرد على عملائك</p>
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
              <Instagram size={24} className={instagramConnected ? 'text-pink-600' : 'text-gray-400'} />
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
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    جاري الربط...
                  </>
                ) : (
                  <>
                    <Instagram size={18} />
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
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
        <MessageCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">تحتاج مساعدة في الربط؟</p>
          <p className="text-sm text-blue-700 mt-1">
            تواصل معنا على تلقرام وبنساعدك تربط واتساب وإنستقرام خلال دقائق.
            تأكد إن عندك حساب Meta Business وحساب واتساب/إنستقرام للأعمال.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

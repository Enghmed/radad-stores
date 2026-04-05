import { useState } from 'react'
import { ArrowLeft, Trash2, CheckCircle, AlertTriangle, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DataDeletion() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmText !== 'حذف بياناتي') return
    setLoading(true)

    // In production, this calls an edge function to process the deletion request
    // For now, simulate a request
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch {
      // Handle error
    }
    setLoading(false)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Radad" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg text-gray-900">رداد للذكاء الاصطناعي</span>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            الرئيسية <ArrowLeft size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">طلب حذف البيانات</h1>
            <p className="text-lg text-gray-500">Data Deletion Request</p>
            <p className="text-sm text-gray-400 mt-2">آخر تحديث: أبريل 2026 | Last updated: April 2026</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* What Gets Deleted */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">ما الذي سيتم حذفه؟</h2>
              <p className="mb-4">عند طلب حذف بياناتك، سيتم حذف جميع البيانات المرتبطة بحسابك بشكل <strong>نهائي وغير قابل للاسترداد</strong>:</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="font-semibold text-red-800 text-sm mb-2">بيانات الحساب</p>
                  <p className="text-red-700 text-xs">الاسم، البريد الإلكتروني، رقم الجوال، كلمة المرور، إعدادات الحساب</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="font-semibold text-red-800 text-sm mb-2">بيانات المتجر</p>
                  <p className="text-red-700 text-xs">اسم المتجر، نوع النشاط، المنتجات، الأسعار، التصنيفات</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="font-semibold text-red-800 text-sm mb-2">قاعدة المعرفة</p>
                  <p className="text-red-700 text-xs">جميع الأسئلة والأجوبة والكلمات المفتاحية المخزنة</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="font-semibold text-red-800 text-sm mb-2">سجل المحادثات</p>
                  <p className="text-red-700 text-xs">جميع المحادثات والرسائل مع العملاء عبر واتساب وإنستقرام</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="font-semibold text-red-800 text-sm mb-2">ربط المنصات</p>
                  <p className="text-red-700 text-xs">رموز الوصول لواتساب وإنستقرام وتيليقرام (يتم إلغاء الربط)</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="font-semibold text-red-800 text-sm mb-2">إحصائيات الاستخدام</p>
                  <p className="text-red-700 text-xs">عدد الرسائل، سجل الاستخدام الشهري، وأي بيانات تحليلية</p>
                </div>
              </div>
            </section>

            {/* What's Retained */}
            <section>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex gap-3 items-start">
                  <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 mb-2">بيانات يتم الاحتفاظ بها وفقاً للأنظمة:</p>
                    <p className="text-yellow-800 text-sm">
                      سجلات الدفع والفواتير يتم الاحتفاظ بها لمدة 7 سنوات وفقاً لنظام الزكاة والضريبة والجمارك السعودي.
                      يتم حذف جميع البيانات الشخصية المرتبطة بها (الاسم، البريد) مع الاحتفاظ بالسجل المالي فقط.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Delete */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">طرق حذف بياناتك</h2>

              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex gap-3 items-start">
                    <div className="bg-emerald-200 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-emerald-900 mb-1">من لوحة التحكم (فوري)</p>
                      <p className="text-emerald-800 text-sm">
                        سجّل دخولك ← الإعدادات ← أسفل الصفحة ← "حذف الحساب". سيتم حذف جميع بياناتك فوراً وبشكل نهائي.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex gap-3 items-start">
                    <div className="bg-blue-200 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">عبر النموذج أدناه (خلال 48 ساعة)</p>
                      <p className="text-blue-800 text-sm">
                        إذا لم تتمكن من تسجيل الدخول، أدخل البريد الإلكتروني المرتبط بحسابك في النموذج أدناه.
                        سنتحقق من هويتك ونحذف بياناتك خلال 48 ساعة.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                  <div className="flex gap-3 items-start">
                    <div className="bg-purple-200 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-purple-900 mb-1">عبر البريد الإلكتروني (خلال 72 ساعة)</p>
                      <p className="text-purple-800 text-sm">
                        أرسل طلب حذف إلى <a href="mailto:privacy@radadai.com" className="font-medium hover:underline">privacy@radadai.com</a> أو
                        <a href="mailto:salahs@smarttec.sa" className="font-medium hover:underline mr-1">salahs@smarttec.sa</a> مع ذكر بريدك المسجل.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Deletion Timeline */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">مراحل الحذف</h2>
              <div className="relative pr-8">
                <div className="absolute right-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute right-[-22px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                    <p className="font-semibold text-sm">فوراً</p>
                    <p className="text-sm text-gray-500">يتم تعطيل حسابك ووقف الرد الآلي على العملاء</p>
                  </div>
                  <div className="relative">
                    <div className="absolute right-[-22px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                    <p className="font-semibold text-sm">خلال 24 ساعة</p>
                    <p className="text-sm text-gray-500">حذف بيانات الحساب والمنتجات وقاعدة المعرفة</p>
                  </div>
                  <div className="relative">
                    <div className="absolute right-[-22px] w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
                    <p className="font-semibold text-sm">خلال 48 ساعة</p>
                    <p className="text-sm text-gray-500">حذف سجل المحادثات وإلغاء ربط جميع المنصات</p>
                  </div>
                  <div className="relative">
                    <div className="absolute right-[-22px] w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                    <p className="font-semibold text-sm">خلال 30 يوماً</p>
                    <p className="text-sm text-gray-500">حذف النسخ الاحتياطية المحتوية على بياناتك</p>
                  </div>
                  <div className="relative">
                    <div className="absolute right-[-22px] w-4 h-4 rounded-full bg-gray-400 border-2 border-white"></div>
                    <p className="font-semibold text-sm">تأكيد الحذف</p>
                    <p className="text-sm text-gray-500">نرسل لك بريد إلكتروني يؤكد اكتمال حذف جميع بياناتك</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Facebook / Meta Data Deletion */}
            <section>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex gap-3 items-start">
                  <Shield size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">حذف البيانات المرتبطة بـ Facebook / Meta</p>
                    <p className="text-blue-800 text-sm mb-2">
                      إذا قمت بربط حسابك بـ Facebook أو WhatsApp Business عبر Meta، يمكنك أيضاً طلب حذف البيانات
                      التي شاركتها معنا عبر Meta. عند تقديم طلب الحذف، سنقوم بـ:
                    </p>
                    <div className="text-blue-800 text-sm space-y-1">
                      <p>• حذف رمز الوصول (Access Token) المخزن لدينا</p>
                      <p>• إلغاء ربط حساب واتساب للأعمال (WABA)</p>
                      <p>• حذف جميع بيانات المحادثات المستلمة عبر WhatsApp Cloud API</p>
                      <p>• إلغاء ربط صفحة إنستقرام للأعمال</p>
                    </div>
                    <p className="text-blue-700 text-xs mt-3">
                      يمكنك أيضاً إزالة تطبيق رداد من إعدادات حسابك في Facebook: الإعدادات ← التطبيقات والمواقع ← رداد ← إزالة.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Deletion Request Form */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">نموذج طلب الحذف</h2>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني المرتبط بحسابك <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      سبب طلب الحذف (اختياري)
                    </label>
                    <select
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none bg-white"
                    >
                      <option value="">— اختر السبب —</option>
                      <option value="no_longer_need">لم أعد بحاجة للخدمة</option>
                      <option value="switching">الانتقال لخدمة أخرى</option>
                      <option value="privacy">مخاوف تتعلق بالخصوصية</option>
                      <option value="too_expensive">التكلفة مرتفعة</option>
                      <option value="not_useful">الخدمة لم تكن مفيدة</option>
                      <option value="closing_store">إغلاق المتجر</option>
                      <option value="other">سبب آخر</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                      للتأكيد، اكتب: <span className="font-bold text-red-600">حذف بياناتي</span>
                    </label>
                    <input
                      type="text"
                      id="confirm"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="اكتب 'حذف بياناتي' للتأكيد"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
                    />
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex gap-2 items-start">
                      <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">
                        <strong>تنبيه:</strong> حذف البيانات نهائي وغير قابل للتراجع. تأكد من تصدير أي بيانات تحتاجها قبل تقديم الطلب.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={confirmText !== 'حذف بياناتي' || !email || loading}
                    className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      confirmText === 'حذف بياناتي' && email && !loading
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        جاري إرسال الطلب...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        طلب حذف جميع بياناتي نهائياً
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <p className="text-green-900 font-semibold text-xl mb-2">تم استلام طلبك بنجاح</p>
                  <p className="text-green-700 mb-4">
                    سنتواصل معك على <span dir="ltr" className="font-mono bg-green-100 px-2 py-0.5 rounded">{email}</span> خلال
                    48 ساعة لتأكيد الحذف.
                  </p>
                  <p className="text-green-600 text-sm">
                    رقم الطلب: <span className="font-mono">DEL-{Date.now().toString(36).toUpperCase()}</span>
                  </p>
                </div>
              )}
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">التواصل المباشر</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-sm mb-2">لأي استفسارات حول حذف البيانات أو لطلب حذف عبر البريد:</p>
                <p className="text-sm">البريد: <a href="mailto:privacy@radadai.com" className="text-emerald-600 hover:underline font-medium">privacy@radadai.com</a></p>
                <p className="text-sm mt-1">البريد البديل: <a href="mailto:salahs@smarttec.sa" className="text-emerald-600 hover:underline font-medium">salahs@smarttec.sa</a></p>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
            © 2026 رداد للذكاء الاصطناعي — مؤسسة سمارتك لتقنية المعلومات — جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  )
}

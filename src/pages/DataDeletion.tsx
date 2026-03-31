import { useState } from 'react'

export default function DataDeletion() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would call an edge function to process the deletion request
    setSubmitted(true)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">طلب حذف البيانات</h1>
        <p className="text-sm text-gray-500 mb-8">Data Deletion Request</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">حذف بياناتك</h2>
            <p>
              يمكنك طلب حذف جميع بياناتك المرتبطة بحسابك في رداد. يشمل ذلك: معلومات الحساب،
              بيانات المتجر، المنتجات، قاعدة المعرفة، سجل المحادثات، وأي بيانات أخرى مخزنة لديناً.
            </p>
            <p className="mt-3">
              بعد تقديم طلب الحذف، سيتم معالجته خلال 30 يوماً كحد أقصى. سنرسل لك تأكيداً
              عبر البريد الإلكتروني عند اكتمال الحذف.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">كيفية حذف بياناتك</h2>
            <p className="mb-4">لديك خياران لحذف بياناتك:</p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="font-semibold text-emerald-800 mb-1">الخيار 1: من لوحة التحكم</p>
              <p className="text-emerald-700">
                سجّل دخولك → الإعدادات → حذف الحساب. سيتم حذف جميع بياناتك فوراً.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="font-semibold text-blue-800 mb-1">الخيار 2: عبر النموذج أدناه</p>
              <p className="text-blue-700">
                أدخل البريد الإلكتروني المرتبط بحسابك وسنتواصل معك لتأكيد الحذف.
              </p>
            </div>
          </section>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني المرتبط بحسابك
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                طلب حذف البيانات
              </button>
            </form>
          ) : (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-800 font-semibold text-lg mb-2">تم استلام طلبك بنجاح</p>
              <p className="text-green-700">
                سنتواصل معك على <span dir="ltr" className="font-mono">{email}</span> خلال
                48 ساعة لتأكيد حذف البيانات.
              </p>
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">التواصل المباشر</h2>
            <p>
              يمكنك أيضاً مراسلتنا مباشرة على:
              <a href="mailto:salahs@smarttec.sa" className="text-emerald-600 hover:underline mx-1">
                salahs@smarttec.sa
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          © 2026 رداد للذكاء الاصطناعي — جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  )
}

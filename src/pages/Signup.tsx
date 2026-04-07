import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Signup() {
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, storeName)
    if (error) {
      setError('حدث خطأ في التسجيل، حاول مرة ثانية')
    } else {
      navigate('/setup')
    }
    setLoading(false)
  }

  const features = [
    { icon: '🤖', title: 'ذكاء اصطناعي متقدم', desc: 'يفهم استفسارات عملائك ويرد بشكل طبيعي' },
    { icon: '⚡', title: 'إعداد في دقائق', desc: 'وصّل متجرك بالواتساب وخلّه يشتغل' },
    { icon: '🕐', title: 'خدمة ٢٤/٧', desc: 'يرد على عملائك حتى وأنت نايم' },
  ]

  const badges = [
    '١٠ أيام مجانا',
    'بدون بطاقة ائتمان',
    'إلغاء في أي وقت',
  ]

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Decorative Side Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 animate-gradient">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute top-40 right-40 w-96 h-96 rounded-full border border-white" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-white" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-3 leading-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
              ابدأ رحلتك مع
              <br />
              <span className="text-white/90">رداد ستورز</span>
            </h2>
            <p className="text-lg text-white/75 mb-10 leading-relaxed">
              سجّل متجرك وخلّ الذكاء الاصطناعي يتولى خدمة عملائك
            </p>

            {/* Feature list */}
            <div className="space-y-6 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-0.5">{f.title}</h4>
                    <p className="text-sm text-white/70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {badges.map((b, i) => (
                <span key={i} className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Mobile gradient header */}
        <div className="lg:hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 px-6 py-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>رداد ستورز</h1>
          <p className="text-white/80 text-sm">سجّل متجرك وابدأ تجربتك المجانية</p>
          {/* Mobile badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {badges.map((b, i) => (
              <span key={i} className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs border border-white/20">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md animate-fade-in-up">
            {/* Logo - desktop only */}
            <div className="hidden lg:block text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl mb-4 shadow-lg shadow-emerald-200">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>إنشاء حساب جديد</h1>
              <p className="text-gray-500 text-sm">سجّل متجرك وابدأ تجربتك المجانية</p>
            </div>

            {/* Glass Card */}
            <div className="glass rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-white/60">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-fade-in">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                      placeholder="مثال: مطعم لذة"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                      placeholder="email@example.com"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                      placeholder="٦ أحرف على الأقل"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      جاري التسجيل...
                    </>
                  ) : 'ابدأ تجربتك المجانية (١٠ أيام)'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  بالتسجيل أنت توافق على شروط الاستخدام وسياسة الخصوصية
                </p>
              </form>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              عندك حساب؟{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                سجل دخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

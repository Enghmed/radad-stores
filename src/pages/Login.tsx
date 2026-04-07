import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Decorative Side Panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 animate-gradient">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute top-40 right-40 w-96 h-96 rounded-full border border-white" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 left-20 w-64 h-64 rounded-full border border-white" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="animate-fade-in-up">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
              خلّ الذكاء الاصطناعي
              <br />
              يرد على عملائك
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              رداد ستورز يربط متجرك بالواتساب ويجاوب على استفسارات عملائك تلقائيا على مدار الساعة
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3 space-x-reverse">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-xs font-bold">
                    {['م','أ','ع','ل'][i-1]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/70">+١٠٠ متجر يستخدم رداد</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Mobile gradient header */}
        <div className="lg:hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 px-6 py-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>رداد ستورز</h1>
          <p className="text-white/80 text-sm">خلّ الذكاء الاصطناعي يرد على عملائك</p>
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
              <h1 className="text-2xl font-bold gradient-text mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>رداد ستورز</h1>
              <p className="text-gray-500 text-sm">تسجيل الدخول إلى لوحة التحكم</p>
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

                {/* Email Field */}
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

                {/* Password Field */}
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
                      placeholder="••••••••"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
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
                      جاري الدخول...
                    </>
                  ) : 'تسجيل الدخول'}
                </button>
              </form>
            </div>

            {/* Signup link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              ما عندك حساب؟{' '}
              <Link to="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                سجل الآن
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

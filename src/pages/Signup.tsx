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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="bg-surface rounded-2xl shadow-lg p-8 w-full max-w-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">رداد ستورز</h1>
          <p className="text-muted">سجّل متجرك وخلّ الذكاء الاصطناعي يرد على عملائك</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">اسم المتجر</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="مثال: مطعم لذة"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="email@example.com"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="٦ أحرف على الأقل"
              dir="ltr"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'جاري التسجيل...' : 'ابدأ تجربتك المجانية (١٠ أيام)'}
          </button>

          <p className="text-xs text-muted text-center">
            بالتسجيل أنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          عندك حساب؟{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            سجل دخول
          </Link>
        </p>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { MessageSquare, Brain, Zap, Shield } from 'lucide-react'

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-primary" />
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted">{desc}</p>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">رداد ستورز</h1>
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-muted hover:text-secondary transition-colors">
              تسجيل دخول
            </Link>
            <Link to="/signup" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          مساعد ذكي على <span className="text-primary">الواتساب</span>
          <br />يرد على عملائك ٢٤/٧
        </h2>
        <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
          سجّل متجرك، أضف منتجاتك، وخلّ الذكاء الاصطناعي يرد على عملائك بالعربي.
          إذا ما عرف الجواب — يسألك ويتعلم. كل يوم يصير أذكى.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/signup" className="px-8 py-3 bg-primary text-white rounded-xl font-medium text-lg hover:bg-primary-dark transition-colors">
            جرّب ١٠ أيام مجاناً
          </Link>
        </div>
        <p className="text-sm text-muted mt-4">بدون بطاقة ائتمان — ١٠٠ رسالة مجاناً</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Feature
            icon={MessageSquare}
            title="يرد فوراً"
            desc="الذكاء الاصطناعي يرد على عملائك على الواتساب خلال ثواني، ٢٤ ساعة، ٧ أيام"
          />
          <Feature
            icon={Brain}
            title="يتعلم كل يوم"
            desc="إذا ما عرف جواب — يسألك. ترد مرة وحدة ويتذكر للأبد"
          />
          <Feature
            icon={Zap}
            title="جاهز بـ١٠ دقائق"
            desc="سجّل، أضف منتجاتك، وصّل الواتساب. خلاص شغّال!"
          />
          <Feature
            icon={Shield}
            title="آمن ومعزول"
            desc="بيانات كل متجر معزولة تماماً. ما أحد يقدر يشوف بيانات غيره"
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">اسعار بسيطة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <h3 className="font-bold text-lg mb-2">شهري</h3>
            <p className="text-4xl font-bold text-primary mb-1">١٠٠ <span className="text-lg">ريال</span></p>
            <p className="text-sm text-muted mb-6">في الشهر</p>
            <ul className="text-sm space-y-2 text-muted mb-6">
              <li>١٠,٠٠٠ رد بالشهر</li>
              <li>منتجات غير محدودة</li>
              <li>قاعدة معرفة ذكية</li>
              <li>لوحة تحكم + تلقرام</li>
            </ul>
            <Link to="/signup" className="block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              ابدأ مجاناً
            </Link>
          </div>

          <div className="bg-surface rounded-2xl border-2 border-primary p-8 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
              وفّر شهرين
            </span>
            <h3 className="font-bold text-lg mb-2">سنوي</h3>
            <p className="text-4xl font-bold text-primary mb-1">١,٠٠٠ <span className="text-lg">ريال</span></p>
            <p className="text-sm text-muted mb-6">في السنة (٨٣ ريال/شهر)</p>
            <ul className="text-sm space-y-2 text-muted mb-6">
              <li>١٠,٠٠٠ رد بالشهر</li>
              <li>منتجات غير محدودة</li>
              <li>قاعدة معرفة ذكية</li>
              <li>لوحة تحكم + تلقرام</li>
            </ul>
            <Link to="/signup" className="block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white/60 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p>رداد ستورز &copy; {new Date().getFullYear()} — من تطوير SmartTec Innovations</p>
        </div>
      </footer>
    </div>
  )
}

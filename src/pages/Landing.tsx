import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Brain, Zap, Shield, ChevronDown, CheckCircle, ArrowLeft, Star, Users, Clock } from 'lucide-react'

// ========================================
// WhatsApp Chat Demo Component
// ========================================
function WhatsAppDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0)
  const chatRef = useRef<HTMLDivElement>(null)

  const messages = [
    { type: 'customer', text: 'السلام عليكم، عندكم كيكة شوكولاتة؟', time: '٩:٤١ ص' },
    { type: 'typing', text: '' },
    { type: 'ai', text: 'وعليكم السلام! أهلاً فيك 😊\nأكيد عندنا كيكة شوكولاتة بلجيكية فاخرة بـ١٢٠ ريال. حجم كبير يكفي ١٢ شخص. تبي تطلب؟', time: '٩:٤١ ص' },
    { type: 'customer', text: 'كم سعر التوصيل للرياض؟', time: '٩:٤٢ ص' },
    { type: 'typing', text: '' },
    { type: 'ai', text: 'التوصيل داخل الرياض بـ٢٥ ريال، ويوصلك خلال ساعتين إن شاء الله 🚗', time: '٩:٤٢ ص' },
    { type: 'customer', text: 'ممتاز! أبي أطلب وحدة', time: '٩:٤٣ ص' },
    { type: 'typing', text: '' },
    { type: 'ai', text: 'تمام! أرسلي موقعك على الخريطة وبنجهز طلبك الحين 🎂✨', time: '٩:٤٣ ص' },
  ]

  useEffect(() => {
    if (visibleMessages >= messages.length) return
    const current = messages[visibleMessages]
    const delay = current?.type === 'typing' ? 1200 : current?.type === 'customer' ? 2000 : 800
    const timer = setTimeout(() => {
      setVisibleMessages(v => v + 1)
    }, delay)
    return () => clearTimeout(timer)
  }, [visibleMessages])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [visibleMessages])

  const displayMessages = messages.slice(0, visibleMessages).filter(m => m.type !== 'typing')
  const isTyping = visibleMessages < messages.length && messages[visibleMessages]?.type === 'typing'

  return (
    <div className="w-full max-w-[360px] mx-auto">
      {/* Phone frame */}
      <div className="bg-[#111b21] rounded-[2rem] p-2 shadow-2xl shadow-black/30">
        {/* Notch */}
        <div className="flex justify-center pt-1 pb-2">
          <div className="w-24 h-5 bg-black rounded-full"></div>
        </div>
        {/* WhatsApp header */}
        <div className="bg-[#1f2c34] rounded-t-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">🍰</div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">حلويات الريان</p>
            <p className="text-[#8696a0] text-[11px]">متصل الآن</p>
          </div>
          <div className="flex gap-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </div>
        </div>
        {/* Chat body */}
        <div
          ref={chatRef}
          className="bg-[#0b141a] px-3 py-4 h-[380px] overflow-y-auto space-y-2 scroll-smooth"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'a\' patternUnits=\'userSpaceOnUse\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M0 20h40M20 0v40\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'.15\' opacity=\'.05\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' fill=\'%230b141a\'/%3E%3Crect width=\'200\' height=\'200\' fill=\'url(%23a)\'/%3E%3C/svg%3E")' }}
        >
          {/* Date bubble */}
          <div className="flex justify-center mb-2">
            <span className="text-[10px] text-[#8696a0] bg-[#1d2a33] px-3 py-1 rounded-lg">اليوم</span>
          </div>

          {displayMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'customer' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-[13px] leading-relaxed ${
                  msg.type === 'customer'
                    ? 'bg-[#1d2a33] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#005c4b] text-[#e9edef] rounded-tl-none'
                }`}
                style={{ whiteSpace: 'pre-wrap', animationName: 'fadeInUp', animationDuration: '0.3s', animationFillMode: 'both' }}
              >
                {msg.text}
                <span className="text-[10px] text-[#8696a0] float-left ml-0 mr-2 mt-1">
                  {msg.time}
                  {msg.type === 'ai' && <span className="text-[#53bdeb] mr-1">✓✓</span>}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-[#005c4b] px-4 py-3 rounded-lg rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Input bar */}
        <div className="bg-[#1f2c34] rounded-b-xl px-3 py-2 flex items-center gap-2">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
            <span className="text-[#8696a0] text-[13px]">اكتب رسالة...</span>
          </div>
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
        </div>
        {/* Home bar */}
        <div className="flex justify-center py-2">
          <div className="w-28 h-1 bg-white/20 rounded-full"></div>
        </div>
      </div>
      {/* AI badge */}
      <div className="flex justify-center mt-4">
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-emerald-700 text-xs font-medium">رداد AI يرد — مو موظف</span>
        </div>
      </div>
    </div>
  )
}

// ========================================
// Escalation Demo Component
// ========================================
function EscalationDemo() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Step 1 */}
      <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-lg">❓</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">عميل يسأل سؤال ما يعرف جوابه</p>
          <p className="text-xs text-gray-500 mt-1">"هل عندكم خدمة تغليف هدايا؟"</p>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center"><ChevronDown size={20} className="text-emerald-400" /></div>
      {/* Step 2 */}
      <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-lg">📱</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">رداد يرسلك إشعار على تلقرام</p>
          <p className="text-xs text-gray-500 mt-1">"سؤال جديد محتاج ردك: هل عندكم تغليف هدايا؟"</p>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center"><ChevronDown size={20} className="text-emerald-400" /></div>
      {/* Step 3 */}
      <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-lg">💬</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">ترد مرة وحدة "أيوا عندنا بـ١٥ ريال"</p>
          <p className="text-xs text-gray-500 mt-1">رداد يرد على العميل ويحفظ الجواب للأبد</p>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center"><ChevronDown size={20} className="text-emerald-400" /></div>
      {/* Step 4 */}
      <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 shadow-sm border border-emerald-200">
        <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center shrink-0">
          <span className="text-lg">🧠</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">المرة الجاية يرد تلقائياً!</p>
          <p className="text-xs text-emerald-600 mt-1">أي عميل يسأل نفس السؤال — رداد يجاوب بدون ما يزعجك</p>
        </div>
      </div>
    </div>
  )
}

// ========================================
// Stats Counter
// ========================================
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target])

  return <div ref={ref} className="text-4xl md:text-5xl font-bold text-emerald-600">{count.toLocaleString('ar-SA')}{suffix}</div>
}

// ========================================
// Main Landing Page
// ========================================
export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-hidden" dir="rtl">
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ========================================
          Sticky Header
      ======================================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="رداد ستورز" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-bold text-gray-900">رداد ستورز</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">المميزات</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">كيف يعمل</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">الأسعار</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              دخول
            </Link>
            <Link to="/signup" className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
              جرّب مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================
          Hero Section
      ======================================== */}
      <section className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-20 -right-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text side */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-700 text-sm font-medium">أول منصة سعودية — بالعامية</span>
              </div>

              <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-[1.2] mb-6">
                خلّ الذكاء الاصطناعي
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">
                  يرد على عملائك
                </span>
                <br />
                على الواتساب ٢٤/٧
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                سجّل متجرك بدقيقتين، أضف منتجاتك، ووصّل الواتساب.
                الذكاء الاصطناعي يرد بالسعودي، وإذا ما عرف الجواب — يسألك
                ويتعلم. <strong className="text-gray-700">كل يوم يصير أذكى.</strong>
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5"
                >
                  ابدأ مجاناً — ١٠ أيام
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium text-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  شوف كيف يعمل
                  <ArrowLeft size={18} />
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-emerald-500" /> بدون بطاقة ائتمان</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-emerald-500" /> ١٠٠ رسالة مجاناً</span>
              </div>
            </div>

            {/* Phone demo side */}
            <div className="animate-float">
              <WhatsAppDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Social Proof Bar
      ======================================== */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <AnimatedNumber target={500} suffix="+" />
            <p className="text-sm text-gray-500 mt-1">متجر مشترك</p>
          </div>
          <div>
            <AnimatedNumber target={50000} suffix="+" />
            <p className="text-sm text-gray-500 mt-1">رسالة تم الرد عليها</p>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-600">٣ ثواني</div>
            <p className="text-sm text-gray-500 mt-1">متوسط وقت الرد</p>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-600">٤.٩ ⭐</div>
            <p className="text-sm text-gray-500 mt-1">تقييم العملاء</p>
          </div>
        </div>
      </section>

      {/* ========================================
          Features
      ======================================== */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">كل شيء تحتاجه في مكان واحد</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">منصة متكاملة تخلي متجرك يرد على العملاء تلقائياً ويتعلم من كل محادثة</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '💬', title: 'رد فوري بالعامي', desc: 'الذكاء الاصطناعي يرد بلهجة سعودية طبيعية. عملائك يحسون إنهم يكلمون شخص حقيقي.' },
              { icon: '🧠', title: 'يتعلم ذاتياً', desc: 'إذا جاه سؤال ما يعرف جوابه — يرسلك على تلقرام. ترد مرة وحدة ويتذكر للأبد.' },
              { icon: '📸', title: 'واتساب + إنستقرام', desc: 'يرد على العملاء في واتساب والدايركت. قناتين بذكاء اصطناعي واحد.' },
              { icon: '📊', title: 'لوحة تحكم ذكية', desc: 'شوف كل المحادثات، المنتجات، والإحصائيات في مكان واحد. بالعربي طبعاً.' },
              { icon: '📢', title: 'رسائل تسويقية', desc: 'أنشئ قوالب واتساب وأرسل عروض وتخفيضات لكل عملائك بضغطة زر.' },
              { icon: '🔒', title: 'آمن ومعزول', desc: 'بيانات كل متجر معزولة تماماً. ما أحد يقدر يشوف بيانات غيره. تشفير كامل.' },
            ].map((f, i) => (
              <div key={i} className="group bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-lg hover:shadow-emerald-50 hover:border-emerald-200 transition-all duration-300">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          How It Works — Self-Learning Loop
      ======================================== */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">ذكاء اصطناعي يتعلم منك</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">إذا جاه سؤال ما يعرف جوابه — يسألك على تلقرام. ترد مرة وحدة وما يسألك مرة ثانية</p>
          </div>
          <EscalationDemo />
        </div>
      </section>

      {/* ========================================
          Pricing
      ======================================== */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">أسعار بسيطة وواضحة</h2>
            <p className="text-lg text-gray-500">ابدأ مجاناً. لا عقود، لا رسوم خفية.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free Trial */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1">تجربة مجانية</h3>
              <p className="text-sm text-gray-500 mb-6">جرّب بدون أي التزام</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">مجاناً</p>
              <p className="text-sm text-gray-400 mb-8">١٠ أيام</p>
              <Link to="/signup" className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-center font-medium hover:bg-gray-200 transition-colors">
                ابدأ الآن
              </Link>
              <div className="mt-6 space-y-3 text-sm text-gray-500">
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> ١٠٠ رد ذكي</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> واتساب + إنستقرام</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> لوحة تحكم كاملة</p>
              </div>
            </div>

            {/* Monthly */}
            <div className="bg-white border-2 border-emerald-500 rounded-2xl p-8 relative shadow-lg shadow-emerald-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full font-medium">
                الأكثر طلباً
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">شهري</h3>
              <p className="text-sm text-gray-500 mb-6">للمتاجر النشطة</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">١٠٠ <span className="text-lg font-normal text-gray-400">ريال</span></p>
              <p className="text-sm text-gray-400 mb-8">شهرياً</p>
              <Link to="/signup" className="block w-full py-3 bg-emerald-600 text-white rounded-xl text-center font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                ابدأ مجاناً
              </Link>
              <div className="mt-6 space-y-3 text-sm text-gray-500">
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> ١٠,٠٠٠ رد بالشهر</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> منتجات غير محدودة</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> قاعدة معرفة ذكية</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> رسائل تسويقية</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> إشعارات تلقرام</p>
              </div>
            </div>

            {/* Yearly */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1">سنوي</h3>
              <p className="text-sm text-emerald-600 font-medium mb-6">وفّر شهرين!</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">١,٠٠٠ <span className="text-lg font-normal text-gray-400">ريال</span></p>
              <p className="text-sm text-gray-400 mb-8">سنوياً (٨٣ ريال/شهر)</p>
              <Link to="/signup" className="block w-full py-3 bg-gray-900 text-white rounded-xl text-center font-medium hover:bg-gray-800 transition-colors">
                ابدأ مجاناً
              </Link>
              <div className="mt-6 space-y-3 text-sm text-gray-500">
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> كل مميزات الشهري</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> أولوية في الدعم</p>
                <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> خصم ١٧٪</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FAQ
      ======================================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">أسئلة شائعة</h2>
          <div className="space-y-4">
            {[
              { q: 'هل أحتاج خبرة تقنية؟', a: 'أبداً! كل شيء جاهز. بس سجّل، أضف منتجاتك، ووصّل الواتساب بضغطة زر. ما تحتاج مبرمج.' },
              { q: 'كيف الذكاء الاصطناعي يعرف يرد صح؟', a: 'رداد يقرأ منتجاتك وقاعدة المعرفة ويرد بناءً عليها. وإذا جاه سؤال ما يعرفه، يسألك على تلقرام وما يختلق إجابات.' },
              { q: 'هل يشتغل مع أي رقم واتساب؟', a: 'يشتغل مع WhatsApp Business API. تقدر توصّل رقمك من لوحة التحكم بدقيقتين — بس سجّل دخول بحساب فيسبوك.' },
              { q: 'لو ما عجبني أقدر ألغي؟', a: 'أكيد! تقدر تلغي اشتراكك أي وقت من لوحة التحكم. ولا فيه أي عقود أو غرامات.' },
              { q: 'هل بياناتي آمنة؟', a: 'بيانات كل متجر معزولة تماماً بتقنية Row Level Security. ما أحد يقدر يشوف بيانات متجر ثاني. تشفير كامل.' },
            ].map((item, i) => (
              <details key={i} className="group bg-white border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-gray-900 hover:bg-gray-50">
                  {item.q}
                  <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          Final CTA
      ======================================== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">جاهز تخلي متجرك يرد ٢٤/٧؟</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                انضم لمئات المتاجر السعودية اللي وفّرت وقتها وزادت مبيعاتها مع رداد
              </p>
              <Link
                to="/signup"
                className="inline-block px-10 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
              >
                ابدأ مجاناً الحين
              </Link>
              <p className="text-emerald-200 text-sm mt-4">١٠ أيام مجاناً · بدون بطاقة ائتمان · إلغاء أي وقت</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Footer
      ======================================== */}
      <footer className="bg-gray-900 text-white/60 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.png" alt="رداد ستورز" className="w-10 h-10 rounded-full" />
                <span className="text-lg font-bold text-white">رداد ستورز</span>
              </div>
              <p className="text-sm leading-relaxed">مساعد ذكي على الواتساب يرد على عملاء المتاجر السعودية بالعامية. يتعلم كل يوم ويصير أذكى.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">روابط</h4>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block hover:text-white transition-colors">المميزات</a>
                <a href="#pricing" className="block hover:text-white transition-colors">الأسعار</a>
                <Link to="/privacy" className="block hover:text-white transition-colors">سياسة الخصوصية</Link>
                <Link to="/terms" className="block hover:text-white transition-colors">شروط الاستخدام</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">تواصل معنا</h4>
              <div className="space-y-2 text-sm">
                <p>salahs@smarttec.sa</p>
                <p>المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm">
            <p>رداد ستورز © {new Date().getFullYear()} — من تطوير SmartTec Innovations</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

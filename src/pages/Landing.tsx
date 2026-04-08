import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Brain, Zap, Shield, ChevronDown, CheckCircle, ArrowLeft, Star, Users, Clock, Sparkles, Globe, BarChart3, Lock, Send, Megaphone } from 'lucide-react'

// ========================================
// Intersection Observer Hook for Scroll Animations
// ========================================
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

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
      <div className="bg-[#111b21] rounded-[2rem] p-2 shadow-2xl shadow-black/30 ring-1 ring-white/10">
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
        <div className="glass bg-emerald-50/80 border border-emerald-200/60 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/10">
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
  const reveal = useScrollReveal()

  return (
    <div ref={reveal.ref} className={`space-y-4 max-w-md mx-auto transition-all duration-700 ${reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Step 1 */}
      <div className="flex items-start gap-3 glass bg-white/80 rounded-2xl p-5 shadow-lg shadow-black/5 border border-white/60 card-hover">
        <div className="w-11 h-11 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-lg">❓</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">عميل يسأل سؤال ما يعرف جوابه</p>
          <p className="text-xs text-gray-500 mt-1.5">"هل عندكم خدمة تغليف هدايا؟"</p>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <ChevronDown size={18} className="text-emerald-500" />
        </div>
      </div>
      {/* Step 2 */}
      <div className="flex items-start gap-3 glass bg-white/80 rounded-2xl p-5 shadow-lg shadow-black/5 border border-white/60 card-hover">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-lg">📱</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">رداد يرسلك إشعار على تلقرام</p>
          <p className="text-xs text-gray-500 mt-1.5">"سؤال جديد محتاج ردك: هل عندكم تغليف هدايا؟"</p>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <ChevronDown size={18} className="text-emerald-500" />
        </div>
      </div>
      {/* Step 3 */}
      <div className="flex items-start gap-3 glass bg-white/80 rounded-2xl p-5 shadow-lg shadow-black/5 border border-white/60 card-hover">
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-lg">💬</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">ترد مرة وحدة "أيوا عندنا بـ١٥ ريال"</p>
          <p className="text-xs text-gray-500 mt-1.5">رداد يرد على العميل ويحفظ الجواب للأبد</p>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <ChevronDown size={18} className="text-emerald-500" />
        </div>
      </div>
      {/* Step 4 */}
      <div className="flex items-start gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-lg shadow-emerald-500/10 border border-emerald-200/60 card-hover">
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
          <span className="text-lg">🧠</span>
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">المرة الجاية يرد تلقائياً!</p>
          <p className="text-xs text-emerald-600 mt-1.5">أي عميل يسأل نفس السؤال — رداد يجاوب بدون ما يزعجك</p>
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

  return <div ref={ref} className="text-4xl md:text-5xl font-bold gradient-text">{count.toLocaleString('ar-SA')}{suffix}</div>
}

// ========================================
// FAQ Item Component
// ========================================
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`group glass rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen ? 'bg-white/90 shadow-lg shadow-emerald-500/5 border-emerald-200/50' : 'bg-white/60 hover:bg-white/80 border-white/40'
      } border`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 md:p-6 cursor-pointer text-right"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            isOpen ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {index + 1}
          </div>
          <span className="font-bold text-gray-900">{question}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 shrink-0 mr-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-gray-500 leading-relaxed mr-11">{answer}</div>
      </div>
    </div>
  )
}

// ========================================
// Main Landing Page
// ========================================
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const featuresReveal = useScrollReveal()
  const pricingReveal = useScrollReveal()
  const statsReveal = useScrollReveal()
  const ctaReveal = useScrollReveal()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon: <MessageSquare size={24} />, title: 'رد فوري بالعامي', desc: 'الذكاء الاصطناعي يرد بلهجة سعودية طبيعية. عملائك يحسون إنهم يكلمون شخص حقيقي.', gradient: 'from-emerald-400 to-teal-500' },
    { icon: <Brain size={24} />, title: 'يتعلم ذاتياً', desc: 'إذا جاه سؤال ما يعرف جوابه — يرسلك على تلقرام. ترد مرة وحدة ويتذكر للأبد.', gradient: 'from-violet-400 to-purple-500' },
    { icon: <Globe size={24} />, title: 'واتساب + تلقرام', desc: 'يرد على العملاء في واتساب ويرسلك إشعارات على تلقرام. قنواتك بذكاء اصطناعي واحد.', gradient: 'from-blue-400 to-cyan-500' },
    { icon: <BarChart3 size={24} />, title: 'لوحة تحكم ذكية', desc: 'شوف كل المحادثات، المنتجات، والإحصائيات في مكان واحد. بالعربي طبعاً.', gradient: 'from-amber-400 to-orange-500' },
    { icon: <Megaphone size={24} />, title: 'رسائل تسويقية', desc: 'أنشئ قوالب واتساب وأرسل عروض وتخفيضات لكل عملائك بضغطة زر.', gradient: 'from-pink-400 to-rose-500' },
    { icon: <Lock size={24} />, title: 'آمن ومعزول', desc: 'بيانات كل متجر معزولة تماماً. ما أحد يقدر يشوف بيانات غيره. تشفير كامل.', gradient: 'from-slate-400 to-gray-600' },
  ]

  const faqs = [
    { q: 'هل أحتاج خبرة تقنية؟', a: 'أبداً! كل شيء جاهز. بس سجّل، أضف منتجاتك، ووصّل الواتساب بضغطة زر. ما تحتاج مبرمج.' },
    { q: 'كيف الذكاء الاصطناعي يعرف يرد صح؟', a: 'رداد يقرأ منتجاتك وقاعدة المعرفة ويرد بناءً عليها. وإذا جاه سؤال ما يعرفه، يسألك على تلقرام وما يختلق إجابات.' },
    { q: 'هل يشتغل مع أي رقم واتساب؟', a: 'يشتغل مع WhatsApp Business API. تقدر توصّل رقمك من لوحة التحكم بدقيقتين — بس سجّل دخول بحساب فيسبوك.' },
    { q: 'لو ما عجبني أقدر ألغي؟', a: 'أكيد! تقدر تلغي اشتراكك أي وقت من لوحة التحكم. ولا فيه أي عقود أو غرامات.' },
    { q: 'هل بياناتي آمنة؟', a: 'بيانات كل متجر معزولة تماماً بتقنية Row Level Security. ما أحد يقدر يشوف بيانات متجر ثاني. تشفير كامل.' },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden" dir="rtl">

      {/* ========================================
          Sticky Header — Glass Effect
      ======================================== */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass bg-white/70 shadow-lg shadow-black/5 border-b border-white/50'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img src="/logo.png" alt="رداد ستورز" className="w-10 h-10 rounded-full ring-2 ring-emerald-500/20" />
              <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-xl font-extrabold text-gray-900">رداد <span className="gradient-text">ستورز</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors relative group">
              المميزات
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors relative group">
              كيف يعمل
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors relative group">
              الأسعار
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              دخول
            </Link>
            <Link to="/signup" className="px-6 py-2.5 text-sm bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 animate-pulse-glow">
              جرّب مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================
          Hero Section — Mesh Gradient Background
      ======================================== */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[100px]"></div>
          <div className="absolute top-20 -right-20 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[100px]"></div>
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
          {/* Floating decorative elements */}
          <div className="absolute top-32 left-[15%] w-3 h-3 bg-emerald-400/40 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-48 right-[20%] w-2 h-2 bg-teal-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-[25%] w-4 h-4 bg-emerald-300/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[60%] right-[10%] w-2.5 h-2.5 bg-cyan-400/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-20 left-[40%] w-2 h-2 bg-emerald-500/20 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-8 pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 glass bg-emerald-50/60 border border-emerald-200/50 px-5 py-2.5 rounded-full mb-8 shadow-lg shadow-emerald-500/5">
                <Sparkles size={14} className="text-emerald-500" />
                <span className="text-emerald-700 text-sm font-bold">أول منصة سعودية — بالعامية</span>
              </div>

              <h1 className="text-5xl md:text-[3.75rem] lg:text-[4.25rem] font-extrabold text-gray-900 leading-[1.15] mb-8">
                خلّ الذكاء الاصطناعي
                <br />
                <span className="gradient-text text-6xl md:text-[4.25rem] lg:text-[4.75rem]">
                  يرد على عملائك
                </span>
                <br />
                على الواتساب ٢٤/٧
              </h1>

              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg">
                سجّل متجرك بدقيقتين، أضف منتجاتك، ووصّل الواتساب.
                الذكاء الاصطناعي يرد بالسعودي، وإذا ما عرف الجواب — يسألك
                ويتعلم. <strong className="text-gray-700">كل يوم يصير أذكى.</strong>
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  to="/signup"
                  className="group px-9 py-4 bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 flex items-center gap-2"
                >
                  ابدأ مجاناً — ١٠ أيام
                  <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 glass bg-white/60 text-gray-700 rounded-2xl font-medium text-lg hover:bg-white/90 transition-all duration-300 flex items-center gap-2 border border-gray-200/50 hover:border-emerald-200"
                >
                  شوف كيف يعمل
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
          Social Proof Bar — Glass Cards
      ======================================== */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white pointer-events-none"></div>
        <div ref={statsReveal.ref} className={`max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-5 relative z-10 transition-all duration-700 ${statsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { content: <AnimatedNumber target={500} suffix="+" />, label: 'متجر مشترك' },
            { content: <AnimatedNumber target={50000} suffix="+" />, label: 'رسالة تم الرد عليها' },
            { content: <div className="text-4xl md:text-5xl font-bold gradient-text">٣ ثواني</div>, label: 'متوسط وقت الرد' },
            { content: <div className="text-4xl md:text-5xl font-bold gradient-text">٤.٩ ⭐</div>, label: 'تقييم العملاء' },
          ].map((stat, i) => (
            <div key={i} className="glass bg-white/70 rounded-2xl p-6 text-center card-hover border border-white/60 shadow-lg shadow-black/5">
              {stat.content}
              <p className="text-sm text-gray-500 mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================
          Features — Premium Cards
      ======================================== */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-emerald-100/30 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/4 -right-40 w-80 h-80 bg-teal-100/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass bg-emerald-50/60 px-4 py-2 rounded-full mb-6 border border-emerald-100/50">
              <Zap size={14} className="text-emerald-500" />
              <span className="text-emerald-700 text-xs font-bold">منصة متكاملة</span>
            </div>
            <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5">كل شيء تحتاجه في مكان واحد</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">منصة متكاملة تخلي متجرك يرد على العملاء تلقائياً ويتعلم من كل محادثة</p>
          </div>

          <div ref={featuresReveal.ref} className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${featuresReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {features.map((f, i) => (
              <div
                key={i}
                className="group glass bg-white/70 border border-white/60 rounded-2xl p-8 card-hover hover:border-emerald-200/50 shadow-lg shadow-black/5 relative overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/30 transition-all duration-500 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          How It Works — Self-Learning Loop
      ======================================== */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass bg-violet-50/60 px-4 py-2 rounded-full mb-6 border border-violet-100/50">
              <Brain size={14} className="text-violet-500" />
              <span className="text-violet-700 text-xs font-bold">تعلّم ذاتي</span>
            </div>
            <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5">ذكاء اصطناعي يتعلم منك</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">إذا جاه سؤال ما يعرف جوابه — يسألك على تلقرام. ترد مرة وحدة وما يسألك مرة ثانية</p>
          </div>
          <EscalationDemo />
        </div>
      </section>

      {/* ========================================
          Pricing — Glassmorphism Cards
      ======================================== */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px]"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass bg-amber-50/60 px-4 py-2 rounded-full mb-6 border border-amber-100/50">
              <Star size={14} className="text-amber-500" />
              <span className="text-amber-700 text-xs font-bold">أسعار شفافة</span>
            </div>
            <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 mb-5">أسعار بسيطة وواضحة</h2>
            <p className="text-lg text-gray-500">ابدأ مجاناً. لا عقود، لا رسوم خفية.</p>
          </div>

          <div ref={pricingReveal.ref} className={`grid md:grid-cols-3 gap-6 max-w-4xl mx-auto transition-all duration-700 ${pricingReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Free Trial */}
            <div className="glass bg-white/70 border border-white/60 rounded-3xl p-8 card-hover shadow-lg shadow-black/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-gray-300 to-gray-400"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">تجربة مجانية</h3>
              <p className="text-sm text-gray-500 mb-6">جرّب بدون أي التزام</p>
              <p className="text-5xl font-extrabold text-gray-900 mb-1">مجاناً</p>
              <p className="text-sm text-gray-400 mb-8">١٠ أيام</p>
              <Link to="/signup" className="block w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl text-center font-bold hover:bg-gray-200 transition-all duration-300 hover:shadow-md">
                ابدأ الآن
              </Link>
              <div className="mt-8 space-y-3.5 text-sm text-gray-500">
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> ١٠٠ رد ذكي</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> واتساب</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> لوحة تحكم كاملة</p>
              </div>
            </div>

            {/* Monthly — Featured */}
            <div className="relative glass bg-white/80 border-2 border-emerald-400/60 rounded-3xl p-8 shadow-2xl shadow-emerald-500/15 card-hover md:-mt-4 md:mb-[-1rem] overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-l from-emerald-400 to-teal-500 animate-shimmer"></div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-l from-emerald-500 to-teal-500 text-white text-xs px-5 py-1.5 rounded-full font-bold shadow-lg shadow-emerald-500/30">
                  الأكثر طلباً
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 mt-2">شهري</h3>
              <p className="text-sm text-gray-500 mb-6">للمتاجر النشطة</p>
              <p className="text-5xl font-extrabold text-gray-900 mb-1">١٠٠ <span className="text-lg font-normal text-gray-400">ريال</span></p>
              <p className="text-sm text-gray-400 mb-8">شهرياً</p>
              <Link to="/signup" className="block w-full py-3.5 bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-xl text-center font-bold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5">
                ابدأ مجاناً
              </Link>
              <div className="mt-8 space-y-3.5 text-sm text-gray-500">
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> ١٠,٠٠٠ رد بالشهر</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> منتجات غير محدودة</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> قاعدة معرفة ذكية</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> رسائل تسويقية</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> إشعارات تلقرام</p>
              </div>
            </div>

            {/* Yearly */}
            <div className="glass bg-white/70 border border-white/60 rounded-3xl p-8 card-hover shadow-lg shadow-black/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-gray-800 to-gray-900"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">سنوي</h3>
              <p className="text-sm text-emerald-600 font-bold mb-6">وفّر شهرين!</p>
              <p className="text-5xl font-extrabold text-gray-900 mb-1">١,٠٠٠ <span className="text-lg font-normal text-gray-400">ريال</span></p>
              <p className="text-sm text-gray-400 mb-8">سنوياً (٨٣ ريال/شهر)</p>
              <Link to="/signup" className="block w-full py-3.5 bg-gray-900 text-white rounded-xl text-center font-bold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                ابدأ مجاناً
              </Link>
              <div className="mt-8 space-y-3.5 text-sm text-gray-500">
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> كل مميزات الشهري</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> أولوية في الدعم</p>
                <p className="flex items-center gap-2.5"><CheckCircle size={16} className="text-emerald-500 shrink-0" /> خصم ١٧٪</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FAQ — Refined Interactions
      ======================================== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white pointer-events-none"></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 glass bg-blue-50/60 px-4 py-2 rounded-full mb-6 border border-blue-100/50">
              <MessageSquare size={14} className="text-blue-500" />
              <span className="text-blue-700 text-xs font-bold">أسئلة شائعة</span>
            </div>
            <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900">أسئلة شائعة</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          Final CTA — Animated Gradient Background
      ======================================== */}
      <section className="py-24">
        <div ref={ctaReveal.ref} className={`max-w-4xl mx-auto px-6 transition-all duration-700 ${ctaReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative rounded-[2rem] p-12 md:p-20 text-center text-white overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 animate-gradient"></div>
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-60 h-60 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px]"></div>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 animate-shimmer opacity-30"></div>
            {/* Floating dots */}
            <div className="absolute top-10 right-10 w-3 h-3 bg-white/20 rounded-full animate-float"></div>
            <div className="absolute bottom-16 left-16 w-2 h-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/3 left-10 w-2.5 h-2.5 bg-white/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
                <Sparkles size={14} className="text-emerald-200" />
                <span className="text-emerald-100 text-sm font-bold">ابدأ رحلتك الآن</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">جاهز تخلي متجرك يرد ٢٤/٧؟</h2>
              <p className="text-emerald-100 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                انضم لمئات المتاجر السعودية اللي وفّرت وقتها وزادت مبيعاتها مع رداد
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-12 py-5 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all duration-300 shadow-2xl shadow-black/20 hover:-translate-y-1 hover:shadow-3xl group"
              >
                ابدأ مجاناً الحين
                <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
              <p className="text-emerald-200/80 text-sm mt-6 flex items-center justify-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5"><CheckCircle size={14} /> ١٠ أيام مجاناً</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} /> بدون بطاقة ائتمان</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={14} /> إلغاء أي وقت</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Footer — Premium Dark
      ======================================== */}
      <footer className="relative bg-gray-950 text-white/60 pt-16 pb-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-900/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-0 right-0 w-60 h-60 bg-teal-900/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="رداد ستورز" className="w-10 h-10 rounded-full ring-2 ring-emerald-500/30" />
                <span className="text-lg font-extrabold text-white">رداد <span className="text-emerald-400">ستورز</span></span>
              </div>
              <p className="text-sm leading-relaxed">مساعد ذكي على الواتساب يرد على عملاء المتاجر السعودية بالعامية. يتعلم كل يوم ويصير أذكى.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">روابط</h4>
              <div className="space-y-2.5 text-sm">
                <a href="#features" className="block hover:text-emerald-400 transition-colors">المميزات</a>
                <a href="#pricing" className="block hover:text-emerald-400 transition-colors">الأسعار</a>
                <Link to="/privacy" className="block hover:text-emerald-400 transition-colors">سياسة الخصوصية</Link>
                <Link to="/terms" className="block hover:text-emerald-400 transition-colors">شروط الاستخدام</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">تواصل معنا</h4>
              <div className="space-y-2.5 text-sm">
                <p className="hover:text-emerald-400 transition-colors">salahs@smarttec.sa</p>
                <p>المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm">
            <p className="text-white/40">رداد ستورز © {new Date().getFullYear()} — من تطوير <span className="text-white/60">SmartTec Innovations</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

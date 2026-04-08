import { useMemo } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import {
  MessageSquare,
  Users,
  Brain,
  AlertCircle,
  Plus,
  BookOpen,
  Smartphone,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Sparkles,
  MessageCircle,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Greeting helper                                                    */
/* ------------------------------------------------------------------ */
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'مساء الخير'
  if (hour < 12) return 'صباح الخير'
  if (hour < 17) return 'مساء الخير'
  return 'مساء الخير'
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '🌙'
  if (hour < 12) return '☀️'
  if (hour < 17) return '🌤️'
  return '🌙'
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  colorClass,
  gradientFrom,
  gradientTo,
  delay,
}: {
  icon: any
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  colorClass: string
  gradientFrom: string
  gradientTo: string
  delay: string
}) {
  return (
    <div
      className={`stat-card ${colorClass} bg-surface rounded-2xl border border-border p-6 card-hover animate-fade-in-up`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg`}
        >
          <Icon size={22} className="text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : trend === 'down'
                ? 'bg-red-50 text-red-500'
                : 'bg-slate-100 text-muted'
            }`}
          >
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-sm text-muted mt-1.5 font-medium">{label}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Quick Action Card                                                  */
/* ------------------------------------------------------------------ */
function QuickAction({
  icon: Icon,
  title,
  description,
  href,
  gradientFrom,
  gradientTo,
  delay,
}: {
  icon: any
  title: string
  description: string
  href: string
  gradientFrom: string
  gradientTo: string
  delay: string
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 bg-surface rounded-2xl border border-border p-5 card-hover animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <ArrowLeft
        size={18}
        className="text-muted group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300 shrink-0"
      />
    </a>
  )
}

/* ------------------------------------------------------------------ */
/*  Conversation Item                                                  */
/* ------------------------------------------------------------------ */
function ConversationItem({
  name,
  message,
  time,
  platform,
  unread,
}: {
  name: string
  message: string
  time: string
  platform: 'whatsapp'
  unread?: boolean
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors duration-200 group">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
          {initials}
        </div>
        {/* Platform badge */}
        <div
          className="absolute -bottom-0.5 -left-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm border-2 border-white bg-green-500"
        >
          W
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`font-bold text-sm ${unread ? 'text-secondary' : 'text-secondary/80'}`}>{name}</span>
          <span className="text-[11px] text-muted shrink-0">{time}</span>
        </div>
        <p className={`text-xs truncate ${unread ? 'text-secondary font-medium' : 'text-muted'}`}>{message}</p>
      </div>

      {/* Unread dot */}
      {unread && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 animate-pulse-glow" />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const { store } = useAuth()

  const greeting = useMemo(() => getGreeting(), [])
  const greetingEmoji = useMemo(() => getGreetingEmoji(), [])

  // Mock data for conversations (replace with real data when available)
  const recentConversations: any[] = []

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Welcome Header ─────────────────────────── */}
        <div className="animate-fade-in-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {greeting} {greetingEmoji}
                <span className="gradient-text mr-2">{store?.store_name}</span>
              </h1>
              <p className="text-muted mt-2 text-base">
                إليك نظرة سريعة على أداء متجرك اليوم
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                متصل
              </span>
            </div>
          </div>
        </div>

        {/* ── Setup Warning ──────────────────────────── */}
        {!store?.setup_completed && (
          <div className="animate-fade-in-up bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shrink-0 shadow-md">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-amber-800">إعدادات المتجر غير مكتملة</p>
              <p className="text-xs text-amber-600 mt-0.5">
                أكمل إعداد متجرك لتفعيل جميع المميزات
              </p>
            </div>
            <a
              href="/setup"
              className="btn-primary text-sm !py-2.5 !px-5 !rounded-xl shrink-0"
            >
              أكمل الإعداد
            </a>
          </div>
        )}

        {/* ── Stats Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={MessageSquare}
            label="رسائل اليوم"
            value="0"
            trend="neutral"
            trendLabel="--"
            colorClass="stat-card-green"
            gradientFrom="from-emerald-400"
            gradientTo="to-cyan-400"
            delay="0.05s"
          />
          <StatCard
            icon={Users}
            label="العملاء"
            value="0"
            trend="neutral"
            trendLabel="--"
            colorClass="stat-card-blue"
            gradientFrom="from-blue-400"
            gradientTo="to-violet-400"
            delay="0.1s"
          />
          <StatCard
            icon={Brain}
            label="أسئلة تعلّمها الذكاء"
            value="0"
            trend="neutral"
            trendLabel="--"
            colorClass="stat-card-purple"
            gradientFrom="from-violet-400"
            gradientTo="to-pink-400"
            delay="0.15s"
          />
          <StatCard
            icon={AlertCircle}
            label="بانتظار ردّك"
            value="0"
            trend="neutral"
            trendLabel="--"
            colorClass="stat-card-amber"
            gradientFrom="from-amber-400"
            gradientTo="to-red-400"
            delay="0.2s"
          />
        </div>

        {/* ── Bottom Grid: Conversations + Quick Actions ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Conversations */}
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-border animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-primary" />
                <h2 className="text-lg font-extrabold">آخر المحادثات</h2>
              </div>
              {recentConversations.length > 0 && (
                <a href="/conversations" className="text-xs text-primary font-semibold hover:underline">
                  عرض الكل
                </a>
              )}
            </div>

            {recentConversations.length === 0 ? (
              /* Empty state */
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center mx-auto mb-5">
                  <MessageSquare size={36} className="text-emerald-300" />
                </div>
                <p className="font-bold text-secondary/80">لا توجد محادثات بعد</p>
                <p className="text-sm text-muted mt-2 max-w-xs mx-auto leading-relaxed">
                  بمجرد أن يراسلك عميل على الواتساب، ستظهر المحادثات هنا تلقائيًا
                </p>
                <a
                  href="/channels"
                  className="inline-flex items-center gap-2 btn-primary text-sm mt-6 !py-2.5"
                >
                  <Smartphone size={16} />
                  ربط قناة تواصل
                </a>
              </div>
            ) : (
              <div className="p-3 space-y-1">
                {recentConversations.map((conv: any) => (
                  <ConversationItem
                    key={conv.id}
                    name={conv.customer_name || conv.customer_phone}
                    message={conv.last_message}
                    time={conv.updated_at}
                    platform={conv.platform || 'whatsapp'}
                    unread={conv.unread_count > 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-lg font-extrabold">إجراءات سريعة</h2>
            </div>

            <QuickAction
              icon={Plus}
              title="إضافة منتج"
              description="أضف منتجات جديدة لمتجرك"
              href="/products/new"
              gradientFrom="from-emerald-400"
              gradientTo="to-cyan-400"
              delay="0.35s"
            />
            <QuickAction
              icon={BookOpen}
              title="قاعدة المعرفة"
              description="علّم الذكاء الاصطناعي عن منتجاتك"
              href="/knowledge"
              gradientFrom="from-violet-400"
              gradientTo="to-pink-400"
              delay="0.4s"
            />
            <QuickAction
              icon={Smartphone}
              title="ربط الواتساب"
              description="فعّل الردود التلقائية على الواتساب"
              href="/channels"
              gradientFrom="from-green-400"
              gradientTo="to-emerald-500"
              delay="0.45s"
            />

            {/* Tip card */}
            <div
              className="glass rounded-2xl p-5 mt-2 animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="font-bold text-sm">نصيحة</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                أضف أكبر عدد ممكن من الأسئلة الشائعة في قاعدة المعرفة ليتمكن الذكاء الاصطناعي من الإجابة على عملائك بدقة أكبر.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import {
  MessageSquare,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Smartphone,
  X,
  Filter,
} from 'lucide-react'

type ThreadStatus = 'all' | 'active' | 'escalated' | 'resolved'

interface Thread {
  id: string
  customer_phone: string
  customer_name: string | null
  last_message: string
  status: string
  updated_at: string
  unread_count: number
  platform?: 'whatsapp'
}

interface Message {
  id: string
  content: string
  sender: 'customer' | 'ai' | 'agent'
  timestamp: string
}

/* ------------------------------------------------------------------ */
/*  Filter pill                                                        */
/* ------------------------------------------------------------------ */
function FilterPill({
  icon: Icon,
  label,
  active,
  count,
  onClick,
}: {
  icon: any
  label: string
  active: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 ${
        active
          ? 'bg-gradient-to-l from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-200'
          : 'bg-surface border border-border text-muted hover:text-secondary hover:border-emerald-200 hover:bg-emerald-50/50'
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
            active ? 'bg-white/25 text-white' : 'bg-slate-100 text-muted'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Thread card                                                        */
/* ------------------------------------------------------------------ */
function ThreadCard({
  thread,
  selected,
  onClick,
}: {
  thread: Thread
  selected: boolean
  onClick: () => void
}) {
  const name = thread.customer_name || thread.customer_phone
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  const platform = thread.platform || 'whatsapp'

  const statusDot: Record<string, string> = {
    active: 'bg-emerald-400',
    escalated: 'bg-amber-400 animate-pulse',
    resolved: 'bg-slate-300',
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 rounded-xl mx-2 mb-1 ${
        selected
          ? 'bg-emerald-50 border border-emerald-200'
          : 'hover:bg-slate-50 border border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
            selected
              ? 'bg-gradient-to-br from-emerald-400 to-cyan-400'
              : 'bg-gradient-to-br from-slate-400 to-slate-500'
          }`}
        >
          {initials}
        </div>
        {/* Platform badge */}
        <div
          className="absolute -bottom-0.5 -left-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm border-2 border-white bg-green-500"
        >
          W
        </div>
        {/* Status dot */}
        <div
          className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
            statusDot[thread.status] || 'bg-slate-300'
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span
            className={`font-bold text-sm ${
              thread.unread_count > 0 ? 'text-secondary' : 'text-secondary/75'
            }`}
          >
            {name}
          </span>
          <span className="text-[11px] text-muted shrink-0 mr-2">{thread.updated_at}</span>
        </div>
        <p
          className={`text-xs truncate leading-relaxed ${
            thread.unread_count > 0 ? 'text-secondary font-medium' : 'text-muted'
          }`}
        >
          {thread.last_message}
        </p>
      </div>

      {/* Unread badge */}
      {thread.unread_count > 0 && (
        <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
          {thread.unread_count}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Chat bubble                                                        */
/* ------------------------------------------------------------------ */
function ChatBubble({ message }: { message: Message }) {
  const isCustomer = message.sender === 'customer'

  return (
    <div className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} mb-3 animate-fade-in`}>
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
          isCustomer
            ? 'bg-white border border-border rounded-2xl rounded-br-md shadow-sm'
            : message.sender === 'ai'
            ? 'bg-gradient-to-l from-emerald-500 to-cyan-500 text-white rounded-2xl rounded-bl-md shadow-md'
            : 'bg-blue-500 text-white rounded-2xl rounded-bl-md shadow-md'
        }`}
      >
        {/* Sender label */}
        <div
          className={`text-[10px] font-bold mb-1 ${
            isCustomer ? 'text-muted' : 'text-white/70'
          }`}
        >
          {isCustomer ? 'العميل' : message.sender === 'ai' ? '🤖 الذكاء الاصطناعي' : '👤 أنت'}
        </div>
        <p>{message.content}</p>
        <div
          className={`text-[10px] mt-1.5 ${
            isCustomer ? 'text-muted/60' : 'text-white/50'
          } text-left`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Conversations Page                                                 */
/* ------------------------------------------------------------------ */
export default function Conversations() {
  const [filter, setFilter] = useState<ThreadStatus>('all')
  const [search, setSearch] = useState('')
  const [threads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [messages] = useState<Message[]>([])

  const filters: { key: ThreadStatus; label: string; icon: any }[] = [
    { key: 'all', label: 'الكل', icon: MessageSquare },
    { key: 'active', label: 'نشطة', icon: Clock },
    { key: 'escalated', label: 'بانتظار ردك', icon: AlertCircle },
    { key: 'resolved', label: 'مغلقة', icon: CheckCircle },
  ]

  const filteredThreads = threads.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
        t.customer_phone.includes(q)
      )
    }
    return true
  })

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-fade-in-up">
        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">المحادثات</h1>
          <p className="text-muted mt-1.5 text-base">
            تابع محادثات عملائك مع الذكاء الاصطناعي في مكان واحد
          </p>
        </div>

        {/* ── Filters ────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-muted ml-2">
            <Filter size={14} />
            <span className="text-xs font-semibold">تصفية:</span>
          </div>
          {filters.map((f) => (
            <FilterPill
              key={f.key}
              icon={f.icon}
              label={f.label}
              active={filter === f.key}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>

        {/* ── Search Bar ─────────────────────────────── */}
        <div className="relative mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الجوال أو اسم العميل..."
            className="w-full pr-11 pl-10 py-3.5 rounded-2xl border border-border bg-surface text-sm font-medium placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* ── Main content ───────────────────────────── */}
        {threads.length === 0 ? (
          /* ── Empty state ── */
          <div
            className="bg-surface rounded-2xl border border-border p-16 text-center animate-scale-in"
            style={{ animationDelay: '0.15s' }}
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={44} className="text-emerald-300" />
            </div>
            <h3 className="font-extrabold text-lg text-secondary/80 mb-2">
              لا توجد محادثات بعد
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
              بمجرد أن يراسلك عميل على الواتساب، ستظهر جميع المحادثات هنا مع إمكانية
              التصفية والبحث
            </p>
            <a
              href="/channels"
              className="inline-flex items-center gap-2 btn-primary text-sm mt-8 !py-3"
            >
              <Smartphone size={16} />
              ربط قناة تواصل
            </a>
          </div>
        ) : (
          /* ── Thread list + Chat panel ── */
          <div
            className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in-up"
            style={{ animationDelay: '0.15s' }}
          >
            {/* Thread list */}
            <div className="lg:col-span-2 bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <p className="text-xs text-muted font-semibold">
                  {filteredThreads.length} محادثة
                </p>
              </div>
              <div className="max-h-[600px] overflow-y-auto py-2">
                {filteredThreads.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <Search size={28} className="mx-auto mb-3 text-muted/30" />
                    <p className="text-sm text-muted">لا توجد نتائج</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      selected={selectedThread?.id === thread.id}
                      onClick={() => setSelectedThread(thread)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Chat panel */}
            <div className="lg:col-span-3 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col min-h-[600px]">
              {selectedThread ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 p-5 border-b border-border bg-white">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {(selectedThread.customer_name || selectedThread.customer_phone)
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">
                        {selectedThread.customer_name || selectedThread.customer_phone}
                      </h3>
                      <p className="text-[11px] text-muted">{selectedThread.customer_phone}</p>
                    </div>
                    <div
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        selectedThread.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : selectedThread.status === 'escalated'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-muted'
                      }`}
                    >
                      {selectedThread.status === 'active'
                        ? 'نشطة'
                        : selectedThread.status === 'escalated'
                        ? 'بانتظار الرد'
                        : 'مغلقة'}
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-slate-50/50 to-white space-y-1">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted">لا توجد رسائل</p>
                      </div>
                    ) : (
                      messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
                    )}
                  </div>

                  {/* Reply input */}
                  <div className="p-4 border-t border-border bg-white">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="اكتب ردّك هنا..."
                        className="flex-1 py-3 px-4 rounded-xl border border-border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                      <button className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* No thread selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={28} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-secondary/60 text-sm">اختر محادثة</p>
                    <p className="text-xs text-muted mt-1">
                      اختر محادثة من القائمة لعرض الرسائل
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

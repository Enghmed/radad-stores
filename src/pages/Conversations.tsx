import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { MessageSquare, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react'

type ThreadStatus = 'all' | 'active' | 'escalated' | 'resolved'

interface Thread {
  id: string
  customer_phone: string
  customer_name: string | null
  last_message: string
  status: string
  updated_at: string
  unread_count: number
}

export default function Conversations() {
  const [filter, setFilter] = useState<ThreadStatus>('all')
  const [search, setSearch] = useState('')
  const [threads] = useState<Thread[]>([])

  const filters: { key: ThreadStatus; label: string; icon: any }[] = [
    { key: 'all', label: 'الكل', icon: MessageSquare },
    { key: 'active', label: 'نشطة', icon: Clock },
    { key: 'escalated', label: 'بانتظار ردك', icon: AlertCircle },
    { key: 'resolved', label: 'مغلقة', icon: CheckCircle },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">المحادثات</h1>
        <p className="text-muted mt-1">تابع محادثات عملائك مع الذكاء الاصطناعي</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f.key
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-muted hover:text-secondary'
            }`}
          >
            <f.icon size={16} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث برقم الجوال أو اسم العميل..."
          className="w-full pr-10 pl-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Thread List */}
      {threads.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted font-medium">لا توجد محادثات بعد</p>
          <p className="text-sm text-muted mt-1">بمجرد ما يراسلك عميل على الواتساب، ستظهر المحادثات هنا</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border divide-y divide-border">
          {threads.map(thread => (
            <div key={thread.id} className="p-4 hover:bg-background/50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{thread.customer_name || thread.customer_phone}</span>
                <span className="text-xs text-muted">{thread.updated_at}</span>
              </div>
              <p className="text-sm text-muted truncate">{thread.last_message}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

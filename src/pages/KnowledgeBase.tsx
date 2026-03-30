import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Brain, Plus, Search, Trash2, MessageSquare } from 'lucide-react'

interface KnowledgeEntry {
  id: string
  question: string
  answer: string
  source: 'owner_reply' | 'manual'
  times_used: number
  created_at: string
}

export default function KnowledgeBase() {
  const [entries] = useState<KnowledgeEntry[]>([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">قاعدة المعرفة</h1>
          <p className="text-muted mt-1">الأسئلة والأجوبة اللي تعلمها الذكاء الاصطناعي</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} />
          إضافة سؤال وجواب
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث في قاعدة المعرفة..."
          className="w-full pr-10 pl-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Knowledge Entries */}
      {entries.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Brain size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted font-medium">قاعدة المعرفة فاضية</p>
          <p className="text-sm text-muted mt-2">
            لما عميل يسأل سؤال والذكاء الاصطناعي ما يعرف الجواب، بيرسل لك السؤال.
            <br />
            ردّك بيتحفظ هنا تلقائياً وبيستخدمه الذكاء الاصطناعي مستقبلاً.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
          >
            أضف سؤال وجواب يدوياً
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <span className="text-xs text-muted">
                    {entry.source === 'owner_reply' ? 'من ردك' : 'يدوي'} — استُخدم {entry.times_used} مرة
                  </span>
                </div>
                <button className="p-1 text-muted hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="font-medium text-sm mb-1">س: {entry.question}</p>
              <p className="text-sm text-muted">ج: {entry.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-lg border border-border" dir="rtl">
            <h2 className="text-xl font-bold mb-4">إضافة سؤال وجواب</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">السؤال</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: وش ساعات العمل عندكم؟"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الجواب</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: نشتغل من ٩ الصبح لـ١٢ بالليل كل يوم ماعدا الجمعة"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-border rounded-lg hover:bg-background transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

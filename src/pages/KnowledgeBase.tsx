import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Brain, Plus, Search, Trash2, MessageSquare, Edit2, ChevronDown, ChevronUp, X, Tag, Hash, Sparkles, User, PenLine, Loader2 } from 'lucide-react'

interface KnowledgeEntry {
  id: string
  question: string
  answer: string
  source: 'owner_reply' | 'manual' | 'ai'
  keywords?: string[]
  times_used: number
  created_at: string
}

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  // Form state
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formKeywords, setFormKeywords] = useState('')

  function openAddModal() {
    setFormQuestion('')
    setFormAnswer('')
    setFormKeywords('')
    setEditingEntry(null)
    setShowAddModal(true)
  }

  function openEditModal(entry: KnowledgeEntry) {
    setFormQuestion(entry.question)
    setFormAnswer(entry.answer)
    setFormKeywords(entry.keywords?.join('، ') || '')
    setEditingEntry(entry)
    setShowAddModal(true)
  }

  function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return
    setEntries(entries.filter(e => e.id !== id))
    setSuccess('تم حذف السؤال')
    setTimeout(() => setSuccess(''), 3000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formQuestion.trim() || !formAnswer.trim()) return
    setSaving(true)

    // Simulate save
    setTimeout(() => {
      if (editingEntry) {
        setEntries(entries.map(ent =>
          ent.id === editingEntry.id
            ? { ...ent, question: formQuestion.trim(), answer: formAnswer.trim(), keywords: formKeywords.split('،').map(k => k.trim()).filter(Boolean) }
            : ent
        ))
        setSuccess('تم تعديل السؤال')
      } else {
        const newEntry: KnowledgeEntry = {
          id: Date.now().toString(),
          question: formQuestion.trim(),
          answer: formAnswer.trim(),
          source: 'manual',
          keywords: formKeywords.split('،').map(k => k.trim()).filter(Boolean),
          times_used: 0,
          created_at: new Date().toISOString(),
        }
        setEntries([newEntry, ...entries])
        setSuccess('تم إضافة السؤال')
      }
      setSaving(false)
      setShowAddModal(false)
      setTimeout(() => setSuccess(''), 3000)
    }, 500)
  }

  const filteredEntries = entries.filter(e =>
    e.question.includes(search) || e.answer.includes(search) || e.keywords?.some(k => k.includes(search))
  )

  const sourceConfig = {
    manual: { label: 'يدوي', icon: PenLine, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    owner_reply: { label: 'من ردك', icon: User, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    ai: { label: 'ذكاء اصطناعي', icon: Sparkles, color: 'bg-purple-50 text-purple-700 border-purple-100' },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-in">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold gradient-text">قاعدة المعرفة</h1>
                {entries.length > 0 && (
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full animate-scale-in">
                    {entries.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">الأسئلة والأجوبة اللي تعلمها الذكاء الاصطناعي</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Plus size={18} />
            <span className="text-sm font-bold">إضافة سؤال وجواب</span>
          </button>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="animate-fade-in-up bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-800">{success}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative animate-fade-in-up">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في قاعدة المعرفة..."
            className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all duration-200 shadow-sm text-sm"
          />
        </div>

        {/* Knowledge Entries */}
        {entries.length === 0 ? (
          /* Empty State */
          <div className="animate-fade-in-up glass rounded-2xl p-12 text-center border border-gray-200/50">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-6">
              <Brain size={44} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ابدأ ببناء قاعدة المعرفة</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-2">
              لما عميل يسأل سؤال والذكاء الاصطناعي ما يعرف الجواب، بيرسل لك السؤال.
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              ردّك بيتحفظ هنا تلقائياً وبيستخدمه الذكاء الاصطناعي مستقبلاً.
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 inline-flex items-center gap-2"
            >
              <Plus size={18} />
              أضف سؤال وجواب يدوياً
            </button>
          </div>
        ) : filteredEntries.length === 0 && search ? (
          <div className="animate-fade-in glass rounded-2xl p-12 text-center border border-gray-200/50">
            <Search size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">لا توجد نتائج لـ "{search}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, index) => {
              const isExpanded = expandedId === entry.id
              const source = sourceConfig[entry.source]
              const SourceIcon = source.icon

              return (
                <div
                  key={entry.id}
                  className="group card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Question Header (clickable to expand) */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full text-right p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm leading-relaxed mb-2">{entry.question}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Source Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${source.color}`}>
                          <SourceIcon size={10} />
                          {source.label}
                        </span>
                        {/* Times Used */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                          <Hash size={10} />
                          استُخدم {entry.times_used} مرة
                        </span>
                        {/* Keywords */}
                        {entry.keywords?.map((kw, ki) => (
                          <span
                            key={ki}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit/Delete on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(entry) }}
                          className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {/* Expand Chevron */}
                      <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} className="text-gray-500" />
                      </div>
                    </div>
                  </button>

                  {/* Answer (expandable) */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5 pr-[4.5rem]">
                      <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredEntries.length > 0 && (
          <p className="text-xs text-gray-400 text-center animate-fade-in">
            عرض {filteredEntries.length} من {entries.length} سؤال
          </p>
        )}

        {/* ========================================
            Add/Edit Modal
        ======================================== */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass rounded-2xl p-0 w-full max-w-lg border border-white/20 shadow-2xl animate-scale-in overflow-hidden" dir="rtl">
              {/* Modal Header */}
              <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    {editingEntry ? <Edit2 size={20} className="text-white" /> : <Brain size={20} className="text-white" />}
                  </div>
                  <h2 className="text-lg font-bold text-white">{editingEntry ? 'تعديل السؤال والجواب' : 'إضافة سؤال وجواب'}</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form className="p-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">السؤال *</label>
                  <input
                    type="text"
                    value={formQuestion}
                    onChange={e => setFormQuestion(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="مثال: وش ساعات العمل عندكم؟"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الجواب *</label>
                  <textarea
                    rows={4}
                    value={formAnswer}
                    onChange={e => setFormAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm resize-none"
                    placeholder="مثال: نشتغل من ٩ الصبح لـ١٢ بالليل كل يوم ماعدا الجمعة"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} className="text-gray-400" />
                      كلمات مفتاحية (اختياري)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={e => setFormKeywords(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="مثال: ساعات، دوام، عمل (مفصولة بفاصلة)"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">افصل بين الكلمات بفاصلة عربية (،)</p>
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-600"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formQuestion.trim() || !formAnswer.trim()}
                    className="flex-1 py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-emerald-500/20"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : editingEntry ? 'حفظ التعديل' : 'حفظ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

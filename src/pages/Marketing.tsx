import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Send, Plus, FileText, Clock, CheckCircle, AlertCircle, Eye, Trash2, X, Copy, Edit3, Users, BarChart3, Mail, BookOpen } from 'lucide-react'

// Types
interface Template {
  id: string
  template_name: string
  category: string
  status: string
  body_text: string
  header_text: string | null
  footer_text: string | null
  button_text: string | null
  button_url: string | null
  created_at: string
}

interface Campaign {
  id: string
  name: string
  status: string
  total_recipients: number
  sent_count: number
  delivered_count: number
  read_count: number
  scheduled_at: string | null
  sent_at: string | null
}

export default function Marketing() {
  const { store } = useAuth()
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns'>('templates')
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    template_name: '',
    category: 'MARKETING',
    header_text: '',
    body_text: '',
    footer_text: '',
    button_text: '',
    button_url: '',
  })

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    template_id: '',
    target_audience: 'all',
    scheduled_at: '',
  })

  // Mock data (will be replaced with real Supabase queries)
  const [templates] = useState<Template[]>([])
  const [campaigns] = useState<Campaign[]>([])

  const whatsappConnected = store?.whatsapp_connected || false

  // Stats
  const totalSent = campaigns.reduce((a, c) => a + c.sent_count, 0)
  const totalDelivered = campaigns.reduce((a, c) => a + c.delivered_count, 0)
  const totalRead = campaigns.reduce((a, c) => a + c.read_count, 0)

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save to whatsapp_templates table
    // TODO: Submit to Meta for approval via WhatsApp Business API
    console.log('Creating template:', templateForm)
    setShowCreateTemplate(false)
    setTemplateForm({ template_name: '', category: 'MARKETING', header_text: '', body_text: '', footer_text: '', button_text: '', button_url: '' })
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save to marketing_campaigns table
    // TODO: Send template messages to customers
    console.log('Creating campaign:', campaignForm)
    setShowCreateCampaign(false)
    setCampaignForm({ name: '', template_id: '', target_audience: 'all', scheduled_at: '' })
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'قيد المراجعة' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'معتمد' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'مرفوض' },
      draft: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'مسودة' },
      sent: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'تم الإرسال' },
      scheduled: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'مجدولة' },
    }
    const s = map[status] || map.pending
    return <span className={`text-[11px] px-2.5 py-1 rounded-full ${s.bg} ${s.text} font-bold border border-current/10`}>{s.label}</span>
  }

  if (!whatsappConnected) {
    return (
      <DashboardLayout>
        <div dir="rtl" className="font-[Cairo] flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
            <Send size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">الرسائل التسويقية</h2>
          <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
            لازم تربط الواتساب أول عشان تقدر ترسل رسائل تسويقية لعملائك.
            القوالب المعتمدة من Meta تضمن وصول رسائلك بدون حظر.
          </p>
          <a href="/whatsapp" className="px-8 py-3.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
            ربط الواتساب
          </a>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div dir="rtl" className="font-[Cairo] max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الرسائل التسويقية</h1>
            <p className="text-gray-500 mt-2 text-base">أنشئ قوالب رسائل وأرسلها لعملائك عبر واتساب</p>
          </div>
        </div>

        {/* Stats Overview */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Mail size={16} className="text-blue-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">مرسلة</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalSent.toLocaleString('ar-SA')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">وصلت</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalDelivered.toLocaleString('ar-SA')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Eye size={16} className="text-purple-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">مقروءة</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalRead.toLocaleString('ar-SA')}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1.5 mb-8 max-w-sm animate-fade-in-up">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={15} />
            القوالب
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'campaigns'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 size={15} />
            الحملات
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">قوالب الرسائل</h2>
              <button
                onClick={() => setShowCreateTemplate(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                <Plus size={16} />
                قالب جديد
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">ما عندك قوالب</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">أنشئ أول قالب رسالة تسويقية لعملائك. القوالب تحتاج موافقة Meta قبل الإرسال.</p>
                <button
                  onClick={() => setShowCreateTemplate(true)}
                  className="px-6 py-3 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                  إنشاء قالب
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((t) => (
                  <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{t.template_name}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{t.category === 'MARKETING' ? 'تسويقي' : 'خدمي'}</p>
                      </div>
                      {statusBadge(t.status)}
                    </div>

                    {/* Message Preview */}
                    <div className="bg-[#e5ddd5]/30 rounded-xl p-3 mb-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm max-w-[90%]">
                        {t.header_text && <p className="text-xs font-bold text-gray-900 mb-1">{t.header_text}</p>}
                        <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed">{t.body_text}</p>
                        {t.footer_text && <p className="text-[10px] text-gray-400 mt-1.5">{t.footer_text}</p>}
                        {t.button_text && (
                          <div className="mt-2 pt-1.5 border-t border-gray-100 text-center">
                            <span className="text-[11px] text-blue-500 font-semibold">{t.button_text}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
                        <Eye size={13} /> معاينة
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
                        <Copy size={13} /> نسخ
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
                        <Edit3 size={13} /> تعديل
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                        <Trash2 size={13} /> حذف
                      </button>
                      {t.status === 'approved' && (
                        <button
                          onClick={() => { setCampaignForm(prev => ({ ...prev, template_id: t.id })); setShowCreateCampaign(true); setActiveTab('campaigns') }}
                          className="mr-auto flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                        >
                          <Send size={13} /> إرسال حملة
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info box */}
            <div className="mt-6 bg-amber-50/70 rounded-2xl border border-amber-100 p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 mb-1">كيف تعمل القوالب؟</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  واتساب يتطلب موافقة Meta على كل قالب رسالة تسويقية قبل إرسالها.
                  عادة تأخذ المراجعة من دقائق لساعات. القوالب المعتمدة تضمن وصول رسائلك بدون حظر الرقم.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">الحملات التسويقية</h2>
              <button
                onClick={() => setShowCreateCampaign(true)}
                disabled={templates.filter(t => t.status === 'approved').length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                حملة جديدة
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">ما عندك حملات</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                  {templates.length === 0
                    ? 'أنشئ قالب رسالة أولاً ثم أرسل حملتك الأولى'
                    : 'أرسل أول حملة تسويقية لعملائك عبر واتساب'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                          <Clock size={12} />
                          {c.sent_at ? new Date(c.sent_at).toLocaleDateString('ar-SA') : c.scheduled_at ? `مجدولة: ${new Date(c.scheduled_at).toLocaleDateString('ar-SA')}` : '---'}
                        </p>
                      </div>
                      {statusBadge(c.status)}
                    </div>
                    <div className="grid grid-cols-4 gap-3 bg-gray-50/80 rounded-xl p-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users size={12} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{c.total_recipients.toLocaleString('ar-SA')}</p>
                        <p className="text-[11px] text-gray-500 font-medium">المستهدفين</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Mail size={12} className="text-blue-400" />
                        </div>
                        <p className="text-lg font-bold text-blue-600">{c.sent_count.toLocaleString('ar-SA')}</p>
                        <p className="text-[11px] text-gray-500 font-medium">مرسلة</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle size={12} className="text-emerald-400" />
                        </div>
                        <p className="text-lg font-bold text-emerald-600">{c.delivered_count.toLocaleString('ar-SA')}</p>
                        <p className="text-[11px] text-gray-500 font-medium">وصلت</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye size={12} className="text-purple-400" />
                        </div>
                        <p className="text-lg font-bold text-purple-600">{c.read_count.toLocaleString('ar-SA')}</p>
                        <p className="text-[11px] text-gray-500 font-medium">مقروءة</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================
            Create Template Modal
        ======================================== */}
        {showCreateTemplate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FileText size={16} className="text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">إنشاء قالب رسالة</h2>
                </div>
                <button onClick={() => setShowCreateTemplate(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreateTemplate} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم القالب (بالإنجليزية)</label>
                  <input
                    type="text"
                    value={templateForm.template_name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, template_name: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                    placeholder="welcome_offer"
                    dir="ltr"
                    required
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">حروف إنجليزية صغيرة وأرقام و _ فقط</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                  >
                    <option value="MARKETING">تسويقي</option>
                    <option value="UTILITY">خدمي (تأكيد طلب، شحن...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان (اختياري)</label>
                  <input
                    type="text"
                    value={templateForm.header_text}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, header_text: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                    placeholder="عرض خاص لك!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نص الرسالة</label>
                  <textarea
                    value={templateForm.body_text}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, body_text: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all min-h-[120px] text-sm resize-none"
                    placeholder="مرحباً {{1}}! عندنا عرض حصري لك..."
                    required
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">{'استخدم {{1}} {{2}} للمتغيرات (اسم العميل، رقم الطلب...)'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التذييل (اختياري)</label>
                  <input
                    type="text"
                    value={templateForm.footer_text}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, footer_text: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                    placeholder="للإلغاء أرسل: إلغاء"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">نص الزر (اختياري)</label>
                    <input
                      type="text"
                      value={templateForm.button_text}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, button_text: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                      placeholder="تسوّق الحين"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الزر (اختياري)</label>
                    <input
                      type="url"
                      value={templateForm.button_url}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, button_url: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-[#e5ddd5]/40 rounded-2xl p-5">
                  <p className="text-[11px] text-center text-gray-500 mb-3 font-medium">معاينة الرسالة</p>
                  <div className="bg-white rounded-xl p-4 max-w-[280px] shadow-sm mx-auto">
                    {templateForm.header_text && <p className="font-bold text-sm mb-1 text-gray-900">{templateForm.header_text}</p>}
                    <p className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">{templateForm.body_text || 'نص الرسالة...'}</p>
                    {templateForm.footer_text && <p className="text-[11px] text-gray-400 mt-2">{templateForm.footer_text}</p>}
                    {templateForm.button_text && (
                      <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                        <span className="text-sm text-blue-500 font-semibold">{templateForm.button_text}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-3.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                    إرسال للمراجعة
                  </button>
                  <button type="button" onClick={() => setShowCreateTemplate(false)} className="px-6 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================
            Create Campaign Modal
        ======================================== */}
        {showCreateCampaign && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Send size={16} className="text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">إنشاء حملة تسويقية</h2>
                </div>
                <button onClick={() => setShowCreateCampaign(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreateCampaign} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الحملة</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                    placeholder="عرض رمضان 2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">القالب</label>
                  <select
                    value={campaignForm.template_id}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, template_id: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                    required
                  >
                    <option value="">اختر قالب...</option>
                    {templates.filter(t => t.status === 'approved').map(t => (
                      <option key={t.id} value={t.id}>{t.template_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الجمهور المستهدف</label>
                  <select
                    value={campaignForm.target_audience}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, target_audience: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                  >
                    <option value="all">جميع العملاء</option>
                    <option value="active">العملاء النشطين (آخر 30 يوم)</option>
                    <option value="inactive">العملاء غير النشطين</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">موعد الإرسال</label>
                  <input
                    type="datetime-local"
                    value={campaignForm.scheduled_at}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-sm"
                    dir="ltr"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">اتركه فاضي عشان يرسل فوراً</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-3.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                    <Send size={16} />
                    {campaignForm.scheduled_at ? 'جدولة الحملة' : 'إرسال الآن'}
                  </button>
                  <button type="button" onClick={() => setShowCreateCampaign(false)} className="px-6 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    إلغاء
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

import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Send, Plus, FileText, Clock, CheckCircle, AlertCircle, Eye, Trash2, X } from 'lucide-react'

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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'قيد المراجعة' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'معتمد' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'مسودة' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'تم الإرسال' },
      scheduled: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'مجدولة' },
    }
    const s = map[status] || map.pending
    return <span className={`text-xs px-2 py-1 rounded-full ${s.bg} ${s.text} font-medium`}>{s.label}</span>
  }

  if (!whatsappConnected) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Send size={28} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">الرسائل التسويقية</h2>
          <p className="text-muted max-w-md mb-6">
            لازم تربط الواتساب أول عشان تقدر ترسل رسائل تسويقية لعملائك.
            القوالب المعتمدة من Meta تضمن وصول رسائلك بدون حظر.
          </p>
          <a href="/whatsapp" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            ربط الواتساب
          </a>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الرسائل التسويقية</h1>
          <p className="text-muted mt-1">أنشئ قوالب رسائل وأرسلها لعملائك عبر واتساب</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 max-w-xs">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'templates' ? 'bg-white shadow-sm text-gray-900' : 'text-muted hover:text-gray-700'
          }`}
        >
          القوالب
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'campaigns' ? 'bg-white shadow-sm text-gray-900' : 'text-muted hover:text-gray-700'
          }`}
        >
          الحملات
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">قوالب الرسائل</h2>
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} />
              قالب جديد
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-12 text-center">
              <FileText size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">ما عندك قوالب</h3>
              <p className="text-sm text-muted mb-4">أنشئ أول قالب رسالة تسويقية لعملائك</p>
              <button
                onClick={() => setShowCreateTemplate(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
              >
                إنشاء قالب
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((t) => (
                <div key={t.id} className="bg-surface rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold">{t.template_name}</h3>
                      <p className="text-xs text-muted mt-0.5">{t.category}</p>
                    </div>
                    {statusBadge(t.status)}
                  </div>
                  {t.header_text && <p className="text-sm font-medium mb-1">{t.header_text}</p>}
                  <p className="text-sm text-gray-600 line-clamp-3">{t.body_text}</p>
                  {t.footer_text && <p className="text-xs text-muted mt-2">{t.footer_text}</p>}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    <button className="flex items-center gap-1 text-xs text-muted hover:text-gray-700">
                      <Eye size={14} /> معاينة
                    </button>
                    <button className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                      <Trash2 size={14} /> حذف
                    </button>
                    {t.status === 'approved' && (
                      <button
                        onClick={() => { setCampaignForm(prev => ({ ...prev, template_id: t.id })); setShowCreateCampaign(true); setActiveTab('campaigns') }}
                        className="mr-auto flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                      >
                        <Send size={14} /> إرسال حملة
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info box about templates */}
          <div className="mt-6 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">كيف تعمل القوالب؟</p>
              <p className="text-sm text-amber-700 mt-1">
                واتساب يتطلب موافقة Meta على كل قالب رسالة تسويقية قبل إرسالها.
                عادةً تأخذ المراجعة من دقائق لساعات. القوالب المعتمدة تضمن وصول رسائلك بدون حظر الرقم.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">الحملات التسويقية</h2>
            <button
              onClick={() => setShowCreateCampaign(true)}
              disabled={templates.filter(t => t.status === 'approved').length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              حملة جديدة
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-12 text-center">
              <Send size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">ما عندك حملات</h3>
              <p className="text-sm text-muted mb-4">
                {templates.length === 0
                  ? 'أنشئ قالب رسالة أولاً ثم أرسل حملتك الأولى'
                  : 'أرسل أول حملة تسويقية لعملائك عبر واتساب'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div key={c.id} className="bg-surface rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold">{c.name}</h3>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                        <Clock size={12} />
                        {c.sent_at ? new Date(c.sent_at).toLocaleDateString('ar-SA') : c.scheduled_at ? `مجدولة: ${new Date(c.scheduled_at).toLocaleDateString('ar-SA')}` : '—'}
                      </p>
                    </div>
                    {statusBadge(c.status)}
                  </div>
                  <div className="grid grid-cols-4 gap-3 bg-background rounded-lg p-3 text-center">
                    <div>
                      <p className="text-lg font-bold">{c.total_recipients}</p>
                      <p className="text-xs text-muted">المستهدفين</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{c.sent_count}</p>
                      <p className="text-xs text-muted">مرسلة</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{c.delivered_count}</p>
                      <p className="text-xs text-muted">وصلت</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{c.read_count}</p>
                      <p className="text-xs text-muted">مقروءة</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">إنشاء قالب رسالة</h2>
              <button onClick={() => setShowCreateTemplate(false)} className="p-1 text-muted hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم القالب (بالإنجليزية)</label>
                <input
                  type="text"
                  value={templateForm.template_name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, template_name: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="welcome_offer"
                  dir="ltr"
                  required
                />
                <p className="text-xs text-muted mt-1">حروف إنجليزية صغيرة وأرقام و _ فقط</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الفئة</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="MARKETING">تسويقي</option>
                  <option value="UTILITY">خدمي (تأكيد طلب، شحن...)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">العنوان (اختياري)</label>
                <input
                  type="text"
                  value={templateForm.header_text}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, header_text: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="عرض خاص لك!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">نص الرسالة</label>
                <textarea
                  value={templateForm.body_text}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, body_text: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                  placeholder="مرحباً {{1}}! عندنا عرض حصري لك..."
                  required
                />
                <p className="text-xs text-muted mt-1">{'استخدم {{1}} {{2}} للمتغيرات (اسم العميل، رقم الطلب...)'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">التذييل (اختياري)</label>
                <input
                  type="text"
                  value={templateForm.footer_text}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, footer_text: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="للإلغاء أرسل: إلغاء"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">نص الزر (اختياري)</label>
                  <input
                    type="text"
                    value={templateForm.button_text}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, button_text: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="تسوّق الحين"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رابط الزر (اختياري)</label>
                  <input
                    type="url"
                    value={templateForm.button_url}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, button_url: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-[#e5ddd5] rounded-xl p-4">
                <p className="text-xs text-center text-gray-500 mb-3">معاينة الرسالة</p>
                <div className="bg-white rounded-lg p-3 max-w-[280px] shadow-sm">
                  {templateForm.header_text && <p className="font-bold text-sm mb-1">{templateForm.header_text}</p>}
                  <p className="text-sm whitespace-pre-wrap">{templateForm.body_text || 'نص الرسالة...'}</p>
                  {templateForm.footer_text && <p className="text-xs text-gray-400 mt-2">{templateForm.footer_text}</p>}
                  {templateForm.button_text && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                      <span className="text-sm text-blue-500 font-medium">{templateForm.button_text}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                  إرسال للمراجعة
                </button>
                <button type="button" onClick={() => setShowCreateTemplate(false)} className="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-gray-50">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">إنشاء حملة تسويقية</h2>
              <button onClick={() => setShowCreateCampaign(false)} className="p-1 text-muted hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الحملة</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="عرض رمضان 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">القالب</label>
                <select
                  value={campaignForm.template_id}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, template_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">اختر قالب...</option>
                  {templates.filter(t => t.status === 'approved').map(t => (
                    <option key={t.id} value={t.id}>{t.template_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الجمهور المستهدف</label>
                <select
                  value={campaignForm.target_audience}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, target_audience: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">جميع العملاء</option>
                  <option value="active">العملاء النشطين (آخر 30 يوم)</option>
                  <option value="inactive">العملاء غير النشطين</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">موعد الإرسال</label>
                <input
                  type="datetime-local"
                  value={campaignForm.scheduled_at}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  dir="ltr"
                />
                <p className="text-xs text-muted mt-1">اتركه فاضي عشان يرسل فوراً</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <Send size={16} />
                  {campaignForm.scheduled_at ? 'جدولة الحملة' : 'إرسال الآن'}
                </button>
                <button type="button" onClick={() => setShowCreateCampaign(false)} className="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-gray-50">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

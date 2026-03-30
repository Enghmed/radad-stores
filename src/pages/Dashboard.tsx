import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Users, Brain, AlertCircle } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { store } = useAuth()

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">مرحباً، {store?.store_name}</h1>
        <p className="text-muted mt-1">نظرة عامة على متجرك</p>
      </div>

      {!store?.setup_completed && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-accent shrink-0" size={20} />
          <p className="text-sm">
            لم تكتمل إعدادات متجرك بعد.{' '}
            <a href="/setup" className="text-primary font-medium hover:underline">
              أكمل الإعداد الآن
            </a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MessageSquare} label="رسائل اليوم" value="0" color="bg-primary" />
        <StatCard icon={Users} label="العملاء" value="0" color="bg-blue-500" />
        <StatCard icon={Brain} label="أسئلة تعلمها الذكاء" value="0" color="bg-purple-500" />
        <StatCard icon={AlertCircle} label="بانتظار ردك" value="0" color="bg-accent" />
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-4">آخر المحادثات</h2>
        <div className="text-center text-muted py-12">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
          <p>لا توجد محادثات بعد</p>
          <p className="text-sm mt-1">بمجرد ما يراسلك عميل على الواتساب، ستظهر المحادثات هنا</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

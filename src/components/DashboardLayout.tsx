import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  BookOpen,
  Settings,
  LogOut,
  Smartphone,
  CreditCard,
  Send,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/conversations', label: 'المحادثات', icon: MessageSquare },
  { path: '/products', label: 'المنتجات', icon: Package },
  { path: '/knowledge-base', label: 'قاعدة المعرفة', icon: BookOpen },
  { path: '/whatsapp', label: 'ربط القنوات', icon: Smartphone },
  { path: '/marketing', label: 'التسويق', icon: Send },
  { path: '/subscription', label: 'الاشتراك', icon: CreditCard },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { store, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <img src="/logo.png" alt="رداد ستورز" className="w-10 h-10 rounded-full" />
          <div>
            <h1 className="text-lg font-bold text-primary-light">رداد ستورز</h1>
            <p className="text-xs text-white/60">{store?.store_name || 'متجرك'}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary-light'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white w-full transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}

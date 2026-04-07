import { useState } from 'react'
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
  Menu,
  X,
  ChevronLeft,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-white font-bold text-lg">ر</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white">رداد ستورز</h1>
          <p className="text-xs text-white/40 truncate">{store?.store_name || 'متجرك'}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-emerald-500/20 to-transparent text-emerald-400 font-semibold nav-active'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronLeft size={14} className="text-emerald-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3">
        {/* Store status */}
        <div className="mx-1 mb-2 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/60">المتجر نشط</span>
          </div>
          <p className="text-[11px] text-white/30">الخطة: {store?.plan === 'trial' ? 'تجربة مجانية' : store?.plan === 'monthly' ? 'شهري' : store?.plan === 'yearly' ? 'سنوي' : 'تجربة مجانية'}</p>
        </div>

        <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent mx-1 mb-2" />

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-secondary flex-col shrink-0 fixed top-0 right-0 h-screen z-30 border-l border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-40 bg-secondary/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ر</span>
            </div>
            <span className="text-white font-bold text-sm">{store?.store_name || 'رداد ستورز'}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[280px] bg-secondary flex flex-col animate-slide-in-right shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:mr-[260px] overflow-auto min-h-screen">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

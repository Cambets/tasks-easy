import { useEffect, useState } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import {
  Sun,
  Inbox,
  CalendarDays,
  List,
  LayoutGrid,
  Calendar,
  Sparkles,
  Target,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Laptop,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { useUIStore } from '@/stores/ui'
import { signOutApp, getDemoUser } from '@/lib/auth'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

export const NAV_ITEMS = [
  { to: '/hoje', icon: Sun, label: 'Hoje' },
  { to: '/inbox', icon: Inbox, label: 'Caixa de entrada' },
  { to: '/proximos', icon: CalendarDays, label: 'Próximos 7 dias' },
  { to: '/todas', icon: List, label: 'Todas as tarefas' },
  { to: '/kanban', icon: LayoutGrid, label: 'Kanban' },
  { to: '/calendario', icon: Calendar, label: 'Calendário' },
  { to: '/produtividade', icon: Sparkles, label: 'Produtividade' },
  { to: '/triade', icon: Target, label: 'Tríade do Tempo' },
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
] as const

interface SidebarProps {
  isMobile?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ isMobile = false, onCloseMobile }: SidebarProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const location = useLocation()
  const pathname = location.pathname

  const collapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  const [userEmail, setUserEmail] = useState<string>('usuario@empresa.com')

  useEffect(() => {
    const demo = getDemoUser()
    if (demo?.email) {
      setUserEmail(demo.email)
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email)
      }
    })
  }, [])

  const handleSignOut = () => {
    signOutApp(queryClient, router)
  }

  const isCollapsed = !isMobile && collapsed

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 select-none z-30',
        isMobile ? 'w-64' : isCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Top Header / Logo */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border/80">
        <Link
          to="/todas"
          className="flex items-center gap-2.5 overflow-hidden"
          onClick={() => isMobile && onCloseMobile?.()}
        >
          <Logo size={28} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-sm tracking-tight text-foreground truncate">
              Central de Tarefas
            </span>
          )}
        </Link>

        {!isMobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => isMobile && onCloseMobile?.()}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border/80 space-y-1">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className={cn(
            'flex items-center gap-3 w-full px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors cursor-pointer',
            isCollapsed && 'justify-center px-0'
          )}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>}
        </button>

        {/* User Email & Sign Out */}
        <div
          className={cn(
            'flex items-center justify-between p-1.5 rounded-lg bg-sidebar-accent/40 text-xs',
            isCollapsed && 'justify-center p-1'
          )}
        >
          {!isCollapsed && (
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-[11px] font-medium text-foreground truncate" title={userEmail}>
                {userEmail}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

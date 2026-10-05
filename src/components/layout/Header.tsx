import { useEffect, useRef } from 'react'
import { Menu, Search } from 'lucide-react'
import { useLocation } from '@tanstack/react-router'
import { useUIStore } from '@/stores/ui'
import { NAV_ITEMS } from './Sidebar'

export function Header() {
  const location = useLocation()
  const currentNav = NAV_ITEMS.find((item) => item.to === location.pathname)
  const title = currentNav ? currentNav.label : 'Central de Tarefas'

  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut '/' focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="h-14 border-b border-border/80 bg-card/60 backdrop-blur-md px-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile hamburger + Route Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-1.5 rounded-md hover:bg-accent text-foreground transition-colors cursor-pointer"
          title="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base font-bold text-foreground tracking-tight">{title}</h1>
      </div>

      {/* Right: Quick Search input */}
      <div className="flex items-center gap-2 max-w-xs w-full">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas... (Pressione /)"
            className="w-full h-8 pl-8 pr-7 text-xs rounded-md border border-input bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

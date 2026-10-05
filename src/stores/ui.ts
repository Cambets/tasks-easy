import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void

  searchQuery: string
  setSearchQuery: (query: string) => void

  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void

  isMobileSidebarOpen: boolean
  setMobileSidebarOpen: (open: boolean) => void

  showCompletedTasks: boolean
  setShowCompletedTasks: (show: boolean) => void
  toggleShowCompletedTasks: () => void
}

const getInitialSidebarState = (): boolean => {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('cta:sidebar-collapsed')
  return saved ? JSON.parse(saved) : false
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('cta:theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: getInitialSidebarState(),
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      if (typeof window !== 'undefined') {
        localStorage.setItem('cta:sidebar-collapsed', JSON.stringify(next))
      }
      return { sidebarCollapsed: next }
    }),
  setSidebarCollapsed: (collapsed: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cta:sidebar-collapsed', JSON.stringify(collapsed))
    }
    set({ sidebarCollapsed: collapsed })
  },

  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cta:theme', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        localStorage.setItem('cta:theme', next)
        if (next === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      return { theme: next }
    }),

  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

  showCompletedTasks: false,
  setShowCompletedTasks: (show) => set({ showCompletedTasks: show }),
  toggleShowCompletedTasks: () => set((state) => ({ showCompletedTasks: !state.showCompletedTasks })),
}))

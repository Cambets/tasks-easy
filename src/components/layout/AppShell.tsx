import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TaskDrawer } from '@/features/tasks/TaskDrawer'
import { Sheet } from '@/components/ui/sheet'
import { useUIStore } from '@/stores/ui'

export function AppShell() {
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar in Sheet */}
      <Sheet
        open={isMobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
        side="left"
        className="w-64 p-0 bg-sidebar"
      >
        <Sidebar isMobile onCloseMobile={() => setMobileSidebarOpen(false)} />
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Task Drawer */}
      <TaskDrawer />
    </div>
  )
}

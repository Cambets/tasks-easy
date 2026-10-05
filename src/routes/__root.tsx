import { useEffect } from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { taskKeys } from '@/features/tasks/queries'
import '@/styles.css'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Central de Tarefas IA' },
      {
        name: 'description',
        content: 'Central de Tarefas IA - Plataforma SaaS de alta produtividade com Tríade do Tempo e Matriz de Eisenhower.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Central de Tarefas IA' },
      {
        property: 'og:description',
        content: 'Plataforma SaaS de alta produtividade pessoal e de equipe com IA, Tríade do Tempo e Matriz de Eisenhower.',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const router = useRouter()
  const { queryClient } = Route.useRouteContext()

  useEffect(() => {
    // Single onAuthStateChange filter: SIGNED_IN, SIGNED_OUT, USER_UPDATED
    // Never invalidate queries on SIGNED_OUT to avoid 401 storm
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        router.invalidate()
        queryClient.invalidateQueries({ queryKey: taskKeys.all })
      } else if (event === 'SIGNED_OUT') {
        router.invalidate()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, queryClient])

  // Cross-tab real-time sync via BroadcastChannel and Storage events
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('cta_cross_tab_sync')
        channel.onmessage = (event) => {
          if (event.data?.type === 'tasks_changed') {
            queryClient.invalidateQueries({ queryKey: taskKeys.all })
          } else if (event.data?.type === 'checklist_changed') {
            queryClient.invalidateQueries({ queryKey: ['checklist'] })
          }
        }
      }
    } catch (err) {
      console.warn('BroadcastChannel error:', err)
    }

    const handleCustomSync = (e: any) => {
      if (e.detail?.type === 'tasks_changed') {
        queryClient.invalidateQueries({ queryKey: taskKeys.all })
      } else if (e.detail?.type === 'checklist_changed') {
        queryClient.invalidateQueries({ queryKey: ['checklist'] })
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cta:demo-tasks') {
        queryClient.invalidateQueries({ queryKey: taskKeys.all })
      }
    }

    window.addEventListener('cta_sync', handleCustomSync)
    window.addEventListener('storage', handleStorage)

    return () => {
      if (channel) {
        channel.close()
      }
      window.removeEventListener('cta_sync', handleCustomSync)
      window.removeEventListener('storage', handleStorage)
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <html lang="pt-BR">
        <head>
          <HeadContent />
        </head>
        <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
          <Outlet />
          <Toaster richColors position="bottom-right" closeButton />
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  )
}

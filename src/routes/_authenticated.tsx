import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { supabase } from '@/integrations/supabase/client'
import { getDemoUser } from '@/lib/auth'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const demoUser = getDemoUser()

      if (!user && !demoUser) {
        throw redirect({
          to: '/auth',
          search: {
            redirect: location.href,
          },
        })
      }
    } catch (err: any) {
      if (err?.isRedirect || err?.to) {
        throw err
      }
      const demoUser = getDemoUser()
      if (!demoUser) {
        throw redirect({
          to: '/auth',
          search: {
            redirect: location.href,
          },
        })
      }
    }
  },
  component: AppShell,
  errorComponent: ({ error, reset }: { error: any; reset: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h2 className="text-base font-bold text-foreground">Ocorreu um erro nesta página</h2>
      <p className="text-xs text-muted-foreground max-w-sm">
        {error?.message || 'Não foi possível carregar as informações solicitadas.'}
      </p>
      <Button onClick={() => reset()} size="sm">
        Tentar novamente
      </Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <h2 className="text-base font-bold text-foreground">Página não encontrada</h2>
      <p className="text-xs text-muted-foreground">A rota que você tentou acessar não existe.</p>
    </div>
  ),
})

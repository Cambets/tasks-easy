import { useEffect } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { Logo } from '@/components/ui/logo'
import { getSafeRedirect } from '@/lib/auth'

export const Route = createFileRoute('/auth/callback')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Autenticando... | Central de Tarefas IA' },
      { name: 'description', content: 'Processando autenticação...' },
    ],
  }),
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    let resolved = false

    const handleRedirect = () => {
      if (resolved) return
      resolved = true
      const destination = typeof window !== 'undefined' ? sessionStorage.getItem('auth:redirect') : null
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth:redirect')
      }
      const target = getSafeRedirect(destination)
      router.navigate({ to: target as any, replace: true })
    }

    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleRedirect()
      }
    })

    // 2. Listen to onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        handleRedirect()
      }
    })

    // 3. Fallback timeout to prevent hanging forever
    const timer = setTimeout(() => {
      handleRedirect()
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Logo size={48} className="animate-bounce" />
        <h2 className="text-base font-semibold text-foreground">Conectando sua conta...</h2>
        <p className="text-xs text-muted-foreground">Aguarde um momento enquanto preparamos seu ambiente.</p>
      </div>
    </div>
  )
}

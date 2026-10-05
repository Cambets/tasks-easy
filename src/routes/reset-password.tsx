import { useEffect, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPasswordSchema, translateAuthError } from '@/lib/auth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const Route = createFileRoute('/reset-password')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Nova Senha | Central de Tarefas IA' },
      { name: 'description', content: 'Defina sua nova senha.' },
    ],
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

  useEffect(() => {
    // Listen to PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true)
      }
    })

    // Also check if user is already authenticated or has access token in hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecoveryMode(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Senhas inválidas')
      return
    }

    setLoading(true)

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      })

      if (updateErr) {
        const msg = translateAuthError(updateErr)
        setError(msg)
        toast.error(msg)
        return
      }

      toast.success('Senha atualizada com sucesso!')
      router.navigate({ to: '/todas', replace: true })
    } catch (err: any) {
      const msg = translateAuthError(err)
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card p-6 shadow-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo size={40} />
          <h1 className="text-xl font-bold text-foreground tracking-tight">Criar Nova Senha</h1>
          <p className="text-xs text-muted-foreground">
            Defina sua nova credencial de acesso
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground block">Nova senha</label>
            <Input
              type="password"
              placeholder="Pelo menos 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground block">Confirme a nova senha</label>
            <Input
              type="password"
              placeholder="Digite novamente a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Atualizando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </div>
    </div>
  )
}

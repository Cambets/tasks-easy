import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, translateAuthError } from '@/lib/auth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/auth/forgot')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Recuperar Senha | Central de Tarefas IA' },
      { name: 'description', content: 'Recuperação de senha da Central de Tarefas IA.' },
    ],
  }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = forgotPasswordSchema.safeParse({ email })
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'E-mail inválido')
      return
    }

    setLoading(true)

    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (resetErr) {
        const msg = translateAuthError(resetErr)
        setError(msg)
        toast.error(msg)
        return
      }

      setSent(true)
      toast.success('Link de recuperação enviado com sucesso!')
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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Recuperar Senha</h1>
          <p className="text-xs text-muted-foreground">
            {sent
              ? 'Verifique sua caixa de entrada para redefinir sua senha'
              : 'Informe seu e-mail cadastrado para receber as instruções'}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              Enviamos um link para <strong className="text-foreground">{email}</strong>. Clique no link para definir uma nova senha.
            </p>
            <Link to="/auth">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para o login</span>
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground block">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <Button type="submit" disabled={loading || !email.trim()} className="w-full">
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar ao login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { createFileRoute, Link, useRouter, useSearch } from '@tanstack/react-router'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  authSchema,
  getSafeRedirect,
  isSupabaseConfigured,
  setDemoUser,
  signInWithGoogleManaged,
  translateAuthError,
} from '@/lib/auth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { AlertCircle, Sparkles } from 'lucide-react'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/auth/')({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: 'Entrar | Central de Tarefas IA' },
      { name: 'description', content: 'Acesse sua conta na Central de Tarefas IA.' },
    ],
  }),
  component: AuthPage,
})

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.14C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.59l4.01 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}

function AuthPage() {
  const router = useRouter()
  const search = useSearch({ from: '/auth/' })
  const redirectTarget = getSafeRedirect(search.redirect)
  const isConfigured = isSupabaseConfigured()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)
  const [showDemoFallback, setShowDemoFallback] = useState(!isConfigured)

  const handleDemoLogin = (customEmail?: string) => {
    const userEmail = customEmail || email || 'marcuscambeta@gmail.com'
    setDemoUser(userEmail)
    toast.success(`Acessando como ${userEmail} (Modo Demonstração)`)
    router.navigate({ to: redirectTarget as any, replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const validation = authSchema.safeParse({ email, password })
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {}
      for (const issue of validation.error.issues) {
        if (issue.path[0] === 'email') fieldErrors.email = issue.message
        if (issue.path[0] === 'password') fieldErrors.password = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    // Se o Supabase não estiver configurado com credenciais válidas no .env, realiza o login/cadastro local direto
    if (!isConfigured) {
      handleDemoLogin(email)
      setLoading(false)
      return
    }

    try {
      if (activeTab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          const translated = translateAuthError(error)
          setErrors({ form: translated })
          toast.error(translated)
          setLoading(false)
          return
        }

        toast.success('Bem-vindo(a) de volta!')
        router.navigate({ to: redirectTarget as any, replace: true })
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          const translated = translateAuthError(error)
          setErrors({ form: translated })
          toast.error(translated)
          setLoading(false)
          return
        }

        if (data.session) {
          toast.success('Conta criada com sucesso!')
          router.navigate({ to: redirectTarget as any, replace: true })
        } else {
          toast.success('Cadastro realizado! Verifique seu e-mail para confirmar.')
          setActiveTab('signin')
        }
      }
    } catch (err: any) {
      const isFetchError = err?.message?.toLowerCase().includes('failed to fetch')
      if (isFetchError) {
        setShowDemoFallback(true)
        setErrors({
          form: 'Não foi possível conectar ao servidor Supabase (backend não configurado no .env). Clique abaixo para entrar no Modo Demonstração.',
        })
      } else {
        const msg = translateAuthError(err)
        setErrors({ form: msg })
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      if (!isConfigured) {
        handleDemoLogin(email || 'google.user@exemplo.com')
        return
      }
      await signInWithGoogleManaged(redirectTarget)
    } catch (err: any) {
      setShowDemoFallback(true)
      toast.error('Erro ao conectar com Google. Você pode usar o Modo Demonstração.')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card p-6 shadow-md space-y-6">
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo size={40} />
          <h1 className="text-xl font-bold text-foreground tracking-tight">Central de Tarefas IA</h1>
          <p className="text-xs text-muted-foreground">
            {activeTab === 'signin' ? 'Acesse para organizar sua rotina' : 'Crie sua conta gratuita em segundos'}
          </p>
        </div>

        {/* Notice for Demo Mode / Not Configured */}
        {!isConfigured && (
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Modo Demonstração Local</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              O backend Supabase ainda não foi conectado no arquivo <code>.env</code>. Você pode se cadastrar ou entrar com qualquer e-mail para testar todo o sistema localmente!
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-lg bg-muted border border-border/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin')
              setErrors({})
            }}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup')
              setErrors({})
            }}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Form Error */}
        {errors.form && (
          <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 text-center font-medium space-y-2">
            <p>{errors.form}</p>
            {showDemoFallback && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleDemoLogin(email)}
                className="w-full text-xs"
              >
                Acessar Agora em Modo Demonstração
              </Button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground block">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground block">Senha</label>
              {activeTab === 'signin' && (
                <Link
                  to="/auth/forgot"
                  className="text-[11px] text-primary hover:underline underline-offset-2"
                >
                  Esqueci minha senha
                </Link>
              )}
            </div>
            <Input
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
            />
            {errors.password && <p className="text-[11px] text-destructive">{errors.password}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? 'Processando...'
              : activeTab === 'signin'
                ? 'Entrar no sistema'
                : 'Criar minha conta'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <span className="relative px-2 bg-card text-xs text-muted-foreground uppercase">ou</span>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full gap-2"
        >
          <GoogleIcon />
          <span>Continuar com Google</span>
        </Button>
      </div>
    </div>
  )
}

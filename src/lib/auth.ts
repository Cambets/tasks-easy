import { supabase } from '@/integrations/supabase/client'
import type { QueryClient } from '@tanstack/react-query'
import type { AnyRouter } from '@tanstack/react-router'
import { z } from 'zod'

export const authSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(72, 'A senha deve ter no máximo 72 caracteres'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .max(72, 'A senha deve ter no máximo 72 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'))
}

export function getDemoUser(): { id: string; email: string } | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('cta:local-user')
  return stored ? JSON.parse(stored) : null
}

export function setDemoUser(email: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cta:local-user', JSON.stringify({ id: 'local-demo-user', email }))
  }
}

export function clearDemoUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cta:local-user')
  }
}

export function getSafeRedirect(redirectParam?: string | null): string {
  if (!redirectParam) return '/todas'
  // Accept only same-origin relative paths starting with / and not //
  if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
    return redirectParam
  }
  return '/todas'
}

export function translateAuthError(error: { message?: string } | null | undefined): string {
  if (!error || !error.message) return 'Ocorreu um erro na autenticação.'
  const msg = error.message.toLowerCase()
  if (msg.includes('failed to fetch')) {
    return 'Não foi possível conectar ao servidor Supabase. O backend ainda não foi configurado no arquivo .env.'
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos'
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'Este e-mail já está cadastrado'
  }
  if (msg.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres'
  }
  if (msg.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos.'
  }
  return error.message
}

export async function signInWithGoogleManaged(redirectPath: string = '/todas') {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('auth:redirect', redirectPath)

  if (!isSupabaseConfigured()) {
    setDemoUser('google.user@exemplo.com')
    window.location.href = redirectPath
    return
  }

  const redirectUrl = `${window.location.origin}/auth/callback`

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
    if (error) {
      throw error
    }
  } catch (err) {
    console.error('Erro ao iniciar login com Google:', err)
    throw err
  }
}

export async function signOutApp(queryClient: QueryClient, router: AnyRouter) {
  try {
    clearDemoUser()
    await queryClient.cancelQueries()
    queryClient.clear()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Erro no signOut:', err)
  } finally {
    router.navigate({ to: '/auth', replace: true })
  }
}

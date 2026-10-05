import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { getDemoUser } from '@/lib/auth'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Central de Tarefas IA' },
      { name: 'description', content: 'Central de Tarefas IA' },
    ],
  }),
  beforeLoad: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const demoUser = getDemoUser()
      if (user || demoUser) {
        throw redirect({ to: '/todas' })
      } else {
        throw redirect({ to: '/auth' })
      }
    } catch (err) {
      if ((err as { isRedirect?: boolean })?.isRedirect || (err as any)?.to) {
        throw err
      }
      throw redirect({ to: '/auth' })
    }
  },
  component: () => null,
})

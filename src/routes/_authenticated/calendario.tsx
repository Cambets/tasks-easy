import { createFileRoute } from '@tanstack/react-router'
import { CalendarView } from '@/features/tasks/CalendarView'
import { fetchTasks, taskKeys } from '@/features/tasks/queries'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/calendario')({
  head: () => ({
    meta: [
      { title: 'Calendário | Central de Tarefas IA' },
      { name: 'description', content: 'Planejamento e visualização de prazos no calendário mensal.' },
    ],
  }),
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: taskKeys.all,
      queryFn: fetchTasks,
    })
  },
  errorComponent: ({ error, reset }: { error: any; reset: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <h3 className="text-sm font-semibold text-foreground">Erro ao carregar calendário</h3>
      <p className="text-xs text-muted-foreground">{error?.message}</p>
      <Button onClick={() => reset()} size="sm">Tentar novamente</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-xs text-muted-foreground">Conteúdo não encontrado.</div>
  ),
  component: CalendarioPage,
})

function CalendarioPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Calendário Mensal</h2>
        <p className="text-xs text-muted-foreground">
          Acompanhe os prazos e adicione novas tarefas diretamente nos dias desejados.
        </p>
      </div>

      <CalendarView />
    </div>
  )
}

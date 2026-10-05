import { createFileRoute } from '@tanstack/react-router'
import { TaskListView } from '@/features/tasks/TaskListView'
import { fetchTasks, taskKeys } from '@/features/tasks/queries'
import { isToday } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/hoje')({
  head: () => ({
    meta: [
      { title: 'Hoje | Central de Tarefas IA' },
      { name: 'description', content: 'Foco no que realmente importa para ser feito hoje.' },
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
      <h3 className="text-sm font-semibold text-foreground">Erro ao carregar tarefas de hoje</h3>
      <p className="text-xs text-muted-foreground">{error?.message}</p>
      <Button onClick={() => reset()} size="sm">Tentar novamente</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-xs text-muted-foreground">Conteúdo não encontrado.</div>
  ),
  component: HojePage,
})

function HojePage() {
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Hoje</h2>
        <p className="text-xs text-muted-foreground">
          Tarefas agendadas para hoje ou marcadas como foco prioritário do dia.
        </p>
      </div>

      <TaskListView
        defaultDate={todayStr}
        defaultStatus="todo"
        filterFn={(task) => {
          if (task.status === 'done') return false
          return isToday(task.due_date) || task.is_focus_today
        }}
        emptyTitle="Nenhuma tarefa para hoje!"
        emptyDescription="Você está em dia com seus compromissos de hoje. Aproveite para planejar o amanhã."
      />
    </div>
  )
}

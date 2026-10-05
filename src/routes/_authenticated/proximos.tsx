import { createFileRoute } from '@tanstack/react-router'
import { TaskListView } from '@/features/tasks/TaskListView'
import { fetchTasks, taskKeys } from '@/features/tasks/queries'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/proximos')({
  head: () => ({
    meta: [
      { title: 'Próximos 7 Dias | Central de Tarefas IA' },
      { name: 'description', content: 'Planejamento e visualização das tarefas para a próxima semana.' },
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
      <h3 className="text-sm font-semibold text-foreground">Erro ao carregar próximos 7 dias</h3>
      <p className="text-xs text-muted-foreground">{error?.message}</p>
      <Button onClick={() => reset()} size="sm">Tentar novamente</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-xs text-muted-foreground">Conteúdo não encontrado.</div>
  ),
  component: ProximosPage,
})

function ProximosPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Próximos 7 dias</h2>
        <p className="text-xs text-muted-foreground">
          Antecipe prazos e compromissos agendados para os próximos sete dias.
        </p>
      </div>

      <TaskListView
        defaultStatus="todo"
        filterFn={(task) => {
          if (!task.due_date || task.status === 'done') return false
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const in7Days = new Date(today.getTime() + 7 * 86400000)
          in7Days.setHours(23, 59, 59, 999)

          const [y, m, d] = task.due_date.split('-').map(Number)
          const dueDate = new Date(y, m - 1, d)
          return dueDate >= today && dueDate <= in7Days
        }}
        emptyTitle="Sem tarefas para os próximos 7 dias"
        emptyDescription="Você não possui prazos agendados para a próxima semana."
      />
    </div>
  )
}

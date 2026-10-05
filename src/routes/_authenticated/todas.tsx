import { createFileRoute } from '@tanstack/react-router'
import { TaskListView } from '@/features/tasks/TaskListView'
import { fetchTasks, taskKeys } from '@/features/tasks/queries'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/todas')({
  head: () => ({
    meta: [
      { title: 'Todas as Tarefas | Central de Tarefas IA' },
      { name: 'description', content: 'Gerencie todas as suas tarefas ativas e concluídas.' },
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
      <h3 className="text-sm font-semibold text-foreground">Erro ao carregar tarefas</h3>
      <p className="text-xs text-muted-foreground">{error?.message}</p>
      <Button onClick={() => reset()} size="sm">Tentar novamente</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-xs text-muted-foreground">Tarefa não encontrada.</div>
  ),
  component: TodasPage,
})

function TodasPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Todas as tarefas</h2>
        <p className="text-xs text-muted-foreground">
          Visão geral completa de todo o seu backlog e tarefas pendentes.
        </p>
      </div>

      <TaskListView
        defaultStatus="todo"
        emptyTitle="Tudo limpo por aqui!"
        emptyDescription="Você não possui tarefas ativas no momento. Pressione N para adicionar uma nova."
      />
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { TaskListView } from '@/features/tasks/TaskListView'
import { fetchTasks, taskKeys } from '@/features/tasks/queries'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/inbox')({
  head: () => ({
    meta: [
      { title: 'Caixa de Entrada | Central de Tarefas IA' },
      { name: 'description', content: 'Capture pensamentos rápidos e tarefas não processadas.' },
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
      <h3 className="text-sm font-semibold text-foreground">Erro ao carregar caixa de entrada</h3>
      <p className="text-xs text-muted-foreground">{error?.message}</p>
      <Button onClick={() => reset()} size="sm">Tentar novamente</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-xs text-muted-foreground">Conteúdo não encontrado.</div>
  ),
  component: InboxPage,
})

function InboxPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Caixa de entrada</h2>
        <p className="text-xs text-muted-foreground">
          O local para descarregar ideias e novas tarefas antes de organizá-las e priorizá-las.
        </p>
      </div>

      <TaskListView
        defaultStatus="inbox"
        filterFn={(task) => task.status === 'inbox'}
        emptyTitle="Caixa de entrada vazia!"
        emptyDescription="Tudo foi processado e organizado. Use o input acima para capturar novas demandas."
      />
    </div>
  )
}

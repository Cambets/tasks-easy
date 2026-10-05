import { createFileRoute } from '@tanstack/react-router'
import { KanbanBoard } from '@/features/tasks/KanbanBoard'
import { fetchTasks, taskKeys } from '@/features/tasks/queries'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/kanban')({
  head: () => ({
    meta: [
      { title: 'Quadro Kanban | Central de Tarefas IA' },
      { name: 'description', content: 'Gerencie seu fluxo de trabalho visual no quadro Kanban interativo.' },
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
      <h3 className="text-sm font-semibold text-foreground">Erro ao carregar Kanban</h3>
      <p className="text-xs text-muted-foreground">{error?.message}</p>
      <Button onClick={() => reset()} size="sm">Tentar novamente</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-xs text-muted-foreground">Conteúdo não encontrado.</div>
  ),
  component: KanbanPage,
})

function KanbanPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Quadro Kanban</h2>
        <p className="text-xs text-muted-foreground">
          Arraste e solte cartões entre as colunas para atualizar o fluxo de execução.
        </p>
      </div>

      <KanbanBoard />
    </div>
  )
}

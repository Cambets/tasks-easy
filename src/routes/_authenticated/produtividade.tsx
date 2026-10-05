import { createFileRoute } from '@tanstack/react-router'
import { EisenhowerView } from '@/features/tasks/EisenhowerView'
import { fetchTasks, taskKeys } from '@/features/tasks/queries'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/produtividade')({
  head: () => ({
    meta: [
      { title: 'Matriz de Eisenhower | Central de Tarefas IA' },
      { name: 'description', content: 'Matriz 2x2 de priorização por importância e urgência.' },
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
      <h3 className="text-sm font-semibold text-foreground">Erro ao carregar matriz de produtividade</h3>
      <p className="text-xs text-muted-foreground">{error?.message}</p>
      <Button onClick={() => reset()} size="sm">Tentar novamente</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center text-xs text-muted-foreground">Conteúdo não encontrado.</div>
  ),
  component: ProdutividadePage,
})

function ProdutividadePage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 pb-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Matriz de Eisenhower</h2>
        <p className="text-xs text-muted-foreground">
          Separe o que é urgente do que é realmente importante para direcionar sua energia ao que gera valor.
        </p>
      </div>

      <EisenhowerView />
    </div>
  )
}

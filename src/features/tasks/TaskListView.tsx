import { useMemo } from 'react'
import { TaskRow } from './TaskRow'
import { AddTaskInline } from './AddTaskInline'
import { useDeleteTask, useTasks } from './queries'
import { useUIStore } from '@/stores/ui'
import type { Task, TaskStatus, TimeSphere } from '@/integrations/supabase/types'
import { CheckCircle2, Eye, EyeOff, ListFilter } from 'lucide-react'

interface TaskListViewProps {
  filterFn?: (task: Task) => boolean
  defaultStatus?: TaskStatus
  defaultDate?: string | null
  defaultSphere?: TimeSphere | null
  emptyTitle?: string
  emptyDescription?: string
}

export function TaskListView({
  filterFn,
  defaultStatus = 'inbox',
  defaultDate = null,
  defaultSphere = null,
  emptyTitle = 'Nenhuma tarefa encontrada',
  emptyDescription = 'Crie uma nova tarefa acima ou pressione a tecla "N".',
}: TaskListViewProps) {
  const { data: tasks = [], isLoading } = useTasks()
  const deleteTask = useDeleteTask()
  const searchQuery = useUIStore((state) => state.searchQuery)
  const showCompleted = useUIStore((state) => state.showCompletedTasks)
  const toggleShowCompleted = useUIStore((state) => state.toggleShowCompletedTasks)

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(q)
        const matchesNotes = task.notes?.toLowerCase().includes(q) ?? false
        if (!matchesTitle && !matchesNotes) return false
      }

      // 2. Custom route filter
      if (filterFn && !filterFn(task)) {
        return false
      }

      // 3. Completed tasks visibility filter
      if (!showCompleted && task.status === 'done') {
        // If this route explicitly asks for done or is /todas, check filterFn
        if (!filterFn) return false
      }

      return true
    })
  }, [tasks, searchQuery, filterFn, showCompleted])

  const pendingTasks = useMemo(() => filteredTasks.filter((t) => t.status !== 'done'), [filteredTasks])
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'done'), [filteredTasks])

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-12 w-full rounded-lg bg-muted/60 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Inline Quick Add */}
      <AddTaskInline
        defaultStatus={defaultStatus}
        defaultDate={defaultDate}
        defaultSphere={defaultSphere}
      />

      {/* Filter and stats banner */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          {pendingTasks.length} {pendingTasks.length === 1 ? 'tarefa ativa' : 'tarefas ativas'}
          {doneTasks.length > 0 && ` • ${doneTasks.length} concluída${doneTasks.length > 1 ? 's' : ''}`}
        </span>

        <button
          type="button"
          onClick={toggleShowCompleted}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
        >
          {showCompleted ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>{showCompleted ? 'Ocultar concluídas' : 'Mostrar concluídas'}</span>
        </button>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/80 bg-card/50">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-foreground">{emptyTitle}</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onDelete={(id) => deleteTask.mutate(id)}
            />
          ))}

          {showCompleted && doneTasks.length > 0 && (
            <div className="pt-4 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Concluídas ({doneTasks.length})
              </div>
              {doneTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

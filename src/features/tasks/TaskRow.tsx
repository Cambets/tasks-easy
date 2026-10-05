import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskPriorityPopover } from './TaskPriorityPopover'
import { TaskDatePopover } from './TaskDatePopover'
import { useToggleComplete, useUpdateTask } from './queries'
import { useUIStore } from '@/stores/ui'
import type { Task, TaskPriority } from '@/integrations/supabase/types'
import { isOverdue, cn } from '@/lib/utils'
import { SPHERE_LABELS } from '@/lib/constants'
import { Star, Tag as TagIcon, Trash2 } from 'lucide-react'

interface TaskRowProps {
  task: Task
  onDelete?: (id: string) => void
}

export function TaskRow({ task, onDelete }: TaskRowProps) {
  const toggleComplete = useToggleComplete()
  const updateTask = useUpdateTask()
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId)
  const isDone = task.status === 'done'
  const overdue = isOverdue(task.due_date, isDone)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleComplete.mutate({ id: task.id, currentStatus: task.status })
  }

  const handlePriorityChange = (newPrio: TaskPriority) => {
    updateTask.mutate({ id: task.id, updates: { priority: newPrio } })
  }

  const handleDateChange = (newDate: string | null) => {
    updateTask.mutate({ id: task.id, updates: { due_date: newDate } })
  }

  const handleFocusToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask.mutate({
      id: task.id,
      updates: { is_focus_today: !task.is_focus_today },
    })
  }

  return (
    <div
      onClick={() => setSelectedTaskId(task.id)}
      className={cn(
        'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:bg-accent/40 transition-all cursor-pointer shadow-xs',
        isDone && 'opacity-60 bg-muted/30'
      )}
    >
      {/* Left side: circular checkbox + star + title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div onClick={handleToggle} className="flex-shrink-0">
          <Checkbox circular checked={isDone} />
        </div>

        <button
          type="button"
          onClick={handleFocusToday}
          title={task.is_focus_today ? 'Remover do foco de hoje' : 'Focar hoje'}
          className={cn(
            'flex-shrink-0 transition-colors cursor-pointer',
            task.is_focus_today
              ? 'text-amber-500 fill-amber-500'
              : 'text-muted-foreground/40 hover:text-amber-500'
          )}
        >
          <Star className={cn('h-4 w-4', task.is_focus_today && 'fill-amber-500 text-amber-500')} />
        </button>

        <span
          className={cn(
            'text-sm font-medium text-foreground truncate',
            isDone && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </span>

        {task.time_sphere && (
          <span
            className="hidden sm:inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border"
            style={{
              borderColor: `var(--sphere-${task.time_sphere})`,
              color: `var(--sphere-${task.time_sphere})`,
            }}
          >
            {SPHERE_LABELS[task.time_sphere]}
          </span>
        )}
      </div>

      {/* Right side: priority + date + actions */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <TaskPriorityPopover
          value={task.priority}
          onChange={handlePriorityChange}
          size="sm"
        />

        <TaskDatePopover
          value={task.due_date}
          onChange={handleDateChange}
          isDone={isDone}
        />

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            title="Excluir tarefa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

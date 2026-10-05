import { useState } from 'react'
import { Plus, MoreHorizontal, ArrowRight, ArrowLeft } from 'lucide-react'
import { useTasks, useUpdateTask, useCreateTask } from './queries'
import { useUIStore } from '@/stores/ui'
import { STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants'
import type { Task, TaskStatus } from '@/integrations/supabase/types'
import { formatDate, isOverdue, cn } from '@/lib/utils'

const COLUMNS: TaskStatus[] = ['inbox', 'todo', 'in_progress', 'done']

export function KanbanBoard() {
  const { data: tasks = [] } = useTasks()
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId)
  const searchQuery = useUIStore((state) => state.searchQuery)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [activeNewColumn, setActiveNewColumn] = useState<TaskStatus | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggedTaskId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId
    if (!taskId) return

    updateTask.mutate({
      id: taskId,
      updates: {
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null,
      },
    })
    setDraggedTaskId(null)
  }

  const handleQuickAdd = (status: TaskStatus) => {
    if (!newTitle.trim()) return
    createTask.mutate({
      title: newTitle.trim(),
      status,
    })
    setNewTitle('')
    setActiveNewColumn(null)
  }

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return task.title.toLowerCase().includes(q) || (task.notes?.toLowerCase().includes(q) ?? false)
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-6 overflow-x-auto">
      {COLUMNS.map((columnKey) => {
        const columnTasks = filteredTasks.filter((t) => t.status === columnKey)

        return (
          <div
            key={columnKey}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columnKey)}
            className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-3 min-h-[500px] shadow-xs"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {STATUS_LABELS[columnKey]}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveNewColumn(columnKey)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                title="Adicionar tarefa"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Quick add in column */}
            {activeNewColumn === columnKey && (
              <div className="mb-3 p-2 rounded-lg border border-primary/40 bg-card shadow-sm">
                <input
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nova tarefa..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd(columnKey)
                    if (e.key === 'Escape') setActiveNewColumn(null)
                  }}
                  className="w-full text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mb-2"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveNewColumn(null)}
                    className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground rounded cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(columnKey)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {/* Cards container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {columnTasks.map((task) => {
                const overdue = isOverdue(task.due_date, task.status === 'done')
                const colIndex = COLUMNS.indexOf(columnKey)

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={cn(
                      'group rounded-lg border border-border/80 bg-card p-3 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing space-y-2',
                      draggedTaskId === task.id && 'opacity-40 border-dashed border-primary'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-foreground line-clamp-2">
                        {task.title}
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-1 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="priority-dot"
                          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                        />
                        <span className="text-muted-foreground text-[10px]">
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>

                      {task.due_date && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded font-medium',
                            overdue
                              ? 'bg-[var(--overdue-bg)] text-[var(--overdue-fg)]'
                              : 'text-muted-foreground bg-muted'
                          )}
                        >
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>

                    {/* Quick Move Arrows for Touch / Accessibility */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      {colIndex > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTask.mutate({
                              id: task.id,
                              updates: { status: COLUMNS[colIndex - 1] },
                            })
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                          title="Mover para esquerda"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                      ) : (
                        <div />
                      )}

                      {colIndex < COLUMNS.length - 1 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTask.mutate({
                              id: task.id,
                              updates: {
                                status: COLUMNS[colIndex + 1],
                                completed_at: COLUMNS[colIndex + 1] === 'done' ? new Date().toISOString() : null,
                              },
                            })
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                          title="Mover para direita"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                )
              })}

              {columnTasks.length === 0 && (
                <div className="h-24 flex items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground/60">
                  Arraste ou adicione aqui
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

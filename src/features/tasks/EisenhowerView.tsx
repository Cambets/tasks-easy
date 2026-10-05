import { useTasks, useUpdateTask, useCreateTask } from './queries'
import { useUIStore } from '@/stores/ui'
import { Checkbox } from '@/components/ui/checkbox'
import { PRIORITY_COLORS } from '@/lib/constants'
import { formatDate, isOverdue, cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface QuadrantConfig {
  id: string
  title: string
  subtitle: string
  is_important: boolean
  is_urgent: boolean
  borderColor: string
  badgeBg: string
}

const QUADRANTS: QuadrantConfig[] = [
  {
    id: 'q1',
    title: 'Fazer Imediatamente (Q1)',
    subtitle: 'Importante & Urgente (Crises, prazos críticos)',
    is_important: true,
    is_urgent: true,
    borderColor: 'var(--sphere-urgente)',
    badgeBg: 'var(--overdue-bg)',
  },
  {
    id: 'q2',
    title: 'Decidir & Agendar (Q2)',
    subtitle: 'Importante & Não urgente (Metas, saúde, planejamento)',
    is_important: true,
    is_urgent: false,
    borderColor: 'var(--sphere-importante)',
    badgeBg: 'var(--primary)',
  },
  {
    id: 'q3',
    title: 'Delegar (Q3)',
    subtitle: 'Não importante & Urgente (Interrupções, urgências alheias)',
    is_important: false,
    is_urgent: true,
    borderColor: 'var(--sphere-circunstancial)',
    badgeBg: 'var(--accent)',
  },
  {
    id: 'q4',
    title: 'Eliminar (Q4)',
    subtitle: 'Não importante & Não urgente (Distrações, desperdício)',
    is_important: false,
    is_urgent: false,
    borderColor: 'var(--border)',
    badgeBg: 'var(--muted)',
  },
]

export function EisenhowerView() {
  const { data: tasks = [] } = useTasks()
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId)
  const searchQuery = useUIStore((state) => state.searchQuery)

  const [activeNewQuadrant, setActiveNewQuadrant] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const handleQuickAdd = (quad: QuadrantConfig) => {
    if (!newTitle.trim()) return
    createTask.mutate({
      title: newTitle.trim(),
      is_important: quad.is_important,
      is_urgent: quad.is_urgent,
      status: 'todo',
    })
    setNewTitle('')
    setActiveNewQuadrant(null)
  }

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return task.title.toLowerCase().includes(q) || (task.notes?.toLowerCase().includes(q) ?? false)
  })

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        A Matriz de Eisenhower ajuda a priorizar ações com base no impacto real e urgência temporal.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTS.map((quad) => {
          const quadTasks = filteredTasks.filter(
            (t) => Boolean(t.is_important) === quad.is_important && Boolean(t.is_urgent) === quad.is_urgent
          )

          return (
            <div
              key={quad.id}
              className="flex flex-col rounded-xl border border-border/80 bg-card p-4 min-h-[340px] shadow-xs"
              style={{ borderTop: `4px solid ${quad.borderColor}` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{quad.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{quad.subtitle}</p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {quadTasks.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveNewQuadrant(quad.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick Add */}
              {activeNewQuadrant === quad.id && (
                <div className="mb-3 p-2 rounded-lg border border-primary/40 bg-card shadow-sm">
                  <input
                    type="text"
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nova tarefa neste quadrante..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(quad)
                      if (e.key === 'Escape') setActiveNewQuadrant(null)
                    }}
                    className="w-full text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mb-2"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveNewQuadrant(null)}
                      className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground rounded cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(quad)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* Task list */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
                {quadTasks.map((task) => {
                  const isDone = task.status === 'done'
                  const overdue = isOverdue(task.due_date, isDone)

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        'group flex items-center justify-between gap-2 p-2 rounded-md border border-border/60 bg-card hover:bg-accent/40 transition-all cursor-pointer shadow-xs',
                        isDone && 'opacity-60 bg-muted/30'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Checkbox
                          circular
                          checked={isDone}
                          onCheckedChange={(checked) =>
                            updateTask.mutate({
                              id: task.id,
                              updates: {
                                status: checked ? 'done' : 'todo',
                                completed_at: checked ? new Date().toISOString() : null,
                              },
                            })
                          }
                        />
                        <span
                          className={cn(
                            'text-xs font-medium text-foreground truncate',
                            isDone && 'line-through text-muted-foreground'
                          )}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className="priority-dot"
                          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                        />
                        {task.due_date && (
                          <span
                            className={cn(
                              'text-[10px] px-1 py-0.5 rounded font-medium',
                              overdue
                                ? 'bg-[var(--overdue-bg)] text-[var(--overdue-fg)]'
                                : 'text-muted-foreground bg-muted'
                            )}
                          >
                            {formatDate(task.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {quadTasks.length === 0 && (
                  <div className="h-20 flex items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground/60">
                    Nenhuma tarefa aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

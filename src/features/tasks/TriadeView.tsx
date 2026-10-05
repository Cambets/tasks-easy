import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTasks, useUpdateTask, useCreateTask } from './queries'
import { useUIStore } from '@/stores/ui'
import { SPHERE_COLORS, SPHERE_DESCRIPTIONS, SPHERE_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import type { TimeSphere } from '@/integrations/supabase/types'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate, isOverdue, cn } from '@/lib/utils'

const SPHERES: TimeSphere[] = ['importante', 'urgente', 'circunstancial']

export function TriadeView() {
  const { data: tasks = [] } = useTasks()
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId)
  const searchQuery = useUIStore((state) => state.searchQuery)

  const [activeNewSphere, setActiveNewSphere] = useState<TimeSphere | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const handleQuickAdd = (sphere: TimeSphere) => {
    if (!newTitle.trim()) return
    createTask.mutate({
      title: newTitle.trim(),
      time_sphere: sphere,
      status: 'todo',
    })
    setNewTitle('')
    setActiveNewSphere(null)
  }

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return task.title.toLowerCase().includes(q) || (task.notes?.toLowerCase().includes(q) ?? false)
  })

  // Calculate percentages for the Triad balance
  const sphereCounts = {
    importante: filteredTasks.filter((t) => t.time_sphere === 'importante').length,
    urgente: filteredTasks.filter((t) => t.time_sphere === 'urgente').length,
    circunstancial: filteredTasks.filter((t) => t.time_sphere === 'circunstancial').length,
  }
  const totalSphereTasks = sphereCounts.importante + sphereCounts.urgente + sphereCounts.circunstancial || 1

  const spherePercent = {
    importante: Math.round((sphereCounts.importante / totalSphereTasks) * 100),
    urgente: Math.round((sphereCounts.urgente / totalSphereTasks) * 100),
    circunstancial: Math.round((sphereCounts.circunstancial / totalSphereTasks) * 100),
  }

  return (
    <div className="space-y-6">
      {/* Triad Balance Bar */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Equilíbrio da Tríade do Tempo
          </span>
          <span className="text-xs text-muted-foreground">
            Meta recomendada: 70% Importante • 20% Urgente • 10% Circunstancial
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full rounded-full bg-muted flex overflow-hidden">
          <div
            style={{
              width: `${spherePercent.importante}%`,
              backgroundColor: SPHERE_COLORS.importante,
            }}
            title={`Importante: ${spherePercent.importante}%`}
          />
          <div
            style={{
              width: `${spherePercent.urgente}%`,
              backgroundColor: SPHERE_COLORS.urgente,
            }}
            title={`Urgente: ${spherePercent.urgente}%`}
          />
          <div
            style={{
              width: `${spherePercent.circunstancial}%`,
              backgroundColor: SPHERE_COLORS.circunstancial,
            }}
            title={`Circunstancial: ${spherePercent.circunstancial}%`}
          />
        </div>

        <div className="flex items-center justify-around text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SPHERE_COLORS.importante }}
            />
            <span className="font-semibold">{spherePercent.importante}% Importante</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SPHERE_COLORS.urgente }}
            />
            <span className="font-semibold">{spherePercent.urgente}% Urgente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SPHERE_COLORS.circunstancial }}
            />
            <span className="font-semibold">{spherePercent.circunstancial}% Circunstancial</span>
          </div>
        </div>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {SPHERES.map((sphere) => {
          const sphereTasks = filteredTasks.filter((t) => t.time_sphere === sphere)

          return (
            <div
              key={sphere}
              className="flex flex-col rounded-xl border border-border/70 bg-card p-4 min-h-[480px] shadow-xs"
            >
              {/* Header */}
              <div className="pb-3 mb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: SPHERE_COLORS[sphere] }}
                    />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      {SPHERE_LABELS[sphere]}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {sphereTasks.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveNewSphere(sphere)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {SPHERE_DESCRIPTIONS[sphere]}
                </p>
              </div>

              {/* Quick Add */}
              {activeNewSphere === sphere && (
                <div className="mb-3 p-2 rounded-lg border border-primary/40 bg-card shadow-sm">
                  <input
                    type="text"
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={`Nova tarefa em ${SPHERE_LABELS[sphere]}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(sphere)
                      if (e.key === 'Escape') setActiveNewSphere(null)
                    }}
                    className="w-full text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mb-2"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveNewSphere(null)}
                      className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground rounded cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(sphere)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px]">
                {sphereTasks.map((task) => {
                  const isDone = task.status === 'done'
                  const overdue = isOverdue(task.due_date, isDone)

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        'group flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/70 bg-card hover:bg-accent/40 transition-all cursor-pointer shadow-xs',
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

                {sphereTasks.length === 0 && (
                  <div className="h-28 flex items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground/60 text-center px-4">
                    Nenhuma tarefa classificada como {SPHERE_LABELS[sphere]}
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

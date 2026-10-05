import { useEffect, useState } from 'react'
import {
  Calendar,
  CheckSquare,
  Clock,
  Flag,
  Layers,
  Plus,
  Star,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react'
import { Sheet, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { useUIStore } from '@/stores/ui'
import {
  useChecklist,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useDeleteTask,
  useTasks,
  useUpdateChecklistItem,
  useUpdateTask,
} from './queries'
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  SPHERE_DESCRIPTIONS,
  SPHERE_LABELS,
  STATUS_LABELS,
} from '@/lib/constants'
import type { TaskPriority, TaskStatus, TimeSphere } from '@/integrations/supabase/types'
import { cn, formatDate } from '@/lib/utils'

export function TaskDrawer() {
  const selectedTaskId = useUIStore((state) => state.selectedTaskId)
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId)
  const { data: tasks = [] } = useTasks()
  const currentTask = tasks.find((t) => t.id === selectedTaskId)

  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const { data: checklist = [] } = useChecklist(selectedTaskId)
  const createChecklistItem = useCreateChecklistItem()
  const updateChecklistItem = useUpdateChecklistItem()
  const deleteChecklistItem = useDeleteChecklistItem()

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [newChecklistTitle, setNewChecklistTitle] = useState('')

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title)
      setNotes(currentTask.notes || '')
    }
  }, [currentTask?.id, currentTask?.title, currentTask?.notes])

  if (!currentTask) {
    return null
  }

  const handleTitleBlur = () => {
    if (title.trim() && title !== currentTask.title) {
      updateTask.mutate({ id: currentTask.id, updates: { title: title.trim() } })
    }
  }

  const handleNotesBlur = () => {
    if (notes !== (currentTask.notes || '')) {
      updateTask.mutate({ id: currentTask.id, updates: { notes: notes || null } })
    }
  }

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChecklistTitle.trim()) return
    createChecklistItem.mutate({
      taskId: currentTask.id,
      title: newChecklistTitle.trim(),
    })
    setNewChecklistTitle('')
  }

  const handleDeleteTask = () => {
    deleteTask.mutate(currentTask.id)
    setSelectedTaskId(null)
  }

  return (
    <Sheet open={Boolean(selectedTaskId)} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
      {/* Header */}
      <SheetHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Checkbox
            circular
            checked={currentTask.status === 'done'}
            onCheckedChange={(checked) => {
              updateTask.mutate({
                id: currentTask.id,
                updates: {
                  status: checked ? 'done' : 'todo',
                  completed_at: checked ? new Date().toISOString() : null,
                },
              })
            }}
          />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {STATUS_LABELS[currentTask.status]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDeleteTask}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Excluir tarefa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <SheetClose onClose={() => setSelectedTaskId(null)} />
        </div>
      </SheetHeader>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Título da tarefa"
            className="w-full text-lg font-semibold bg-transparent border-none text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-muted/40 border border-border/60 text-xs">
          {/* Status */}
          <div>
            <label className="text-muted-foreground font-medium block mb-1">Status</label>
            <select
              value={currentTask.status}
              onChange={(e) =>
                updateTask.mutate({
                  id: currentTask.id,
                  updates: {
                    status: e.target.value as TaskStatus,
                    completed_at: e.target.value === 'done' ? new Date().toISOString() : null,
                  },
                })
              }
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-muted-foreground font-medium block mb-1">Prioridade</label>
            <select
              value={currentTask.priority}
              onChange={(e) =>
                updateTask.mutate({
                  id: currentTask.id,
                  updates: { priority: e.target.value as TaskPriority },
                })
              }
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((pr) => (
                <option key={pr} value={pr}>
                  {PRIORITY_LABELS[pr]}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-muted-foreground font-medium block mb-1">Data de Entrega</label>
            <input
              type="date"
              value={currentTask.due_date || ''}
              onChange={(e) =>
                updateTask.mutate({
                  id: currentTask.id,
                  updates: { due_date: e.target.value || null },
                })
              }
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="text-muted-foreground font-medium block mb-1">Data de Início</label>
            <input
              type="date"
              value={currentTask.start_date || ''}
              onChange={(e) =>
                updateTask.mutate({
                  id: currentTask.id,
                  updates: { start_date: e.target.value || null },
                })
              }
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            />
          </div>
        </div>

        {/* Tríade do Tempo & Eisenhower Toggles */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Classificação Estratégica (Tríade & Eisenhower)
          </div>

          {/* Time Sphere Selector */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Esfera do Tempo:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['importante', 'urgente', 'circunstancial'] as TimeSphere[]).map((sphere) => (
                <button
                  key={sphere}
                  type="button"
                  onClick={() =>
                    updateTask.mutate({
                      id: currentTask.id,
                      updates: {
                        time_sphere: currentTask.time_sphere === sphere ? null : sphere,
                      },
                    })
                  }
                  className={cn(
                    'px-2 py-1.5 rounded-md text-xs font-medium border text-center transition-all cursor-pointer',
                    currentTask.time_sphere === sphere
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border/60 hover:bg-accent text-foreground'
                  )}
                >
                  {SPHERE_LABELS[sphere]}
                </button>
              ))}
            </div>
            {currentTask.time_sphere && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {SPHERE_DESCRIPTIONS[currentTask.time_sphere]}
              </p>
            )}
          </div>

          {/* Eisenhower Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() =>
                updateTask.mutate({
                  id: currentTask.id,
                  updates: { is_important: !currentTask.is_important },
                })
              }
              className={cn(
                'flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors',
                currentTask.is_important
                  ? 'border-primary/60 bg-primary/10 text-primary font-medium'
                  : 'border-border/60 text-muted-foreground hover:bg-accent'
              )}
            >
              <span>É Importante</span>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  currentTask.is_important ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                updateTask.mutate({
                  id: currentTask.id,
                  updates: { is_urgent: !currentTask.is_urgent },
                })
              }
              className={cn(
                'flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors',
                currentTask.is_urgent
                  ? 'border-destructive/60 bg-destructive/10 text-destructive font-medium'
                  : 'border-border/60 text-muted-foreground hover:bg-accent'
              )}
            >
              <span>É Urgente</span>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  currentTask.is_urgent ? 'bg-destructive' : 'bg-muted-foreground/30'
                )}
              />
            </button>
          </div>
        </div>

        {/* Notes (textarea) */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Anotações / Descrição
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Adicione detalhes, contexto ou links para esta tarefa..."
            rows={4}
            className="w-full text-sm rounded-lg border border-input bg-card p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
          />
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Checklist ({checklist.filter((i) => i.is_done).length}/{checklist.length})
            </label>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-2 p-2 rounded-md border border-border/60 bg-card hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Checkbox
                    checked={item.is_done}
                    onCheckedChange={(checked) =>
                      updateChecklistItem.mutate({
                        taskId: currentTask.id,
                        itemId: item.id,
                        updates: { is_done: checked },
                      })
                    }
                  />
                  <input
                    type="text"
                    defaultValue={item.title}
                    onBlur={(e) => {
                      if (e.target.value !== item.title) {
                        updateChecklistItem.mutate({
                          taskId: currentTask.id,
                          itemId: item.id,
                          updates: { title: e.target.value },
                        })
                      }
                    }}
                    className={cn(
                      'text-xs bg-transparent border-none focus:outline-none w-full text-foreground',
                      item.is_done && 'line-through text-muted-foreground'
                    )}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    deleteChecklistItem.mutate({
                      taskId: currentTask.id,
                      itemId: item.id,
                    })
                  }
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <form onSubmit={handleAddChecklist} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Adicionar item ao checklist..."
                className="flex-1 text-xs rounded-md border border-input bg-card px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!newChecklistTitle.trim()}
                className="p-1.5 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Sheet>
  )
}

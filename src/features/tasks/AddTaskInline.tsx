import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useCreateTask } from './queries'
import { TaskPriorityPopover } from './TaskPriorityPopover'
import { TaskDatePopover } from './TaskDatePopover'
import type { TaskPriority, TaskStatus, TimeSphere } from '@/integrations/supabase/types'

interface AddTaskInlineProps {
  defaultStatus?: TaskStatus
  defaultDate?: string | null
  defaultSphere?: TimeSphere | null
  placeholder?: string
}

export function AddTaskInline({
  defaultStatus = 'inbox',
  defaultDate = null,
  defaultSphere = null,
  placeholder = 'Adicionar nova tarefa... (Pressione Enter para salvar)',
}: AddTaskInlineProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('none')
  const [dueDate, setDueDate] = useState<string | null>(defaultDate)
  const inputRef = useRef<HTMLInputElement>(null)
  const createTask = useCreateTask()

  // Global shortcut 'N' opens the inline input if not inside another input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    createTask.mutate({
      title: trimmed,
      status: defaultStatus,
      priority,
      due_date: dueDate,
      time_sphere: defaultSphere,
    })

    setTitle('')
    setPriority('none')
    setDueDate(defaultDate)
    inputRef.current?.focus()
  }

  return (
    <div className="w-full">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-lg border border-dashed border-border/80 transition-colors text-left cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{placeholder}</span>
          <span className="ml-auto text-xs text-muted-foreground/60 font-mono">Pressione N</span>
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-3 rounded-lg border border-primary/40 bg-card shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que você precisa fazer?"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false)
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              <TaskPriorityPopover value={priority} onChange={setPriority} size="sm" />
              <TaskDatePopover value={dueDate} onChange={setDueDate} />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim() || createTask.isPending}
                className="px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
              >
                Adicionar
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

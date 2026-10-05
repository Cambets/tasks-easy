import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants'
import type { TaskPriority } from '@/integrations/supabase/types'
import { cn } from '@/lib/utils'

interface TaskPriorityPopoverProps {
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
  size?: 'sm' | 'default'
}

const priorities: TaskPriority[] = ['none', 'low', 'medium', 'high', 'urgent']

export function TaskPriorityPopover({ value, onChange, size = 'sm' }: TaskPriorityPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground border border-border/40',
          size === 'sm' ? 'h-6 text-xs' : 'h-8 text-sm'
        )}
      >
        <span
          className="priority-dot"
          style={{ backgroundColor: PRIORITY_COLORS[value] }}
        />
        <span>{PRIORITY_LABELS[value]}</span>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {priorities.map((prio) => (
            <button
              key={prio}
              type="button"
              onClick={() => {
                onChange(prio)
                setOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-xs text-left transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
                value === prio && 'bg-accent/60 font-semibold'
              )}
            >
              <span
                className="priority-dot"
                style={{ backgroundColor: PRIORITY_COLORS[prio] }}
              />
              <span>{PRIORITY_LABELS[prio]}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

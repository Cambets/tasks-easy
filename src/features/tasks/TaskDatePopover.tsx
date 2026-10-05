import { useState } from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatDate, isOverdue, cn } from '@/lib/utils'

interface TaskDatePopoverProps {
  value: string | null | undefined
  onChange: (date: string | null) => void
  isDone?: boolean
  label?: string
}

export function TaskDatePopover({ value, onChange, isDone = false, label = 'Data' }: TaskDatePopoverProps) {
  const [open, setOpen] = useState(false)
  const overdue = isOverdue(value, isDone)

  const handleQuickSet = (daysFromToday: number) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromToday)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    onChange(`${yyyy}-${mm}-${dd}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors border cursor-pointer',
          value
            ? overdue
              ? 'bg-[var(--overdue-bg)] text-[var(--overdue-fg)] border-[var(--overdue-fg)]/30'
              : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
            : 'text-muted-foreground border-border/40 hover:text-foreground hover:bg-accent'
        )}
      >
        <CalendarIcon className="h-3 w-3" />
        <span>{value ? formatDate(value) : label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Definir data:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <button
              type="button"
              onClick={() => handleQuickSet(0)}
              className="px-2 py-1.5 rounded-sm bg-accent/40 hover:bg-accent text-left cursor-pointer"
            >
              📅 Hoje
            </button>
            <button
              type="button"
              onClick={() => handleQuickSet(1)}
              className="px-2 py-1.5 rounded-sm bg-accent/40 hover:bg-accent text-left cursor-pointer"
            >
              ☀️ Amanhã
            </button>
            <button
              type="button"
              onClick={() => handleQuickSet(7)}
              className="px-2 py-1.5 rounded-sm bg-accent/40 hover:bg-accent text-left cursor-pointer"
            >
              🗓️ Em 1 semana
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className="px-2 py-1.5 rounded-sm text-destructive hover:bg-destructive/10 text-left flex items-center gap-1 cursor-pointer"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          </div>
          <div className="pt-2 border-t border-border">
            <label className="text-[11px] text-muted-foreground block mb-1">Selecionar no calendário:</label>
            <input
              type="date"
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value || null)
                setOpen(false)
              }}
              className="w-full text-xs rounded-md border border-input bg-transparent px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

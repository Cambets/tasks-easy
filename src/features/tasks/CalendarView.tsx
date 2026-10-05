import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTasks, useCreateTask } from './queries'
import { useUIStore } from '@/stores/ui'
import { PRIORITY_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: tasks = [] } = useTasks()
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId)
  const createTask = useCreateTask()

  const [activeDayInput, setActiveDayInput] = useState<string | null>(null)
  const [dayTaskTitle, setDayTaskTitle] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleCreateOnDay = (dateStr: string) => {
    if (!dayTaskTitle.trim()) return
    createTask.mutate({
      title: dayTaskTitle.trim(),
      due_date: dateStr,
      status: 'todo',
    })
    setDayTaskTitle('')
    setActiveDayInput(null)
  }

  const todayStr = new Date().toISOString().split('T')[0]

  // Calendar cells
  const cells = []
  // Padding cells before the 1st
  for (let i = 0; i < startingDayOfWeek; i++) {
    cells.push({ dayNumber: null, dateStr: null })
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    cells.push({ dayNumber: d, dateStr: `${year}-${mm}-${dd}` })
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground capitalize">
            {monthNames[month]} {year}
          </h2>
          <button
            type="button"
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-card hover:bg-accent text-foreground transition-colors cursor-pointer"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-accent text-foreground transition-colors cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-accent text-foreground transition-colors cursor-pointer"
            title="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((wd) => (
          <div key={wd} className="text-xs font-semibold text-muted-foreground py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.dayNumber || !cell.dateStr) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[110px] rounded-lg border border-border/30 bg-muted/10 p-1.5"
              />
            )
          }

          const dayTasks = tasks.filter((t) => t.due_date === cell.dateStr)
          const isCurrentDay = cell.dateStr === todayStr

          return (
            <div
              key={cell.dateStr}
              onClick={() => setActiveDayInput(cell.dateStr)}
              className={cn(
                'group relative min-h-[110px] rounded-lg border border-border/60 bg-card p-1.5 flex flex-col justify-between transition-colors hover:border-primary/50 cursor-pointer shadow-xs',
                isCurrentDay && 'border-primary bg-primary/5'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs font-semibold px-1.5 py-0.5 rounded-full',
                      isCurrentDay
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground'
                    )}
                  >
                    {cell.dayNumber}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDayInput(cell.dateStr)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer transition-opacity"
                    title="Adicionar tarefa neste dia"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Day tasks chips */}
                <div className="space-y-1 overflow-y-auto max-h-[75px]">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTaskId(task.id)
                      }}
                      className={cn(
                        'flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border border-border/40 hover:bg-accent truncate transition-colors cursor-pointer',
                        task.status === 'done' && 'line-through opacity-50 bg-muted/40'
                      )}
                    >
                      <span
                        className="priority-dot"
                        style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                      />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day input modal/inline popover */}
              {activeDayInput === cell.dateStr && (
                <div
                  className="mt-1 p-1 bg-card rounded border border-primary/50 shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    autoFocus
                    value={dayTaskTitle}
                    onChange={(e) => setDayTaskTitle(e.target.value)}
                    placeholder="Nova tarefa..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateOnDay(cell.dateStr!)
                      if (e.key === 'Escape') setActiveDayInput(null)
                    }}
                    className="w-full text-[11px] bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="flex justify-end gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setActiveDayInput(null)}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-1"
                    >
                      ✕
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateOnDay(cell.dateStr!)}
                      className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

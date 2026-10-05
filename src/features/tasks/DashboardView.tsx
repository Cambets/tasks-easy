import { useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Layers,
} from 'lucide-react'
import { useTasks } from './queries'
import { isOverdue, isToday } from '@/lib/utils'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export function DashboardView() {
  const { data: tasks = [] } = useTasks()

  const stats = useMemo(() => {
    const total = tasks.length
    const doneTasks = tasks.filter((t) => t.status === 'done')
    const completedToday = doneTasks.filter((t) => {
      if (!t.completed_at) return false
      const compDate = t.completed_at.split('T')[0]
      const today = new Date().toISOString().split('T')[0]
      return compDate === today
    }).length

    const overdue = tasks.filter((t) => isOverdue(t.due_date, t.status === 'done')).length

    // Weekly completion rate: tasks completed in last 7 days vs tasks created/due
    const oneWeekAgo = Date.now() - 7 * 86400000
    const completedLast7Days = doneTasks.filter((t) => {
      if (!t.completed_at) return false
      return new Date(t.completed_at).getTime() >= oneWeekAgo
    }).length

    const weeklyRate = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0

    return {
      total,
      completedToday,
      overdue,
      weeklyRate,
      completedLast7Days,
    }
  }, [tasks])

  // Data for last 7 days chart
  const chartData = useMemo(() => {
    const days = []
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = weekDays[d.getDay()]

      const count = tasks.filter((t) => {
        if (t.status !== 'done' || !t.completed_at) return false
        return t.completed_at.split('T')[0] === dateStr
      }).length

      days.push({
        date: dateStr,
        day: dayLabel,
        concluidas: count,
      })
    }
    return days
  }, [tasks])

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de Tarefas
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Todas as cadastradas</p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Completed Today */}
        <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Concluídas Hoje
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.completedToday}</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Foco mantido</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Atrasadas
            </p>
            <h3 className="text-2xl font-bold text-destructive mt-1">{stats.overdue}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Necessitam atenção</p>
          </div>
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Weekly Completion Rate */}
        <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Taxa Geral
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.weeklyRate}%</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Eficiência global</p>
          </div>
          <div className="p-2.5 rounded-lg bg-accent text-accent-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-5 rounded-xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Conclusões nos Últimos 7 Dias</h3>
            <p className="text-xs text-muted-foreground">Produtividade diária acumulada</p>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {stats.completedLast7Days} tarefas concluídas
          </span>
        </div>

        <div className="h-[260px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="day" stroke="currentColor" opacity={0.6} fontSize={12} tickLine={false} />
              <YAxis stroke="currentColor" opacity={0.6} fontSize={12} allowDecimals={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  color: 'var(--popover-foreground)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="concluidas" name="Tarefas Concluídas" fill="oklch(0.45 0.16 260)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

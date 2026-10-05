import type { TaskPriority, TaskStatus, TimeSphere } from '@/integrations/supabase/types'

export const APP_NAME = 'Central de Tarefas IA'
export const APP_SHORT_NAME = 'Central de Tarefas'

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: 'Sem prioridade',
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  inbox: 'Caixa de entrada',
  todo: 'A fazer',
  in_progress: 'Em andamento',
  done: 'Concluído',
}

export const SPHERE_LABELS: Record<TimeSphere, string> = {
  importante: 'Importante',
  urgente: 'Urgente',
  circunstancial: 'Circunstancial',
}

export const SPHERE_DESCRIPTIONS: Record<TimeSphere, string> = {
  importante: 'Ligado às suas metas, crescimento pessoal e resultados de longo prazo.',
  urgente: 'Prazo estourando, crises, emergências que demandam ação imediata.',
  circunstancial: 'Ruído, distrações, tarefas sem valor agregado ou exigências de terceiros.',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  none: 'var(--prio-none)',
  low: 'var(--prio-low)',
  medium: 'var(--prio-medium)',
  high: 'var(--prio-high)',
  urgent: 'var(--prio-urgent)',
}

export const SPHERE_COLORS: Record<TimeSphere, string> = {
  importante: 'var(--sphere-importante)',
  urgente: 'var(--sphere-urgente)',
  circunstancial: 'var(--sphere-circunstancial)',
}

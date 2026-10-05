import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const [year, month, day] = dateString.split('-')
    if (year && month && day) {
      return `${day}/${month}/${year}`
    }
    const d = new Date(dateString)
    return d.toLocaleDateString('pt-BR')
  } catch {
    return dateString
  }
}

export function isOverdue(dateString: string | null | undefined, isDone: boolean): boolean {
  if (!dateString || isDone) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = dateString.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return dateString === todayStr
}

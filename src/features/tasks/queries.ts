import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type {
  ChecklistItem,
  ChecklistItemInsert,
  ChecklistItemUpdate,
  Task,
  TaskInsert,
  TaskUpdate,
} from '@/integrations/supabase/types'
import { toast } from 'sonner'
import { notifyTabs } from '@/lib/syncChannel'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  checklist: (taskId: string) => ['checklist', taskId] as const,
}

// In-memory demo store fallback when Supabase is not yet configured with real API keys
const LOCAL_STORAGE_TASKS_KEY = 'cta:demo-tasks'
const LOCAL_STORAGE_CHECKLIST_KEY = 'cta:demo-checklist'

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // ignore
    }
  }
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const initial: Task[] = [
    {
      id: 'demo-1',
      user_id: 'local-user',
      title: 'Bem-vindo(a) ao Central de Tarefas IA 👋',
      notes: 'Explore todas as funcionalidades e atalhos de teclado (pressione N para criar uma tarefa e / para buscar).',
      status: 'todo',
      priority: 'high',
      start_date: today,
      due_date: today,
      completed_at: null,
      is_important: true,
      is_urgent: false,
      time_sphere: 'importante',
      parent_task_id: null,
      position: 1000,
      is_focus_today: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      user_id: 'local-user',
      title: 'Planejar o dia de amanhã',
      notes: 'Defina as 3 prioridades essenciais para começar o dia com clareza.',
      status: 'todo',
      priority: 'high',
      start_date: tomorrow,
      due_date: tomorrow,
      completed_at: null,
      is_important: true,
      is_urgent: false,
      time_sphere: 'importante',
      parent_task_id: null,
      position: 2000,
      is_focus_today: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      user_id: 'local-user',
      title: 'Ler artigo sobre produtividade',
      notes: 'Aprofundar nos conceitos da Tríade do Tempo e Matriz de Eisenhower.',
      status: 'inbox',
      priority: 'low',
      start_date: null,
      due_date: null,
      completed_at: null,
      is_important: false,
      is_urgent: false,
      time_sphere: 'circunstancial',
      parent_task_id: null,
      position: 3000,
      is_focus_today: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
  localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(initial))
  return initial
}

function saveLocalTasks(tasks: Task[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks))
  }
}

function getLocalChecklist(taskId: string): ChecklistItem[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(`${LOCAL_STORAGE_CHECKLIST_KEY}:${taskId}`)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // ignore
    }
  }
  if (taskId === 'demo-1') {
    const initial: ChecklistItem[] = [
      {
        id: 'cl-1',
        task_id: 'demo-1',
        user_id: 'local-user',
        title: 'Explorar as visualizações (Kanban, Calendário, Tríade do Tempo)',
        is_done: false,
        position: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cl-2',
        task_id: 'demo-1',
        user_id: 'local-user',
        title: 'Pressionar atalho "N" para criar sua primeira tarefa',
        is_done: false,
        position: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'cl-3',
        task_id: 'demo-1',
        user_id: 'local-user',
        title: 'Classificar tarefas por Esfera do Tempo (Importante, Urgente, Circunstancial)',
        is_done: false,
        position: 3,
        created_at: new Date().toISOString(),
      },
    ]
    localStorage.setItem(`${LOCAL_STORAGE_CHECKLIST_KEY}:${taskId}`, JSON.stringify(initial))
    return initial
  }
  return []
}

function saveLocalChecklist(taskId: string, items: ChecklistItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_CHECKLIST_KEY}:${taskId}`, JSON.stringify(items))
  }
}

export async function fetchTasks(): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return getLocalTasks()
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching tasks from Supabase:', error.message)
    return getLocalTasks()
  }

  // If newly registered user has no tasks yet, return local seed tasks or empty
  if (!data || data.length === 0) {
    return getLocalTasks()
  }

  return data as Task[]
}

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: fetchTasks,
  })
}

export async function fetchChecklist(taskId: string): Promise<ChecklistItem[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return getLocalChecklist(taskId)
  }

  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('task_id', taskId)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching checklist from Supabase:', error.message)
    return getLocalChecklist(taskId)
  }

  return (data || []) as ChecklistItem[]
}

export function useChecklist(taskId: string | null | undefined) {
  return useQuery({
    queryKey: taskId ? taskKeys.checklist(taskId) : ['checklist', 'none'],
    queryFn: () => (taskId ? fetchChecklist(taskId) : Promise.resolve([])),
    enabled: Boolean(taskId),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Partial<TaskInsert> & { title: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()
      const newTask: Task = {
        id: crypto.randomUUID(),
        user_id: user?.id || 'local-user',
        title: input.title,
        notes: input.notes || null,
        status: input.status || 'inbox',
        priority: input.priority || 'none',
        start_date: input.start_date || null,
        due_date: input.due_date || null,
        completed_at: null,
        is_important: input.is_important ?? false,
        is_urgent: input.is_urgent ?? false,
        time_sphere: input.time_sphere || null,
        parent_task_id: input.parent_task_id || null,
        position: input.position ?? Date.now(),
        is_focus_today: input.is_focus_today ?? false,
        created_at: now,
        updated_at: now,
      }

      if (user) {
        const { data, error } = await (supabase.from('tasks') as any).insert([newTask]).select().single()
        if (error) {
          console.warn('Fallback to local storage on Supabase insert error:', error.message)
        } else if (data) {
          return data as Task
        }
      }

      // Local fallback
      const current = getLocalTasks()
      const updated = [newTask, ...current]
      saveLocalTasks(updated)
      return newTask
    },
    onMutate: async (newTaskInput) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)

      const optimisticTask: Task = {
        id: 'temp-' + Date.now(),
        user_id: 'temp',
        title: newTaskInput.title,
        notes: newTaskInput.notes || null,
        status: newTaskInput.status || 'inbox',
        priority: newTaskInput.priority || 'none',
        start_date: newTaskInput.start_date || null,
        due_date: newTaskInput.due_date || null,
        completed_at: null,
        is_important: newTaskInput.is_important ?? false,
        is_urgent: newTaskInput.is_urgent ?? false,
        time_sphere: newTaskInput.time_sphere || null,
        parent_task_id: newTaskInput.parent_task_id || null,
        position: newTaskInput.position ?? Date.now(),
        is_focus_today: newTaskInput.is_focus_today ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(taskKeys.all, [optimisticTask, ...previousTasks])
      }

      return { previousTasks }
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
      toast.error('Erro ao criar tarefa: ' + (err as Error).message)
    },
    onSuccess: () => {
      toast.success('Tarefa criada com sucesso!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      notifyTabs('tasks_changed')
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaskUpdate> }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const now = new Date().toISOString()
      const fullUpdates = { ...updates, updated_at: now }

      if (user) {
        const { data, error } = await (supabase.from('tasks') as any)
          .update(fullUpdates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.warn('Fallback to local storage on Supabase update error:', error.message)
        } else if (data) {
          return data as Task
        }
      }

      // Local fallback
      const current = getLocalTasks()
      const updated = current.map((t) => (t.id === id ? { ...t, ...fullUpdates } : t))
      saveLocalTasks(updated)
      const found = updated.find((t) => t.id === id)
      if (!found) throw new Error('Tarefa não encontrada')
      return found
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.all,
          previousTasks.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
        )
      }

      return { previousTasks }
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
      toast.error('Erro ao atualizar tarefa: ' + (err as Error).message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      notifyTabs('tasks_changed')
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (error) {
          console.warn('Fallback to local storage on Supabase delete error:', error.message)
        }
      }

      // Local fallback
      const current = getLocalTasks()
      const updated = current.filter((t) => t.id !== id && t.parent_task_id !== id)
      saveLocalTasks(updated)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.all,
          previousTasks.filter((t) => t.id !== id && t.parent_task_id !== id)
        )
      }

      return { previousTasks }
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
      toast.error('Erro ao excluir tarefa: ' + (err as Error).message)
    },
    onSuccess: () => {
      toast.success('Tarefa excluída com sucesso!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      notifyTabs('tasks_changed')
    },
  })
}

export function useToggleComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: Task['status'] }) => {
      const isDone = currentStatus === 'done'
      const newStatus = isDone ? 'todo' : 'done'
      const completed_at = isDone ? null : new Date().toISOString()
      const updates = { status: newStatus as Task['status'], completed_at }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await (supabase.from('tasks') as any)
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.warn('Fallback to local storage on Supabase update error:', error.message)
        } else if (data) {
          return data as Task
        }
      }

      // Local fallback
      const current = getLocalTasks()
      const updated = current.map((t) => (t.id === id ? { ...t, ...updates } : t))
      saveLocalTasks(updated)
      const found = updated.find((t) => t.id === id)
      if (!found) throw new Error('Tarefa não encontrada')
      return found
    },
    onMutate: async ({ id, currentStatus }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)

      const isDone = currentStatus === 'done'
      const newStatus = isDone ? 'todo' : 'done'
      const completed_at = isDone ? null : new Date().toISOString()

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.all,
          previousTasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: newStatus as Task['status'],
                  completed_at,
                  updated_at: new Date().toISOString(),
                }
              : t
          )
        )
      }

      return { previousTasks }
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
      toast.error('Erro ao atualizar tarefa: ' + (err as Error).message)
    },
    onSuccess: (data) => {
      if (data.status === 'done') {
        toast.success('Tarefa concluída! Parabéns 🎉')
      } else {
        toast.info('Tarefa reaberta.')
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      notifyTabs('tasks_changed')
    },
  })
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        task_id: taskId,
        user_id: user?.id || 'local-user',
        title,
        is_done: false,
        position: Date.now(),
        created_at: new Date().toISOString(),
      }

      if (user) {
        const { data, error } = await (supabase.from('checklist_items') as any).insert([newItem]).select().single()
        if (error) {
          console.warn('Fallback to local storage on checklist insert error:', error.message)
        } else if (data) {
          return data as ChecklistItem
        }
      }

      const current = getLocalChecklist(taskId)
      const updated = [...current, newItem]
      saveLocalChecklist(taskId, updated)
      return newItem
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.checklist(variables.taskId) })
      notifyTabs('checklist_changed')
    },
  })
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      itemId,
      updates,
    }: {
      taskId: string
      itemId: string
      updates: Partial<ChecklistItemUpdate>
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await (supabase.from('checklist_items') as any)
          .update(updates)
          .eq('id', itemId)
          .select()
          .single()

        if (error) {
          console.warn('Fallback to local storage on checklist update error:', error.message)
        } else if (data) {
          return data as ChecklistItem
        }
      }

      const current = getLocalChecklist(taskId)
      const updated = current.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
      saveLocalChecklist(taskId, updated)
      const found = updated.find((i) => i.id === itemId)
      if (!found) throw new Error('Item não encontrado')
      return found
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.checklist(variables.taskId) })
      notifyTabs('checklist_changed')
    },
  })
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, itemId }: { taskId: string; itemId: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from('checklist_items').delete().eq('id', itemId)
        if (error) {
          console.warn('Fallback to local storage on checklist delete error:', error.message)
        }
      }

      const current = getLocalChecklist(taskId)
      const updated = current.filter((i) => i.id !== itemId)
      saveLocalChecklist(taskId, updated)
      return itemId
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.checklist(variables.taskId) })
      notifyTabs('checklist_changed')
    },
  })
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type TimeSphere = 'importante' | 'urgente' | 'circunstancial'

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          notes: string | null
          status: TaskStatus
          priority: TaskPriority
          start_date: string | null
          due_date: string | null
          completed_at: string | null
          is_important: boolean
          is_urgent: boolean
          time_sphere: TimeSphere | null
          parent_task_id: string | null
          position: number
          is_focus_today: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          notes?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          start_date?: string | null
          due_date?: string | null
          completed_at?: string | null
          is_important?: boolean
          is_urgent?: boolean
          time_sphere?: TimeSphere | null
          parent_task_id?: string | null
          position?: number
          is_focus_today?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          notes?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          start_date?: string | null
          due_date?: string | null
          completed_at?: string | null
          is_important?: boolean
          is_urgent?: boolean
          time_sphere?: TimeSphere | null
          parent_task_id?: string | null
          position?: number
          is_focus_today?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          task_id: string
          user_id: string
          title: string
          is_done: boolean
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          title: string
          is_done?: boolean
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          title?: string
          is_done?: boolean
          position?: number
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      task_tags: {
        Row: {
          task_id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          task_id: string
          tag_id: string
          user_id: string
        }
        Update: {
          task_id?: string
          tag_id?: string
          user_id?: string
        }
      }
      attachments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_status: TaskStatus
      task_priority: TaskPriority
      time_sphere: TimeSphere
    }
  }
}

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row']
export type ChecklistItemInsert = Database['public']['Tables']['checklist_items']['Insert']
export type ChecklistItemUpdate = Database['public']['Tables']['checklist_items']['Update']

export type Tag = Database['public']['Tables']['tags']['Row']

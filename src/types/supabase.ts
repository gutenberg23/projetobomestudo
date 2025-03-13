export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_course_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          subjects_data: Json
          performance_goal: number
          exam_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          subjects_data?: Json
          performance_goal?: number
          exam_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          subjects_data?: Json
          performance_goal?: number
          exam_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

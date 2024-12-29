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
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
          // Lisa siia vajalikud väljad
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          // Lisa siia vajalikud väljad
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          // Lisa siia vajalikud väljad
        }
      }
      // Lisa siia teised tabelid
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}



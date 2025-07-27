export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      habit_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completion_percentage: number | null
          current_count: number | null
          done: boolean
          habit_id: string
          id: string
          log_date: string
          notes: string | null
        }
        Insert: {
          completion_percentage?: number | null
          current_count?: number | null
          done?: boolean
          habit_id: string
          id?: string
          log_date: string
          notes?: string | null
        }
        Update: {
          completion_percentage?: number | null
          current_count?: number | null
          done?: boolean
          habit_id?: string
          id?: string
          log_date?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habit_statistics"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "todays_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_notifications: {
        Row: {
          created_at: string | null
          habit_id: string
          id: string
          is_active: boolean | null
          max_notification_per_day: number | null
          notification_interval_hours: number | null
          notification_message: string | null
          notification_time: string
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          habit_id: string
          id?: string
          is_active?: boolean | null
          max_notification_per_day?: number | null
          notification_interval_hours?: number | null
          notification_message?: string | null
          notification_time: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          habit_id?: string
          id?: string
          is_active?: boolean | null
          max_notification_per_day?: number | null
          notification_interval_hours?: number | null
          notification_message?: string | null
          notification_time?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_notifications_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habit_statistics"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_notifications_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_notifications_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "todays_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          habit_id: string
          id: string
          last_completed_date: string | null
          longest_streak: number | null
          streak_start_date: string | null
          total_completions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          habit_id: string
          id?: string
          last_completed_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          total_completions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          habit_id?: string
          id?: string
          last_completed_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          total_completions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_streaks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: true
            referencedRelation: "habit_statistics"
            referencedColumns: ["habit_id"]
          },
          {
            foreignKeyName: "habit_streaks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: true
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_streaks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: true
            referencedRelation: "todays_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_templates: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          frequency_days: Json | null
          frequency_interval_days: number | null
          frequency_type: string | null
          habit_type: string | null
          id: string
          is_public: boolean | null
          name: string
          target_count: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          frequency_days?: Json | null
          frequency_interval_days?: number | null
          frequency_type?: string | null
          habit_type?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          target_count?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          frequency_days?: Json | null
          frequency_interval_days?: number | null
          frequency_type?: string | null
          habit_type?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          target_count?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "habit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category_id: string | null
          color: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          frequency_days: Json | null
          frequency_interval_days: number | null
          frequency_type: string | null
          habit_type: string | null
          id: string
          is_active: boolean | null
          name: string
          target_count: number | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          frequency_days?: Json | null
          frequency_interval_days?: number | null
          frequency_type?: string | null
          habit_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_count?: number | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          frequency_days?: Json | null
          frequency_interval_days?: number | null
          frequency_type?: string | null
          habit_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "habit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      memorable_moments: {
        Row: {
          created_at: string
          id: string
          moment_date: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moment_date: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moment_date?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          hours: number
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          hours: number
          id?: string
          log_date: string
          user_id: string
        }
        Update: {
          hours?: number
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          date_format: string | null
          email_notifications: boolean | null
          first_day_of_week: number | null
          id: string
          notification_enabled: boolean | null
          push_notifications: boolean | null
          queit_hours_end: string | null
          queit_hours_start: string | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_format?: string | null
          email_notifications?: boolean | null
          first_day_of_week?: number | null
          id?: string
          notification_enabled?: boolean | null
          push_notifications?: boolean | null
          queit_hours_end?: string | null
          queit_hours_start?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_format?: string | null
          email_notifications?: boolean | null
          first_day_of_week?: number | null
          id?: string
          notification_enabled?: boolean | null
          push_notifications?: boolean | null
          queit_hours_end?: string | null
          queit_hours_start?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      habit_statistics: {
        Row: {
          completed_logs: number | null
          completion_rate: number | null
          current_streak: number | null
          habit_id: string | null
          habit_type: string | null
          last_completed_date: string | null
          longest_streak: number | null
          name: string | null
          target_count: number | null
          total_logs: number | null
          user_id: string | null
        }
        Relationships: []
      }
      todays_habits: {
        Row: {
          category_color: string | null
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          color: string | null
          completed_today: boolean | null
          created_at: string | null
          current_streak: number | null
          description: string | null
          difficulty_level: string | null
          frequency_days: Json | null
          frequency_interval_days: number | null
          frequency_type: string | null
          habit_type: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          target_count: number | null
          today_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "habit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_completion_percentage: {
        Args: {
          p_current_count: number
          p_target_count: number
          p_habit_type: string
        }
        Returns: number
      }
      update_habit_streak: {
        Args: {
          p_habit_id: string
          p_user_id: string
          p_completion_date: string
          p_is_completed: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

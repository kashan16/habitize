export interface HabitCategoryDB {
    id : string;
    name : string;
    description : string | null;
    color : string;
    icon : string;
    is_system : boolean;
}

export interface HabitCategory {
    id : string;
    name : string;
    description ?: string;
    color : string;
    icon : string;
    is_system : boolean; 
}

export interface HabitDB {
    id : string;
    name : string;
    color : string | null;
    created_at : string;
    user_id : string;
    habit_type : 'boolean' | 'counter';
    target_count : number;
    frequency_type : 'daily' | 'weekly' | 'interval' | 'custom';
    frequency_days : number[];
    frequency_interval_days : number;
    description : string | null;
    is_active : boolean;
    difficulty_level : 'easy' | 'medium' | 'hard';
    category_id : string | null;
    habit_categories ?: HabitCategoryDB | null;
    habit_streak ?: HabitStreakDB[] | null;
}

export interface Habit {
    id : string;
    name : string;
    color : string;
    created_at : string;
    user_id : string;
    habit_type : 'boolean' | 'counter';
    target_count : number;
    frequency_type : 'daily' | 'weekly' | 'interval' | 'custom';
    frequency_days : number[];
    frequency_interval_days : number;
    description ?: string;
    is_active : boolean;
    difficulty_level : 'easy' | 'medium' | 'hard';
    category_id ?: string;
    category ?: HabitCategory;
}

export interface HabitLogDB {
    id : string;
    habit_id : string;
    log_date : string;
    done : boolean;
    current_count : number | null;
    notes : string | null;
    completion_percentage : number | null;
}

export interface HabitLog {
    id : string;
    habit_id : string;
    log_date : string;
    done : boolean;
    current_count : number;
    notes ?: string;
    completion_percentage : number;
}

export interface HabitStreakDB {
    id : string;
    habit_id : string;
    user_id : string;
    current_streak : number | null;
    longest_streak : number | null;
    last_completed_date : string | null;
    streak_start_date : string | null;
    total_completions : number | null; 
}

export interface HabitStreak {
    id : string;
    habit_id : string;
    user_id : string;
    current_streak : number;
    longest_streak : number;
    last_completed_date ?: string;
    streak_start_date ?: string;
    total_completions ?: number;     
}

export interface HabitWithLogs extends Habit {
    logs : HabitLog[];
    streak ?: HabitStreak;
}

export interface HabitNotification {
    id: string;
    habit_id: string;
    user_id: string;
    notification_time: string;
    timezone: string;
    is_active: boolean;
    notification_interval_hours: number;
    max_notifications_per_day: number;
    notification_message?: string;    
}

export interface UserPreferences {
    id: string;
    user_id: string;
    timezone: string;
    notification_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    theme: 'light' | 'dark' | 'auto';
    first_day_of_week: number;
    date_format: string;
}
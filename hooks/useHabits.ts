import { supabase } from "@/store/authStore";
import { Habit, HabitDB, HabitLog, HabitLogDB, HabitStreak, HabitStreakDB, HabitWithLogs } from "@/types/habit";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useAuth } from "./useAuth";
import useSWR from "swr";
import { toast } from "sonner";

const transformHabitFromDB = (habitDB: HabitDB): Habit => ({
  id: habitDB.id,
  name: habitDB.name,
  color: habitDB.color || '#3B82F6',
  created_at: habitDB.created_at,
  user_id: habitDB.user_id,
  habit_type: habitDB.habit_type,
  target_count: habitDB.target_count,
  frequency_type: habitDB.frequency_type,
  frequency_days: habitDB.frequency_days,
  frequency_interval_days: habitDB.frequency_interval_days,
  description: habitDB.description || undefined,
  is_active: habitDB.is_active,
  difficulty_level: habitDB.difficulty_level,
  category_id: habitDB.category_id || undefined,
  category: habitDB.habit_categories ? {
    id: habitDB.habit_categories.id,
    name: habitDB.habit_categories.name,
    description: habitDB.habit_categories.description || undefined,
    color: habitDB.habit_categories.color,
    icon: habitDB.habit_categories.icon,
    is_system: habitDB.habit_categories.is_system
  } : undefined
});

const transformHabitLogFromDB = (logDB: HabitLogDB): HabitLog => ({
  id: logDB.id,
  habit_id: logDB.habit_id,
  log_date: logDB.log_date,
  done: logDB.done,
  current_count: logDB.current_count ?? 0,
  notes: logDB.notes || undefined,
  completion_percentage: logDB.completion_percentage ?? 0
});

const transformHabitStreakFromDB = (streakDB: HabitStreakDB): HabitStreak => ({
  id: streakDB.id,
  habit_id: streakDB.habit_id,
  user_id: streakDB.user_id,
  current_streak: streakDB.current_streak ?? 0,
  longest_streak: streakDB.longest_streak ?? 0,
  last_completed_date: streakDB.last_completed_date || undefined,
  streak_start_date: streakDB.streak_start_date || undefined,
  total_completions: streakDB.total_completions ?? 0
});

const fetcher = async ([_key, month, userId]: [string, string, string]): Promise<HabitWithLogs[]> => {
  const startDate = format(startOfMonth(new Date(month)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date(month)), 'yyyy-MM-dd');

  // First, get all active habits for the user
  const { data: habitsDB, error: habitsError } = await supabase
    .from('habits')
    .select(`
      *,
      habit_categories(*),
      habit_streaks!left(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  if (habitsError) {
    console.error("Error fetching habits:", habitsError);
    throw habitsError;
  }

  if (!habitsDB || habitsDB.length === 0) {
    return [];
  }

  // Then, get logs for these habits within the date range
  const habitIds = habitsDB.map(h => h.id);
  const { data: logsDB, error: logsError } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitIds)
    .gte('log_date', startDate)
    .lte('log_date', endDate);

  if (logsError) {
    console.error("Error fetching habit logs:", logsError);
    throw logsError;
  }

  // Combine habits with their logs
  const habitsWithLogs = (habitsDB as any[]).map(habitDB => {
    const habit = transformHabitFromDB(habitDB);
    const logs = (logsDB || [])
      .filter(log => log.habit_id === habit.id)
      .map(transformHabitLogFromDB);
    
    const streak = habitDB.habit_streaks && habitDB.habit_streaks.length > 0 
      ? transformHabitStreakFromDB(habitDB.habit_streaks[0]) 
      : undefined;

    return {
      ...habit,
      logs,
      streak,
    };
  });

  return habitsWithLogs;
};

export function useHabits(month: string) {
  const { user } = useAuth();
  const { data, error, mutate } = useSWR(user ? ['habits', month, user.id] : null, fetcher);

  const toggleHabit = async (habitId: string, date: string, incrementValue = 1) => {
    if (!user) return toast.error("You must be logged in to update habits");
  
    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    const habit = data?.find(h => h.id === habitId);
    if (!habit) return toast.error("Habit not found");

    try {
      // Check if log already exists for this date
      const { data: existingLog, error: fetchError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('log_date', dateStr)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingLog) {
        // Update existing log
        let newCount: number;
        let isDone: boolean;

        if (habit.habit_type === 'boolean') {
          // For boolean habits, just toggle
          isDone = !existingLog.done;
          newCount = isDone ? 1 : 0;
        } else {
          // For counter habits, increment/decrement
          newCount = Math.max(0, (existingLog.current_count || 0) + incrementValue);
          isDone = newCount >= (habit.target_count || 1);
        }

        const completionPercentage = habit.habit_type === 'counter' 
          ? Math.min(100, Math.round((newCount / (habit.target_count || 1)) * 100))
          : isDone ? 100 : 0;

        const { error } = await supabase
          .from('habit_logs')
          .update({ 
            done: isDone,
            current_count: newCount,
            completion_percentage: completionPercentage
          })
          .eq('id', existingLog.id);

        if (error) throw error;
      } else {
        // Create new log
        let newCount: number;
        let isDone: boolean;

        if (habit.habit_type === 'boolean') {
          newCount = incrementValue > 0 ? 1 : 0;
          isDone = newCount > 0;
        } else {
          newCount = Math.max(0, incrementValue);
          isDone = newCount >= (habit.target_count || 1);
        }

        const completionPercentage = habit.habit_type === 'counter' 
          ? Math.min(100, Math.round((newCount / (habit.target_count || 1)) * 100))
          : isDone ? 100 : 0;

        const { error } = await supabase
          .from('habit_logs')
          .insert({ 
            habit_id: habitId, 
            log_date: dateStr, 
            done: isDone,
            current_count: newCount,
            completion_percentage: completionPercentage
          });

        if (error) throw error;
      }

      toast.success(`"${habit.name}" updated!`);
      await mutate();
    } catch (err: any) {
      console.error("Error toggling habit:", err);
      toast.error("Failed to update habit.");
    }
  };

  const createHabit = async (habitData: {
    name: string;
    color?: string
    habit_type?: 'boolean' | 'counter';
    target_count?: number;
    frequency_type?: 'daily' | 'weekly' | 'interval' | 'custom';
    frequency_days?: number[];
    frequency_interval_days?: number;
    description?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    category_id?: string;
  }) => {
    if (!user) return toast.error("You must be logged in to create a habit.");

    try {
      const { error } = await supabase.from('habits').insert({
        ...habitData,
        user_id: user.id,
        habit_type: habitData.habit_type || 'boolean',
        target_count: habitData.target_count || 1,
        frequency_type: habitData.frequency_type || 'daily',
        frequency_days: habitData.frequency_days || [0, 1, 2, 3, 4, 5, 6],
        frequency_interval_days: habitData.frequency_interval_days || 1,
        difficulty_level: habitData.difficulty_level || 'medium',
        is_active: true
      }); 
      if (error) throw error;
      toast.success(`Habit "${habitData.name}" created!`);
      await mutate();
    } catch (err: any) {
      console.error("Error creating habit:", err);
      toast.error("Failed to create habit.");
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return toast.error("You must be logged in.");

    try {
      const { error } = await supabase.from('habits').update(updates).eq('id', habitId);
      if (error) throw error;
      toast.success("Habit updated.");
      await mutate();
    } catch (err: any) {
      console.error("Error updating habit:", err);
      toast.error("Failed to update habit details.");
    }
  };

  const archiveHabit = async (habitId: string) => {
    if (!user) return toast.error("You must be logged in.");
    try {
      const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', habitId);
      if (error) throw error;
      toast.success("Habit archived.");
      await mutate();
    } catch (err: any) {
      console.error("Error archiving habit:", err);
      toast.error("Failed to archive habit.");
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return toast.error("You must be logged in.");
    try {
      const { error } = await supabase.from('habits').delete().eq('id', habitId).eq('user_id', user.id);
      if (error) throw error;
      toast.success("Habit deleted successfully");
      mutate();
    } catch (err: any) {
      console.error("Error deleting habit:", err);
      toast.error("Failed to delete habit.");
    }
  };

  const isHabitCompleted = (habitId: string, date: string): boolean => {
    const habit = data?.find(h => h.id === habitId);
    if (!habit) return false;

    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    const log = habit.logs.find(l => l.log_date === dateStr);
    return log?.done || false;
  }

  const getHabitProgress = (habitId: string, date: string) => {
    const habit = data?.find(h => h.id === habitId);
    if (!habit) {
      return {
        count: 0,
        target: 1,
        percentage: 0,
        done: false,
      };
    }

    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    const log = habit.logs.find(l => l.log_date === dateStr);

    if (!log) {
      return {
        count: 0,
        target: habit.target_count || 1,
        percentage: 0,
        done: false,
      };
    }

    return {
      count: log.current_count,
      target: habit.target_count || 1,
      percentage: log.completion_percentage,
      done: log.done,
    }
  }

  const getHabitStats = (habitId: string) => {
    const habit = data?.find(h => h.id === habitId);
    if (!habit) return {
      completed: 0,
      total: 0,
      percentage: 0
    };

    const completed = habit.logs.filter(log => log.done).length;
    const total = habit.logs.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { 
      completed,
      total,
      percentage
    };
  };

  return {
    habits: data || [],
    loading: !error && !data,
    error,
    toggleHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    isHabitCompleted,
    getHabitStats,
    getHabitProgress,
    archiveHabit,
    mutate
  };
}
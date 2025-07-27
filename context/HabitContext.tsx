"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useHabits } from "@/hooks/useHabits";
import { HabitWithLogs } from "@/types/habit";

interface HabitContextType {
  habits: HabitWithLogs[];
  loading: boolean;
  error: Error | null;
  currentMonth: Date;
  daysInMonth: Date[];
  setCurrentMonth: (date: Date) => void;
  toggleHabit: (habitId: string, date: string, increment?: number) => Promise<void>;
  createHabit: (habitData: { 
    name: string;
    color?: string;
    habit_type?: 'boolean' | 'counter';
    target_count?: number;
    frequency_type?: 'daily' | 'weekly' | 'interval' | 'custom';
    frequency_days?: number[];
    frequency_interval_days?: number;
    description?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    category_id?: string;
  }) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  getHabitProgress: (habitId: string, date: string) => { 
    count: number; 
    target: number; 
    percentage: number; 
    done: boolean; 
  };
  isHabitCompleted: (habitId: string, date: string) => boolean;
  getHabitStats: (habitId: string) => {
    completed: number;
    total: number;
    percentage: number;
  };
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    habits,
    loading,
    error,
    toggleHabit: originalToggleHabit,
    createHabit: originalCreateHabit,
    deleteHabit: originalDeleteHabit,
    archiveHabit : originalArchiveHabit,
    getHabitProgress,
    isHabitCompleted,
    getHabitStats,
  } = useHabits(format(currentMonth, 'yyyy-MM-01'));

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ 
      start: startOfMonth(currentMonth), 
      end: endOfMonth(currentMonth) 
    });
  }, [currentMonth]);

  const toggleHabit = async (habitId: string, date: string, increment?: number): Promise<void> => {
    await originalToggleHabit(habitId, date, increment);
  };

  const createHabit = async (habitData: { 
    name: string;
    color?: string;
    habit_type?: 'boolean' | 'counter';
    target_count?: number;
    frequency_type?: 'daily' | 'weekly' | 'interval' | 'custom';
    frequency_days?: number[];
    frequency_interval_days?: number;
    description?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    category_id?: string;
  }): Promise<void> => {
    await originalCreateHabit(habitData);
  };

  const archiveHabit = async (habitId: string) : Promise<void> => {
    await originalArchiveHabit(habitId);
  }

  const deleteHabit = async (habitId: string): Promise<void> => {
    await originalDeleteHabit(habitId);
  };

  const value = {
    habits,
    loading,
    error,
    currentMonth,
    daysInMonth,
    setCurrentMonth,
    toggleHabit,
    createHabit,
    deleteHabit,
    archiveHabit,
    getHabitProgress,
    isHabitCompleted,
    getHabitStats,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabitContext() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabitContext must be used within a HabitProvider");
  }
  return context;
}
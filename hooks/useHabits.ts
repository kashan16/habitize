import { supabase } from "@/lib/supabaseClient"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { useAuth } from "./useAuth";
import useSWR from "swr";

interface Habit {
    id : string;
    name : string;
    color : string | null;
    created_at : string;
    user_id : string;
}

interface HabitLog {
    id : string;
    habit_id : string;
    log_date : string;
    done : boolean;
}

interface HabitWithLogs extends Habit {
    logs : HabitLog[];
}

const fetcher = async ([_key , month , userId] : [string , string , string]) => {
    const startDate = format(startOfMonth(new Date(month)),'yyyy-MM-dd');
    const endDate = format(endOfMonth(new Date(month)),'yyyy-MM-dd');
    const { data , error } = await supabase.from('habits').select(`* , habit_logs!inner(id,habit_id,log_date,done)`).eq('user_id',userId).gte('habit_logs.log_date',startDate).lte('habit_logs.log_date',endDate);

    if(error) throw error;

    const { data : habitsOnly , error : habitsError } = await supabase.from('habits').select('*').eq('user_id',userId);
    
    if(habitsError) throw habitsError;

    const habitMap = new Map<string , HabitWithLogs>();

    habitsOnly.forEach(habit => {
        habitMap.set(habit.id , {
            ...habit,
            logs : []
        }); 
    });

    data?.forEach(habitWithLog => {
        const habit = habitMap.get(habitWithLog.id);
        if(habit && habitWithLog.habit_logs) {
            habit.logs = Array.isArray(habitWithLog.habit_logs) ? habitWithLog.habit_logs : [habitWithLog.habit_logs];
        }
    });

    return Array.from(habitMap.values());
}

export function useHabits(month : string) {
    const { user } = useAuth();

    const { data , error , mutate } = useSWR( user ? ['habits' , month , user.id] : null , fetcher);

    const toggleHabit = async (habitId : string , date : string) => {
        if(!user) throw new Error("User not authenticated");
        const dateStr = format(new Date(date),'yyyy-MM-dd');

        const { data : existingLog , error : fetchError } = await supabase.from('habit_logs').select('*').eq('habit_id',habitId).eq('log_date',dateStr).single();

        if(fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if(existingLog) {
            const { error } = await supabase.from('habit_logs').update({ done : !existingLog.done }).eq('id' , existingLog.id);
            if(error) throw error;
        } else {
            const { error } = await supabase.from('habit_logs').insert({ habit_id : habitId , log_date : dateStr , done : true });
            if(error) throw error;
        }
        await mutate();
    };

    const createHabit = async (habitData : { name : string ; color ?: string }) => {
        if(!user) throw new Error("User not authenticated");
        const { error } = await supabase.from('habits').insert({
            ...habitData,
            user_id : user.id
        });
        if(error) throw error;
        await mutate();
    };

    const updateHabit = async (habitId : string , updates : { name ?: string , color ?: string }) => {
        if(!user) throw new Error("User not authenticated");
        const { error } = await supabase.from('habits').update(updates).eq('id',habitId).eq('user_id',user.id);
        if(error) throw error;

        await mutate();
    };

    const deleteHabit = async (habitId : string) => {
        if(!user) throw new Error("User not authenticated");

        const { error : logsError } = await supabase.from('habit_logs').delete().eq('habit_id',habitId);
        if(logsError) throw logsError;

        const { error } = await supabase.from('habits').delete().eq('id',habitId).eq('user_id',user.id);

        if(error) throw error;
        await mutate();
    };

    const isHabitCompleted = (habitId : string , date : string) => {
        const habit = data?.find(h => h.id === habitId);
        if(!habit) return false;

        const dateStr = format(new Date(date),'yyyy-MM-dd');
        const log = habit.logs.find(l => l.log_date === dateStr);
        return log?.done || false;
    };

    const getHabitStats = (habitId : string) => {
        const habit = data?.find(h => h.id === habitId);
        if(!habit) return { completed : 0 , total : 0 , percentage : 0};
        const completed = habit.logs.filter(log => log.done).length;
        const total = habit.logs.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed , total , percentage };
    };

    return {
        habits : data || [],
        loading : !error && !data,
        error,
        toggleHabit,
        createHabit,
        updateHabit,
        deleteHabit,
        isHabitCompleted,
        getHabitStats,
        mutate
    };
}
import { Database } from "@/database.types";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { endOfMonth, format, startOfMonth } from "date-fns";
import useSWR from 'swr';

type HabitRow = Database['public']['Tables']['habits']['Row'];
type HabitLogRow = Database['public']['Tables']['habit_logs']['Row'];
type HabitLogUpsert = Database['public']['Tables']['habit_logs']['Insert'];
type MomentRow = Database['public']['Tables']['memorable_moments']['Row'];
type MomentUpsert = Database['public']['Tables']['memorable_moments']['Insert'];
type SleepRow = Database['public']['Tables']['sleep_logs']['Row'];
type SleepUpsert = Database['public']['Tables']['sleep_logs']['Insert'];

export function useHabits(month : string) {
    const { user } = useAuth();
    const [ habit , setHabit ] = useState<HabitRow[]>([]);
    const [ logs , setLogs ] = useState<HabitLogRow[]>([]);
    const [ loading , setLoading ] = useState(true);
    
    useEffect(() => {
        if(!user) return;
        const fetchData = async () => {
            setLoading(true);
            const { data :  habits  } = await supabase.from('habits').select('*').eq('user_id',user.id)
            const habitIds = habits?.map(h => h.id) || [];
            const { data : logs } = await supabase.from('habit_logs').select('*').gte('log_date',`${month}-01`).lte('log_date',`${month}-31`).in('habit_id',habitIds);
            setHabit(habit || []);
            setLogs(logs || []);
            setLoading(false);
        }
        fetchData()
    },[user,month])

    const toogleLog = async (payload : { habit_id : string; log_date : string; done : boolean }) => {
        const upsertRow : HabitLogUpsert = { ...payload }
        await supabase.from('habit_logs').upsert(upsertRow , { onConflict :  'habit_id,log_date' })
    }

    return { habit , logs , loading , toogleLog }
}

export function useMoment() {

  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10)
  const [moment, setMoment] = useState<MomentRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchMoment = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('memorable_moments')
        .select('*')
        .eq('user_id', user.id)
        .eq('moment_date', today)
        .single()
      setMoment(data || null)
      setLoading(false)
    }
    fetchMoment()
  }, [user, today])

  const upsert = async (text: string) => {
    const row: MomentUpsert = { user_id: user!.id, moment_date: today, text }
    await supabase.from('memorable_moments').upsert(row, { onConflict: 'user_id,moment_date' })
    setMoment(row as MomentRow)
  }

  return { moment, loading, upsert }
}

const fetcher = async ([_key , month , userId] : [string , string , string]) => {
  const startDate = format(startOfMonth(new Date(`${month}-02`)),'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date(`${month}-02`)),'yyyy-MM-dd');

  const { data , error } = await supabase.from('sleep_logs').select('*').eq('user_id',userId).gte('log_date',startDate).lte('log_date',endDate);
  if(error) throw error;
  return data;
}

export function useSleepLogs(month: string) {

  const { user } = useAuth();
  const [logs, setLogs] = useState<SleepRow[]>([])
  const [loading, setLoading] = useState(true)

  const { data , error , mutate } = useSWR(user ? ['sleep_logs' , month , user.id ] : null , fetcher);

  const upsert = async (logData : { log_date : string , hours : number }) => {
    if(!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('sleep_logs').upsert({
      ...logData,
      user_id : user.id,
    });

    if(error) throw error;
  };

  return { logs : data || [] , loading : !error && !data , error ,  upsert , mutate ,}
}
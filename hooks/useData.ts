import { Database } from "@/database.types";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

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

export function useSleepLogs(month: string) {

  const { user } = useAuth();
  const [logs, setLogs] = useState<SleepRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchLogs = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('sleep_logs')
        .select('*')
        .gte('log_date', `${month}-01`)
        .lte('log_date', `${month}-31`)
      setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [user, month])

  const upsert = async (input: { log_date: string; hours: number }) => {
    const row: SleepUpsert = { user_id: user!.id, ...input }
    await supabase.from('sleep_logs').upsert(row, { onConflict: 'user_id,log_date' })
  }

  return { logs, loading, upsert }
}
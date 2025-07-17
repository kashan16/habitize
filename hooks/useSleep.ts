import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./useAuth";
import { endOfMonth, format, startOfMonth } from "date-fns";
import useSWR from 'swr';

const fetcher = async ([_key , month , userId] : [string , string , string]) => {
  const startDate = format(startOfMonth(new Date(month)),'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date(month)),'yyyy-MM-dd');

  const { data , error } = await supabase.from('sleep_logs').select('*').eq('user_id',userId).gte('log_date',startDate).lte('log_date',endDate);
  if(error) throw error;
  return data;
}

export function useSleepLogs(month: string) {

  const { user } = useAuth();

  const { data , error , mutate } = useSWR(user ? ['sleep_logs' , month , user.id ] : null , fetcher);

  const upsert = async (logData : { log_date : string , hours : number }) => {
    if(!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('sleep_logs').upsert({
      ...logData,
      user_id : user.id,
    });

    if(error) throw error;
    await mutate();
  };

  return { logs : data || [] , loading : !error && !data , error ,  upsert , mutate ,}
}
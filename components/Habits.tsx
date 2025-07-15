import { useSupabase } from '@/context/SupabaseContext';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

interface Habit {
  id : number;
  name : string;
}

interface HabitLog {
  id : number;
  habit_id : number;
  log_date : string;
}

const Habits = () => {
  const supabase = useSupabase();
  const today = format(new Date() , "yyyy-MM-dd");

  const [ habits , setHabits ] = useState<Habit[]>([]);
  const [ logs , setLogs ] = useState<HabitLog[]>([]);
  const [ loading , setLoading ] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data : habitData , error : habitErr } = await supabase.from('habits').select('id, name');
      const { data : logData , error : logErr } = await supabase.from('habit_logs').select('id , habit_id , log_date').eq('log_date',today);

      if(habitErr || logErr) {
        toast.error("Error fetching Data");
      } else {
        setHabits(habitData || []);
        setLogs(logData || []);
      }
      setLoading(false);
    }

    load();
  },[supabase , today]);

  const toggleHabit = async (habitId : number) => {
    const exist = logs.find((log) => log.habit_id === habitId);
    if(exist) {
      await supabase.from('habit_logs').delete().eq('id',exist.id);
      setLogs((l) => l.filter((x) => x.id !== exist.id));
    } else {
      const { data } = await supabase.from('habit_logs').insert({ habit_id : habitId , log_date : today }).single();

      if(data) {
        setLogs((l) => [...l , data]);
      }
    }
  };

  if(loading) {
    return <p>Loading habits....</p>
  }
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Today&apos;s Habits</h1>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {habits.map((habit) => {
          const done = logs.some((log) => log.habit_id === habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors
                ${done ? 'bg-green-200' : 'bg-gray-200'}`}>
                  <span className='font-medium'>
                    {habit.name}
                  </span>
                  {done ? (
                    <span className='text-green-600 text-xl'>✓</span>
                  ) : (
                    <span className='text-red-600 text-xl'>✕</span>
                  )}
                </button>
          )
        })}
      </div>
    </div>
  )
}

export default Habits
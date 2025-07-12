import { useState, useEffect } from 'react';
import { useSupabase } from '@/context/SupabaseContext';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
    const [ user , setUser ] = useState<User | null>(null);
    const [ loading , setLoading ] = useState(true);
    const supabase = useSupabase();

    useEffect(() => {
        const getInitialUser = async () => {
            try {
                const { data : { user } , error } = await supabase.auth.getUser();
                if(error) throw error;
                setUser(user);
            } catch (error) {
                console.error("Error fetching user : " , error);
            } finally {
                setLoading(false);
            }
        };

        getInitialUser();

        const { data : { subscription } } = supabase.auth.onAuthStateChange(
            (event , session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    } , [supabase.auth]);

    return { user , loading };
}
"use client";

import { supabase } from "@/lib/supabaseClient";
import { User , Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user : User | null;
    session : Session | null;
}

const AuthContext = createContext<AuthContextType>({ user : null , session : null })

export function AuthProvider({ children } : { children : ReactNode }) {
    const [ user , setUser ] = useState<User | null>(null);
    const [ session , setSession ] = useState<Session | null>(null);
    
    useEffect(() => {
        const getInitialSession = async () => {
            const { data : { session } } = await supabase.auth.getSession();
            setSession(session); 
        };

        const getInitialUser = async () => {
            const { data : { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        getInitialSession();
        getInitialUser();

        const { data : { subscription } } = supabase.auth.onAuthStateChange(
            async (event , session) => {
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    },[]);

    return (
        <AuthContext.Provider value={{user , session}}>
            {children}
        </AuthContext.Provider>
    )
}

//useUser hook
export function useUser() {
    const { user } = useContext(AuthContext);
    return user;
}
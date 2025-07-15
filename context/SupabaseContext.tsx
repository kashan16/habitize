"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext } from "react";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children } : { children : ReactNode }) {

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = url && key ? createClient(url , key) : { auth : { signOut : async () => ({ error : null }) } } as any;

    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    )
}

export function useSupabase() {
    const ctx = useContext(SupabaseContext);
    if(!ctx) {
        throw new Error("useSupabase must be used within <SupabaseProvider>")
    }
    return ctx;
}
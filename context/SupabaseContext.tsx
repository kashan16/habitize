import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext } from "react";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children } : { children : ReactNode }) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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
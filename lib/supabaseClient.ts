import { Database } from "@/database.types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const supabase : SupabaseClient<Database> = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl,supabaseAnonKey);

export async function GET(request : Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const redirectTo = searchParams.get('next') || '/';

    if(code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if(!error) {
            return NextResponse.redirect(redirectTo);
        }
    }

    return NextResponse.redirect('/');
}
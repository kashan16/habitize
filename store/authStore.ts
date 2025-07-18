import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl,supabaseAnonKey);

interface AuthState {
    user : User | null;
    session : Session | null;
    loading : boolean;
    error : string | null;

    signUp : (email : string , password : string , username : string) => Promise<void>;
    signIn : (email : string , password : string) => Promise<void>;
    signOut : () => Promise<void>;
    clearError : () => void;
    signInWithGoogle : () => Promise<void>;
    initialize : () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set,get) =>({
    user : null,
    session : null,
    loading : false,
    error : null,

    signUp : async(email : string , password : string , username : string) => {
        set({ loading : true , error : null });
        try {
            const { data , error } = await supabase.auth.signUp({
                email,
                password,
                options : {
                    data : {
                        username
                    }
                }
            });
            if(error) {
                set({ error : error.message , loading : false });
                return;
            }
            set({
                user : data.user,
                session : data.session,
                loading : false,
                error : null
            });
        } catch (err) {
            set({
                error : err instanceof Error ? err.message : 'An error occurred',
                loading : false
            });
        }
    },
    signIn : async (email : string , password : string) => {
        set({ loading : true , error : null });
        try{
            const { data , error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if(error) {
                set({ error : error.message , loading : false});
                return;
            }
            set({
                user : data.user,
                session : data.session,
                loading : false,
                error : null
            });
        } catch(err) {
            set({
                error : err instanceof Error ? err.message : 'An error occurred',
                loading : false
            });
        }
    },
    signOut : async () => {
        set({ loading : true });
        try {
            const { error } = await supabase.auth.signOut();
            if(error) {
                set({ error : error.message , loading : false });
                return;
            }
            set({
                user : null,
                session : null,
                loading : false,
                error : null
            });
        } catch(err) {
            set({
                error : err instanceof Error ? err.message : 'An Error Occurred',
                loading : false
            });
        }
    },
    clearError : () => set({ error : null }),

    signInWithGoogle : async () => {
        set({ loading : true , error : null });
        try {
            const { data , error } = await supabase.auth.signInWithOAuth({
                provider : 'google',
                options : {
                    redirectTo : window.location.origin,
                },
            });
            if(error) {
                throw error;
            }
        } catch (error) {
            console.error("Google sign-In error");
            set({ error : 'Failed to sign in with google' , loading : false});
        }
    },
    
    initialize : async () => {
        set({ loading : true });
        try {
            const { data : { session } , error } = await supabase.auth.getSession();
            if(error) {
                console.error("Error getting session : ",error);
                set({ loading : false , error : error.message });
                return;
            }
            set({
                user : session?.user || null,
                session : session || null,
                loading : false
            });
        } catch (err) {
            console.error("Error initializing AUTH",err);
            set({
                loading : false,
                error : err instanceof Error ? err.message : "Failed to initialize AUTH"
            });
        }
    }
}));

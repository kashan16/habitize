import { Capacitor } from '@capacitor/core';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl,supabaseAnonKey);

const getRedirectBaseUrl = () => {
    return Capacitor.isNativePlatform() ? 'habitize://' : window.location.origin;
}
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
    sendPasswordResetEmail : ( email : string ) => Promise<void>;
    updatePassword : ( newPassword : string ) => Promise<void>; 
    initialize : () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) =>({
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
            toast.success(`Success! We've sent a verification link to ${email}. Please check your inbox and spam folder to complete your registration.`);
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
            const redirectTo = `${getRedirectBaseUrl()}/auth/callback`
            const error = await supabase.auth.signInWithOAuth({
                provider : 'google',
                options : {
                    redirectTo
                },
            });
            if(error) {
                throw error;
            }
        } catch (error) {
            console.error("Google sign-In error", error);
            set({ error : 'Failed to sign in with google' , loading : false});
        }
    },
    sendPasswordResetEmail :  async ( email :string ) => {
        set({ loading : true , error : null });
        try {
            const redirectTo = `${getRedirectBaseUrl()}/reset-password`
            const { error } = await supabase.auth.resetPasswordForEmail(email , {
                redirectTo,
            });
            if(error) {
                throw error;
            }
            toast.success(`A password reset link has been sent on ${email}`);
            set({ loading : false });
        } catch ( err ) {
            const error = err as Error;
            console.error("Password reset error : ",error);
            toast.error('An error occured. Please try again later');
            set({ error : error.message , loading : false });
        }
    },
    updatePassword : async ( newPassword : string ) => {
        set({ loading : true , error : null });
        try {
            const { data , error } = await supabase.auth.updateUser({
                password : newPassword,
            });
            if(error) {
                throw error;
            }
            set({ loading : false , user : data.user });
            toast.success("Your password has been updated successfully! You can sign in.");
        } catch ( err ) {
            const error = err as Error;
            console.error("Password update error : ",error);
            toast.error("Failed to update password");
            set({ error : error.message , loading : false });
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

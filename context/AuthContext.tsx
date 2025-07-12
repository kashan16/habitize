"use client";

import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { User , Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user : User | null;
    session : Session | null;
    loading : boolean;
    error : string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children : ReactNode;
}

export const AuthProvider : React.FC<AuthProviderProps> = ({ children }) => {
    const { user , session , loading , error , initialize } = useAuthStore();

    useEffect(() => {
        initialize();
        const { data : { subscription } } = supabase.auth.onAuthStateChange(
            async( event , session ) => {
                console.log("Auth state changed" , event , session);
                useAuthStore.setState({
                    user : session?.user || null,
                    session : session || null,
                    loading : false
                });
            }
        );
        return () => {
            subscription.unsubscribe();
        };
    },[initialize]);

    const value : AuthContextType = {
        user,
        session,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

interface WithAuthProps {
    fallback ?: ReactNode;
}

export const withAuth = <P extends object>(
    Component : React.ComponentType<P>,
    options : WithAuthProps = {} 
) => {
    const AuthenticatedComponent : React.FC<P> = (props) => {
        const { user , loading } = useAuth();
        const { fallback = <div>Please log in to access this page.</div> } = options;

        if(loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">

                    </div>
                </div>
            );
        }
        if(!user) {
            return <>{fallback}</>
        }
        return <Component {...props}/>
    };

    AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
    return AuthenticatorAssertionResponse;
}
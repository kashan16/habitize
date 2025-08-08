"use client";

import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect } from "react";

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
        let isMounted = true;
        let appUrlListenerHandle : PluginListenerHandle | null = null;
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
        (async () => {
            try {
                const handle = await App.addListener('appUrlOpen' , async ({ url }) => {
                    console.log('App opened with URL : ',url);
                    const redirectUrl = new URL(url);
                    if(redirectUrl.pathname === '/auth/callback') {
                        try {
                            const { data , error } = await supabase.auth.exchangeCodeForSession(url);
                            if(error) {
                                console.error('Error exchanging code for session : ', error.message);
                            } else {
                                console.log('Session updated via deep link : ', data);
                                useAuthStore.setState({
                                    user : data.session?.user || null,
                                    session : data.session,
                                    loading : false,
                                    error : null
                                });
                            }
                        } catch(err) {
                            console.error("Exchange failed : ",err);
                        }
                    }
                });
                if(isMounted) {
                    appUrlListenerHandle = handle;
                } else {
                    handle.remove();
                }
            } catch(err) {
                console.error('Failed to setup appUrl Open listener : ',err);
            }
        })();
        return () => {
            isMounted = false
            subscription.unsubscribe();
            if(appUrlListenerHandle) {
                appUrlListenerHandle.remove();
            }
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
    return AuthenticatedComponent;
}
"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type ActivePage = 'Sleep' | 'Habit' | 'Moments' | 'Stats';

interface PageContextType {
    activePage : ActivePage;
    setActivePage : (page : ActivePage) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

interface PageProviderProps {
    children : ReactNode;
}

export function PageProvider({ children } : PageProviderProps) {
    const [ activePage , setActivePage ] = useState<ActivePage>('Habit');

    const value = {
        activePage,
        setActivePage,
    };

    return (
        <PageContext.Provider value={value}>
            {children}
        </PageContext.Provider>
    )
}

export function usePage() {
    const context = useContext(PageContext);
    if(!context) {
        throw new Error('UsePage must be used within a PageProvider');
    }
    return context;
}
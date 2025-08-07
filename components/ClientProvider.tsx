"use client";
import { useEffect } from "react";

export default function ClientProvider ({
    children
} : {
    children : React.ReactNode
}) {
    useEffect(() => {
        if('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/public/sw.js').then(registration => {
                console.log('Service worker registered with scope : ',registration.scope);
            }).catch(error => {
                console.log('Service worker registration failed : ',error);
            });
        } else {
            console.log("Service worker not supported in this browser.");
        }
    },[]); 
    
    return (
        <>
        {children}
        </>
    )
}
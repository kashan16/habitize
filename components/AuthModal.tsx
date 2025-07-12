"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthMode, useAuthForm } from "@/hooks/useAuthForm";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "./ui/button"; // Assuming this is a custom button component

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    defaultMode?: AuthMode;
}

export function AuthModal({ open, onClose, defaultMode = "login" }: AuthModalProps) {
    const { user, loading } = useAuth();
    const [currentMode, setCurrentMode] = useState<AuthMode>(defaultMode);
    
    const {
        handleSubmit,
        isSubmitting,
        canSubmit,
        toggleMode,
        getFieldProps,
        passwordStrength,
        mode,
    } = useAuthForm({
        mode: currentMode,
        onModeChange: setCurrentMode,
        onSuccess: onClose,
    });

    useEffect(() => {
        if (user && !loading) onClose();
    }, [user, loading, onClose]);

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    {/* Darker, slightly less blurry backdrop for a more modern feel */}
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                </Transition.Child>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <Dialog.Panel 
                            className="relative w-full max-w-md mx-auto 
                                       bg-white dark:bg-gray-900 
                                       rounded-xl shadow-2xl overflow-hidden 
                                       border border-gray-100 dark:border-gray-800 
                                       transform transition-all">
                            {/* REMOVED: The internal gradient overlay that made it less minimal */}
                            {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 opacity-50"></div> */}
                            
                            <div className="relative">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-10 p-2 
                                               text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 
                                               transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <FiX className="w-5 h-5"/>
                                </button>
                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        {/* Simplified Icon - no large gradient circle, just the icon itself */}
                                        <div className="flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <Dialog.Title as='h3' className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {mode === "login" ? "Welcome back" : "Create your account"}
                                        </Dialog.Title>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {mode === "login" ? "Sign in to continue to your account" : "Join us and start your journey"}
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {mode === 'signup' && (
                                            <div className="space-y-2">
                                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Username
                                                </label>
                                                <input
                                                    id="username"
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 
                                                               border border-gray-200 dark:border-gray-700 
                                                               rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                                               transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                                    placeholder="Enter your username"/>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Email Address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                {...getFieldProps("email")}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 
                                                           border border-gray-200 dark:border-gray-700 
                                                           rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                                           transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                                placeholder="Enter your email"/>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                {...getFieldProps("password")}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 
                                                           border border-gray-200 dark:border-gray-700 
                                                           rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                                           transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                                placeholder="Enter your password"/>
                                            {mode === "signup" && passwordStrength && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                        <span className="font-medium">Password Strength</span>
                                                        <span className={`font-semibold ${passwordStrength.isStrong ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                                                            {passwordStrength.label}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                                                            style={{ width: `${passwordStrength.percentage}%` }}/>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {mode === 'signup' && (
                                            <div className="space-y-2">
                                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    id="confirmPassword"
                                                    type="password"
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 
                                                               border border-gray-200 dark:border-gray-700 
                                                               rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                                               transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                                    placeholder="Confirm your password"/>
                                            </div>
                                        )}
                                        
                                        {/* Button styling - more subtle gradient, softer shadow, less rounded */}
                                        <Button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className="w-full py-3 px-4 
                                                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 
                                                       text-white font-semibold rounded-lg shadow-md hover:shadow-lg 
                                                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
                                                       flex items-center justify-center">
                                            {isSubmitting ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                                                </span>
                                            ) : (mode === "login" ? "Sign In" : "Create Account")}
                                        </Button>
                                    </form>
                                    
                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                                            <button 
                                                type="button"
                                                onClick={toggleMode} 
                                                className="ml-2 font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                                {mode === "login" ? "Sign Up" : "Sign In"}
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}
"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthMode, useAuthForm } from "@/hooks/useAuthForm";
import { Dialog, Transition }    from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "./ui/button";


interface AuthModalProps {
    open : boolean;
    onClose : () => void;
    defaultMode ?: AuthMode;
}

export function AuthModal({ open , onClose , defaultMode = "login" } : AuthModalProps ) {
    const { user , loading } = useAuth();
    const {
        handleSubmit,
        isSubmitting,
        canSubmit,
        toggleMode,
        getFieldProps,
        passwordStrength,
        mode,
    } = useAuthForm({
        mode : defaultMode,
        onModeChange : () => {},
        onSuccess : onClose,
    });

    useEffect(() => {
        if(user && !loading) onClose();
    },[user , loading , onClose]);

    return (
        <Transition show = {open} as = {Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
                    </Transition.Child>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opactity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                                <Dialog.Panel className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-auto">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                                            <FiX className="w-5 h-5"/>
                                        </button>
                                        <div className="p-6">
                                            <Dialog.Title as='h3' className="text-2xl font-bold text-center mb-2">
                                                { mode === "login" ? "Sign in to your account" : "Create your account" }
                                            </Dialog.Title>
                                            <p className="text-sm text-center text-gray-600 mb-6">
                                                { mode === "login" ? "Don't have an account ?" : "Already have an account ?"}
                                                <Button onClick={toggleMode} className="font-medium text-blue-600 hover:text-blue-500">
                                                    { mode === "login" ? "Sign Up" : "Sing In" }
                                                </Button>
                                            </p>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                { mode === 'signup' && (
                                                    <div>
                                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                                            Username
                                                        </label>
                                                        <input
                                                            id="username"
                                                            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                                    </div>
                                                )}

                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medum text-gray-700">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        id="email"
                                                        type="email"
                                                        {...getFieldProps("email")}
                                                        className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                        Password
                                                    </label>
                                                    <input
                                                        id="password"
                                                        type="password"
                                                        {...getFieldProps("password")}
                                                        className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                                        { mode === "signup" && passwordStrength && (
                                                            <div className="mt-2">
                                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                                    <span>Strength</span>
                                                                    <span className={passwordStrength.isStrong ? "text-green-600" : "text-orange-600"}>
                                                                        {passwordStrength.label}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className={`${passwordStrength.color} h-2 rounded-full transition-all`}
                                                                        style={{ width : `${passwordStrength.percentage}%` }}/>
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                                { mode === 'signup' && (
                                                    <div>
                                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                            Confirm Password
                                                        </label>
                                                        <input
                                                            id="confirmPassword"
                                                            type="password"
                                                            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                                    </div>
                                                )}
                                                <Button
                                                    disabled={!canSubmit}
                                                    className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50">
                                                        {isSubmitting ? (
                                                            <span className="flex items-center">
                                                                <svg className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"/>
                                                                { mode === "login" ? "Signing In..." : "Creating Account..."}
                                                            </span>
                                                        ) : (mode === "login" ? "Sing In" : "Create Account")}
                                                    </Button>
                                            </form>
                                        </div>
                                </Dialog.Panel>
                            </Transition.Child>
                    </div>
            </Dialog>
        </Transition>
    )
}
"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthMode } from "@/hooks/useAuthForm"; 
import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { Button } from "./ui/button";
import { useAuthStore } from "@/store/authStore";


interface PasswordInputProps {
    id : string;
    label : string;
    value : string;
    onChange : ( event : React.ChangeEvent<HTMLInputElement>) => void;
    showPassword : boolean;
    toggleVisibility : () => void;
    required ?: boolean;
}

const PasswordInput : React.FC<PasswordInputProps> = ({
    id,
    label,
    value,
    onChange,
    toggleVisibility,
    showPassword,
    required = true,
}) => (
    <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <div className="relative">
            <input
                id={id}
                name={id}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                required={required}
                className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="••••••••"
            />
            <button
                type="button"
                onClick={toggleVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
        </div>
    </div>
);

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    defaultMode?: AuthMode;
}

type FormFieldName = 'email' | 'password' | 'username' | 'confirmPassword';

interface FormValues {
    email: string;
    password: string;
    username: string;
    confirmPassword: string;
}

export function AuthModal({ open, onClose, defaultMode = 'login' }: AuthModalProps) {
    const { user, loading: userLoading } = useAuth();
    const [ currMode, setCurrMode ] = useState<AuthMode>(defaultMode);
    const [ emailSent, setEmailSent ] = useState(false);
    const [ showPassword , setShowPassword ] = useState(false);

    const {
        signUp,
        signIn,
        signInWithGoogle,
        sendPasswordResetEmail,
        error: authError,
        loading: authLoading,
        clearError,
    } = useAuthStore();

    useEffect(() => {
        if (open) {
            setCurrMode(defaultMode);
            clearError();
            setEmailSent(false); 
            setShowPassword(false);
            setFormValues({ email: '', password: '', username: '', confirmPassword: '' });
        }
    }, [open, defaultMode, clearError]);

    useEffect(() => {
        if (user && !userLoading) onClose();
    }, [user, userLoading, onClose]);

    const [formValues, setFormValues] = useState<FormValues>({
        email: '', password: '', username: '', confirmPassword: ''
    });

    const handleInputChange = (field: FormFieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues(prev => ({ ...prev, [field]: e.target.value }));
    };

    const isFormValid = () => {
        const { email, password, username, confirmPassword } = formValues;
        if (currMode === 'login') return email.trim() !== '' && password.trim() !== '';
        if (currMode === 'signup') return email.trim() !== '' && password.trim() !== '' && username.trim() !== '' && password === confirmPassword;
        if (currMode === 'forgotPassword') return email.trim() !== '';
        return false;
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid() || authLoading) return;

        try {
            if (currMode === 'signup') {
                await signUp(formValues.email, formValues.password, formValues.username);
            } else if (currMode === 'login') {
                await signIn(formValues.email, formValues.password);
            } else if (currMode === 'forgotPassword') {
                await sendPasswordResetEmail(formValues.email);
                setEmailSent(true);
                return;
            }

            const currentError = useAuthStore.getState().error;
            if (!currentError) {
                onClose();
            }
        } catch (err) {
            console.error('Auth error: ', err);
        }
    };

    const handleGoogleSignIn = async () => {
        if (authLoading) return;
        await signInWithGoogle();
    };

    const modalContent = {
        login: {
            icon: <FiLock className="w-10 h-10 text-blue-600 dark:text-blue-400" />,
            title: "Welcome back",
            subtitle: "Sign in to continue to your account",
            submitButton: "Sign In",
            submittingButton: "Signing In...",
            toggleText: "Don't have an account?",
            toggleLink: "Sign Up",
        },
        signup: {
            icon: <FiUser className="w-10 h-10 text-blue-600 dark:text-blue-400" />,
            title: "Create your account",
            subtitle: "Join us and start your journey",
            submitButton: "Create Account",
            submittingButton: "Creating Account...",
            toggleText: "Already have an account?",
            toggleLink: "Sign In",
        },
        forgotPassword: {
            icon: <FiMail className="w-10 h-10 text-blue-600 dark:text-blue-400" />,
            title: "Reset Your Password",
            subtitle: "Enter your email to receive a reset link.",
            submitButton: "Send Reset Link",
            submittingButton: "Sending...",
            toggleText: "Remembered your password?",
            toggleLink: "Sign In",
        }
    };
    const currentContent = modalContent[currMode];

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <Dialog.Panel className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all max-h-[calc(100vh-2rem)] overflow-y-auto">
                            <div className="relative">
                                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><FiX className="w-5 h-5" /></button>
                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <div className="flex items-center justify-center mx-auto mb-4">{currentContent.icon}</div>
                                        <Dialog.Title as='h3' className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{currentContent.title}</Dialog.Title>
                                        <p className="text-gray-600 dark:text-gray-400">{currentContent.subtitle}</p>
                                    </div>
                                    
                                    {authError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><p className="text-sm text-red-600 dark:text-red-400">{authError}</p></div>}
                                    
                                    {currMode === 'forgotPassword' && emailSent ? (
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                            <h4 className="font-semibold text-lg text-gray-800 dark:text-white">Email Sent!</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">If an account exists for <strong>{formValues.email}</strong>, you will receive a password reset link. Please check your inbox and spam folder.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                                {currMode === 'signup' && (
                                                    <div className="space-y-2">
                                                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                                                        <input id="username" value={formValues.username} onChange={handleInputChange('username')} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your username" />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                                                    <input id="email" type="email" value={formValues.email} onChange={handleInputChange('email')} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" />
                                                </div>
                                                {currMode !== 'forgotPassword' && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center"><label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                                                                {currMode === 'login' && <button type="button" onClick={() => { setCurrMode('forgotPassword'); clearError(); }} className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Forgot password?</button>}
                                                            </div>
                                                            <PasswordInput
                                                                id="password"
                                                                label="Password"
                                                                value={formValues.password}
                                                                onChange={handleInputChange('password')}
                                                                showPassword={showPassword}
                                                                toggleVisibility={() => setShowPassword(p => !p)}
                                                            />
                                                        </div>
                                                        {currMode === 'signup' && (
                                                            <div className="space-y-2">
                                                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</label>
                                                            <PasswordInput
                                                                id="confirmPassword"
                                                                label="Confirm Password"
                                                                value={formValues.confirmPassword}
                                                                onChange={handleInputChange('confirmPassword')}
                                                                showPassword={showPassword}
                                                                toggleVisibility={() => setShowPassword(p => !p)}
                                                            />                                                                
                                                                {formValues.confirmPassword && formValues.password !== formValues.confirmPassword && <p className="text-sm text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                <Button type="submit" disabled={!isFormValid() || authLoading} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center">
                                                    {authLoading ? <><svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{currentContent.submittingButton}</> : currentContent.submitButton}
                                                </Button>
                                            </form>
                                            {currMode !== 'forgotPassword' && (
                                                <>
                                                    <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span></div></div>
                                                    <div><Button type="button" onClick={handleGoogleSignIn} disabled={authLoading} className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"><FcGoogle size={20} /><span>Sign in with Google</span></Button></div>
                                                </>
                                            )}
                                        </>
                                    )}
                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{currentContent.toggleText}
                                            <button type="button" onClick={() => { if(currMode === 'login') { setCurrMode('signup') } else { setCurrMode('login') }clearError();}} className="ml-2 font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">{currentContent.toggleLink}</button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const { updatePassword , loading : authLoading , error : authError } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [ newPassword , setNewPassword ] = useState('');
    const [ confirmPassword , setConfirmPassword ] = useState('');
    const [ showPassword , setShowPassword ] = useState(false);
    
    useEffect(() => {
        //The password reset token is in the URL fragment , not search params,
        //but checking foran error code from supabase in the params is a good practice.
        const error = searchParams.get('error_description');
        if(error) {
            toast.error(error);
            router.push('/');
        }
    },[searchParams , router]);

    const handleSubmit = async ( e : React.FormEvent<HTMLFormElement> ) => {
        e.preventDefault();
        if(newPassword.length < 8) {
            toast.error("Password must be atleast 8 character long.");
            return;
        }
        if(newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        await updatePassword(newPassword);
        const latestError = useAuthStore.getState().error;
        if(!latestError) {
            router.push('/');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-light text-gray-900 dark:text-white">
                        Set a New Password
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Please enter and confirm your new password below.
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label 
                                htmlFor="new-password"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    New Password
                            </label>
                            <input
                                id="new-password"
                                name="new-password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="********"
                                className="mt-2 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                <Button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    aria-label={showPassword ? "Hide Password" : "Show Password"}>
                                        {showPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
                                </Button>
                        </div>
                        <div>
                            <label 
                                htmlFor="confirm-password"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Confirm New Password
                            </label>
                            <input 
                                id="confirm-password"
                                name="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="********"
                                className="mt-2 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                <Button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    aria-label={showPassword ? "Hide Password" : "Show Password"}>
                                        {showPassword ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
                                </Button>                                
                        </div>
                        { authError && (
                            <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center">
                                {authLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Updating...                                        
                                    </>
                                ) : ("Update Password")}
                            </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
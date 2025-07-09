"use client";

import { useUser } from '@/context/AuthContext'
import { useSupabase } from '@/context/SupabaseContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import { Button } from './ui/button';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link 
         href = {href}
         className={`
            text-gray-700 hover:text-blue-600 transition-colors duration-200 ${isActive ? 'font-semibold text-blue-600' : ''}`}>
                {children}
            </Link>
    )
}

type NavbarProps = {}

export default function Navbar( {} : NavbarProps ) {
    const user = useUser();
    const supabase = useSupabase();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const userName = user?.email?.split('@')[0] || 'User'

    return (
        <nav className='fixed top-0 left-0 w-full z-50 p-4'>
            <div className='relative max-w-7xl mx-auto rounded-xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg'>
                <div className='flex justify-between h-16 items-center px-6'>
                    <Link href="/" className='text-xl font-bold text-gray-800 hover:text-gray-900 transition-colors duration-200'>
                    Habitize
                    </Link>
                    <div className="flex space-x-6">
                        <NavLink href="/">Dashboard</NavLink>
                        <NavLink href="/habits">Habits</NavLink>
                        <NavLink href="/sleep">Sleep</NavLink>
                        <NavLink href="/moments">Moments</NavLink>
                    </div>    
                    <div className='flex items-center space-x-4'>{user ? 
                    (<>
                        <span className='text-gray-700 text-sm font-medium'>Welcome , {userName}!</span>
                        <Button onClick={handleSignOut} className='px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg'>Sign Out</Button>
                    </>) : (<>
                        <Link href="/" className='px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg'>Sign In</Link>
                    </>)}</div>                
                </div>
            </div>
        </nav>
    )
}
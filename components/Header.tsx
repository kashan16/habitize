"use client";

import { useSupabase } from '@/context/SupabaseContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment , useState } from 'react';
import { Button } from './ui/button';
import { AuthModal } from './AuthModal'; 
import { useAuth } from '@/context/AuthContext';
import { Dialog, Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { FiChevronDown, FiLogIn, FiLogOut, FiMenu, FiMoon, FiSmile, FiTarget, FiUser, FiX } from 'react-icons/fi';
import { ActivePage, usePage } from '@/context/PageContext';
import { IconType } from 'react-icons/lib';

interface NavItem {
    name : string;
    page : ActivePage;
    icon : IconType;
}

export default function Navbar() {

    const { activePage , setActivePage }  = usePage();

    const isHabitActive = activePage === 'Habit';
    const isSleepActive = activePage === 'Sleep';
    const isMomentsActive = activePage === 'Moments';

    const [ isAuthOpen, setIsAuthOpen ] = useState(false);
    const [ isMobileMenuOpen, setIsMobileMenuOpen ] = useState(false);

    const navItems : NavItem[] = [
        { name : 'Habit' , page : 'Habit' , icon : FiTarget },
        { name : 'Sleep' , page : 'Sleep' , icon : FiMoon },
        { name : 'Moments' , page : 'Moments' , icon : FiSmile },
    ]

    const { user, loading } = useAuth();
    const supabase = useSupabase();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error signing out : ", error);
            }
            router.push('/');
        } catch (error) {
            console.error("Error in handleSignOut : ", error);
        }
    };

    const handleSignIn = () => {
        setIsAuthOpen(true);
    };

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
    };

    const userName = user?.email?.split('@')[0] || 'User';

    const handleMobileNavClick = (page : ActivePage) => {
        setActivePage(page);
        closeAllMenus();
    }

    return (
        <>
            {/* Navbar */}
            <nav className='bg-white/30 dark:bg-black/30 backdrop-blur-xl sticky top-0 z-40 w-full border-b border-gray-100 dark:border-gray-800 shadow-sm'>
                <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center h-20'>
                        {/* Logo */}
                        <div className='flex-shrink-0'>
                            <Link href="/" className='text-2xl font-bold text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                                Habitize
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className='hidden md:flex items-center space-x-8'>
                            <Button 
                            variant={isHabitActive ? 'default' : 'ghost'}
                            onClick={() => {setActivePage('Habit')}}>Habit</Button>
                            <Button 
                            variant={isSleepActive ? 'default' : 'ghost'}
                            onClick={() => {setActivePage('Sleep')}}>Sleep</Button>
                            <Button 
                            variant={isMomentsActive ? 'default' : 'ghost'}
                            onClick={() => {setActivePage('Moments')}}>Moments</Button>
                        </div>

                        {/* Action Icons (Desktop & Mobile Menu Toggle) */}
                        <div className='flex items-center space-x-2'>
                             {/* Desktop User/Login Actions */}
                            <div className='hidden md:flex items-center'>
                                {loading ? (
                                    <div className='animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-10 w-28'></div>
                                ) : user ? (
                                    <Menu as = "div" className = "relative ml-3">
                                        <div>
                                            <MenuButton className='inline-flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900'>
                                                <FiUser className='h-5 w-5'/>
                                                <FiChevronDown className='ml-1 h-4 w-4 text-gray-500'/>
                                            </MenuButton>
                                        </div>
                                        <Transition as={Fragment}
                                        enter='transition ease-out duration-100'
                                        enterFrom='transform opacity-0 scale-95'
                                        enterTo='transform opacity-100 scale-100'
                                        leave='transition ease-in duration-75'
                                        leaveFrom='transform opacity-100 scale-100'
                                        leaveTo='transform opacity-0 scale-95'>
                                            <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 ring-opacity-5 dark:ring-opacity-20 focus:outline-none">
                                            <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                                                <p className='text-sm font-semibold text-gray-900 dark:text-white' aria-hidden="true">
                                                    {userName}
                                                </p>
                                                <p className='text-xs text-gray-500 dark:text-slate-400 truncate' aria-hidden="true">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className='py-1 border-t border-gray-200 dark:border-slate-700'>
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <Button onClick={handleSignOut}
                                                        variant="ghost"
                                                        className={`${active ? 'bg-red-500 text-white' : 'text-red-600 dark:text-red-400'} group flex items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors`}>
                                                            <FiLogOut className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-red-500 group-hover:text-red-600'}`}/>
                                                            Sign Out
                                                        </Button>
                                                    )}
                                                </MenuItem>
                                            </div>
                                            </MenuItems>
                                        </Transition>
                                    </Menu>
                                ) : (
                                    <Button
                                        variant="default"
                                        onClick={handleSignIn}
                                        className='flex items-center space-x-2'>
                                            <FiLogIn className='h-4 w-4'/>
                                            <span>Sign In</span>
                                    </Button>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <div className='md:hidden'>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Open menu"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <FiMenu className='h-6 w-6' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <Transition.Root show={isMobileMenuOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 md:hidden" onClose={setIsMobileMenuOpen}>
                    {/* Overlay */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 dark:bg-black/60" aria-hidden="true" />
                    </Transition.Child>

                    {/* Mobile Menu Panel */}
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo='translate-x-0'
                        leave='transition ease-in-out duration-300 transform'
                        leaveFrom='translate-x-0'
                        leaveTo='-translate-x-full'
                    >
                        <Dialog.Panel className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-white dark:bg-gray-900 flex flex-col">
                            <div className='flex h-20 shrink-0 items-center justify-between px-6'>
                                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Menu</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label='Close Menu'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <FiX className="h-6 w-6" />
                                </Button>
                            </div>
                            <nav className="flex flex-1 flex-col px-6 pb-4">
                                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <ul role="list" className='space-y-1'>
                                            {navItems.map((item) => (
                                                <li key={item.name}>
                                                    <button 
                                                        onClick={() => handleMobileNavClick(item.page)}
                                                        className={`group flex w-full items-center rounded-md p-3 text-base font-semibold transition-colors ${activePage === item.page ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
                                                            <item.icon
                                                                className={`mr-3 h-6 w-6 shrink-0 ${activePage === item.page} ? 'text-blue-600 dark:text-blue-300' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'`}/>{item.name}
                                                        </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                    <li className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <div className="space-y-4">
                                            {loading ? (
                                                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-8 w-full"></div>
                                            ) : user ? (
                                                <>
                                                    <span className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300">
                                                        <FiUser className="mr-3 h-5 w-5" /> Welcome, {userName}!
                                                    </span>
                                                    <button
                                                        onClick={() => { handleSignOut(); closeAllMenus(); }}
                                                        className="flex w-full items-center text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                                    >
                                                        <FiLogOut className="mr-3 h-5 w-5" /> Sign Out
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => { handleSignIn(); closeAllMenus(); }}
                                                    className="flex w-full items-center text-base font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                                                >
                                                    <FiLogIn className="mr-3 h-5 w-5" /> Login / Sign Up
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                </ul>
                            </nav>
                        </Dialog.Panel>
                    </Transition.Child>
                </Dialog>
            </Transition.Root>

            {/* AuthModal */}
            <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}
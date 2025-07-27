"use client";

import { useSupabase } from '@/context/SupabaseContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment, useState } from 'react';
import { Button } from './ui/button';
import { AuthModal } from './AuthModal'; 
import { useAuth } from '@/context/AuthContext';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { FiChevronDown, FiLogIn, FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi';
import { FiMoon, FiSmile, FiTarget } from 'react-icons/fi';
import { IoStatsChart } from "react-icons/io5";
import { ActivePage, usePage } from '@/context/PageContext';
import { IconType } from 'react-icons/lib';

interface NavItem {
  name: string;
  page: ActivePage;
  icon: IconType;
}

export default function Header() {
  const { activePage, setActivePage } = usePage();
  const { user, loading } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: 'Habit',   page: 'Habit',   icon: FiTarget },
    { name: 'Sleep',   page: 'Sleep',   icon: FiMoon },
    { name: 'Moments', page: 'Moments', icon: FiSmile },
    { name: 'Stats',   page: 'Stats',   icon: IoStatsChart },
  ];

  // Active state helpers
  const isHabitActive = activePage === 'Habit';
  const isSleepActive = activePage === 'Sleep';
  const isMomentsActive = activePage === 'Moments';
  const isStatsActive = activePage === 'Stats';

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

  const userName = user?.email?.split('@')[0] || 'User';

  const onNavClick = (page: ActivePage) => setActivePage(page);

  return (
    <>
      {/* Header */}
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
                onClick={() => setActivePage('Habit')}>
                Habit
              </Button>
              <Button 
                variant={isSleepActive ? 'default' : 'ghost'}
                onClick={() => setActivePage('Sleep')}>
                Sleep
              </Button>
              <Button 
                variant={isMomentsActive ? 'default' : 'ghost'}
                onClick={() => setActivePage('Moments')}>
                Moments
              </Button>
              <Button 
                variant={isStatsActive ? 'default' : 'ghost'}
                onClick={() => setActivePage('Stats')}>
                Stats
              </Button>
            </div>

            {/* Action Icons (Desktop & Mobile Menu Toggle) */}
            <div className='flex items-center space-x-2'>
              {/* Desktop User/Login Actions */}
              <div className='hidden md:flex items-center'>
                {loading ? (
                  <div className='animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-10 w-28'></div>
                ) : user ? (
                  <Menu as="div" className="relative ml-3">
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

              {/* Mobile Menu Button - Keep existing mobile display */}
              <div className='md:hidden'>
                {loading ? (
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                ) : user ? (
                  <Menu as="div" className="relative">
                    <MenuButton className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FiUser className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </MenuButton>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={`w-full flex items-center px-4 py-2 text-sm ${
                                active ? 'bg-red-600 text-white' : 'text-red-600'
                              }`}
                            >
                              <FiLogOut className="mr-2" /> Logout
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Transition>
                  </Menu>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FiLogIn className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navbar (Mobile Only) */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-white/30 dark:bg-black/30 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 h-16 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const isActive = activePage === item.page;
          const activeClasses = isActive
            ? 'text-blue-600 dark:text-blue-300 border-t-2 border-blue-600 dark:border-blue-300'
            : 'text-gray-500 dark:text-gray-400';
          
          return (
            <button
              key={item.name}
              onClick={() => onNavClick(item.page)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${activeClasses} transition-all`}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Auth Modal */}
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
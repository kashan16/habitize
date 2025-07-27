"use client";

import { useSupabase } from '@/context/SupabaseContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Fragment, useState } from 'react';
import { AuthModal } from './AuthModal'; 
import { useAuth } from '@/context/AuthContext';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { FiMoon, FiSmile, FiTarget } from 'react-icons/fi';
import { IoStatsChart } from "react-icons/io5";
import { ActivePage, usePage } from '@/context/PageContext';
import { IconType } from 'react-icons/lib';

interface NavItem {
  name: string;
  page: ActivePage;
  icon: IconType;
}

export default function Navbar() {
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
    router.push('/');
  };

  const handleSignIn = () => setIsAuthOpen(true);
  const userName = user?.email?.split('@')[0] || 'User';

  const onNavClick = (page: ActivePage) => setActivePage(page);

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white/30 dark:bg-black/30 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 h-16 flex items-center px-4 md:px-8 justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white">
          Habitize
        </Link>

        {/* Auth Icon */}
        <div>
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
      </nav>

      {/* Bottom Navbar (Mobile Only) */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-white/30 dark:bg-black/30 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 h-16 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const ActiveColor = activePage === item.page
            ? 'text-blue-600 dark:text-blue-300 border-t-2 border-blue-600 dark:border-blue-300'
            : 'text-gray-500 dark:text-gray-400';
          return (
            <button
              key={item.name}
              onClick={() => onNavClick(item.page)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${ActiveColor} transition-all`}
            >
              <item.icon className="h-6 w-6 mb-1" />
            </button>
          );
        })}
      </nav>

      {/* Auth Modal */}
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

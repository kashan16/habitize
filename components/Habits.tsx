// components/HabitTracker.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isFuture, isToday, setISODay, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { useState, Fragment } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FiCheck, FiChevronLeft, FiChevronRight, FiLogIn, FiMoreVertical, FiPlus, FiTrash2 } from "react-icons/fi";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import clsx from "clsx";
import { AuthModal } from "./AuthModal";

const DesktopSkeleton = () => (
  <div className="space-y-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="grid grid-cols-[200px_1fr] gap-2 items-center py-2">
        <div className="h-10 rounded-lg bg-gray-200 dark:bg-slate-700/60 animate-pulse" />
        <div className="grid grid-cols-31 gap-2">
          {[...Array(31)].map((_, j) => (
            <div key={j} className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700/60 animate-pulse" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const MobileSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-4 rounded-lg bg-white dark:bg-slate-800/50">
        <div className="h-6 w-3/4 rounded-md bg-gray-200 dark:bg-slate-700/60 animate-pulse mb-4" />
        <div className="flex justify-between gap-2">
          {[...Array(7)].map((_, j) => (
            <div key={j} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700/60 animate-pulse" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export function Habits() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    habits,
    loading,
    error,
    toggleHabit,
    createHabit,
    deleteHabit,
    isHabitCompleted,
    getHabitStats,
  } = useHabits(format(currentMonth, 'yyyy-MM-01'));

  const [newHabitName, setNewHabitName] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });


  const handleMonthChange = (dir: 'prev' | 'next') => {
    const newMonth = dir === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await createHabit({ name: newHabitName });
    setNewHabitName('');
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    if (window.confirm(`Are you sure you want to delete the habit "${habitName}"? This action cannot be undone.`)) {
      deleteHabit(habitId);
    }
  };

  const [ isAuthOpen , setIsAuthOpen ] = useState(false);

  const handleSignIn = () => {
    setIsAuthOpen(true);
  } 
  
  if (error) {
    return <div className="text-center py-10 text-red-500">Error loading habits: {error.message}</div>;
  }

  if (!user) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-800/50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Build routines that stick.</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Sign in to start tracking your habits.</p>
        <Button variant="default" onClick={handleSignIn} className="mt-6 flex items-center space-x-2">
          <FiLogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Button>
        <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)}/>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Habit Tracker</h1>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange('prev')} aria-label="Previous month">
            <FiChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 w-36 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange('next')} aria-label="Next month">
            <FiChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {loading && <MobileSkeleton />}
        {!loading && habits.map((habit) => (
          <div key={habit.id} className="bg-white dark:bg-slate-800/50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-800 dark:text-slate-100">{habit.name}</span>
              <Menu as="div" className="relative">
                <MenuButton as={Button} variant="ghost" size="icon" className="h-8 w-8">
                  <FiMoreVertical className="h-5 w-5" />
                </MenuButton>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="p-1">
                      <MenuItem>
                        {({ active }) => (
                          <button onClick={() => handleDeleteHabit(habit.id, habit.name)} className={clsx('w-full text-left rounded-md px-2 py-2 text-sm flex items-center', active ? 'bg-red-500 text-white' : 'text-red-500')}>
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>
            <div className="flex justify-between">
              {daysInWeek.map(day => {
                const completed = isHabitCompleted(habit.id, day.toISOString());
                const future = isFuture(day) && !isToday(day);
                return (
                  <div key={day.toISOString()} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{format(day, 'E')}</span>
                    <button
                      onClick={() => !future && toggleHabit(habit.id, day.toISOString())}
                      disabled={future}
                      className={clsx('w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                        completed ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-slate-700',
                        isToday(day) && 'ring-2 ring-blue-500',
                        future && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {completed ? <FiCheck /> : <span className="text-sm font-bold text-gray-500 dark:text-gray-300">{format(day, 'd')}</span>}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto pb-4 rounded-lg bg-white dark:bg-slate-800/50 p-4">
        <div className="inline-block min-w-full align-middle">
          <div className="grid grid-cols-[200px_1fr] gap-2 mb-2 sticky top-0 bg-white dark:bg-slate-800/50 py-2">
            <div className="font-semibold text-sm text-gray-500 dark:text-gray-400 pl-2">HABIT</div>
            <div className="grid grid-cols-31 gap-2">
              {daysInMonth.map(day => (
                <div key={day.toISOString()} className="flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{format(day, 'E')}</span>
                  <span className={clsx("font-bold text-sm", isToday(day) ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300')}>
                    {format(day, 'd')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {loading && <DesktopSkeleton />}

          {!loading && habits.map((habit) => {
            const stats = getHabitStats(habit.id);
            return (
              <div key={habit.id} className="grid grid-cols-[200px_1fr] gap-2 items-center py-2 border-t border-gray-100 dark:border-slate-700/50">
                <div className="pl-2 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-slate-100 truncate">{habit.name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{stats.completed}/{daysInMonth.length} days</p>
                  </div>
                  <Menu as="div" className="relative">
                    <MenuButton as={Button} variant="ghost" size="icon" className="h-8 w-8">
                      <FiMoreVertical className="h-5 w-5" />
                    </MenuButton>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                      <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="p-1">
                          <MenuItem>
                            {({ active }) => (
                              <button onClick={() => handleDeleteHabit(habit.id, habit.name)} className={clsx('w-full text-left rounded-md px-2 py-2 text-sm flex items-center', active ? 'bg-red-500 text-white' : 'text-red-500')}>
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            )}
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Transition>
                  </Menu>
                </div>
                <div className="grid grid-cols-31 gap-2">
                  {daysInMonth.map(day => {
                    const completed = isHabitCompleted(habit.id, day.toISOString());
                    const future = isFuture(day) && !isToday(day);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !future && toggleHabit(habit.id, day.toISOString())}
                        disabled={future}
                        aria-label={`Mark ${habit.name} for ${format(day, 'MMMM d')}`}
                        className={clsx(
                          'w-8 h-8 rounded-lg transition-all duration-150 transform focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                          completed ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600',
                          isToday(day) && 'ring-2 ring-blue-500',
                          future ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        )}
                      >
                        {completed && <FiCheck className="w-5 h-5 mx-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!loading && habits.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Your habit canvas is empty.</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Use the form below to add your first habit!</p>
        </div>
      )}
      <div className="mt-12 border-t border-gray-200 dark:border-slate-700 pt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add a New Habit</h2>
        <form onSubmit={handleAddHabit} className="flex items-center gap-2 max-w-lg">
          <Input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="e.g., Drink 8 glasses of water"
            className="h-11 flex-grow bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <Button type="submit" className="h-11" disabled={!newHabitName.trim() || loading}>
            <FiPlus className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Habits;
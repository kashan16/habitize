"use client";

import React, { useState, Fragment, useMemo } from "react";
import {
  format,
  isFuture,
  isToday,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth
} from "date-fns";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiLogIn,
  FiMoreVertical,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArchive
} from "react-icons/fi";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import clsx from "clsx";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import type { Habit } from "@/types/habit";
import { useHabits } from "@/hooks/useHabits";

const COLOR_PRESETS = [
  { name: 'Sky Blue',   hex: '#3B82F6' },
  { name: 'Mint Green', hex: '#10B981' },
  { name: 'Amber',      hex: '#F59E0B' },
  { name: 'Coral Red',  hex: '#EF4444' },
  { name: 'Purple',     hex: '#8B5CF6' },
  { name: 'Teal',       hex: '#06B6D4' },
];

interface AddHabitFormProps {
  onHabitCreated ?: () => void;
}
const AddHabitForm: React.FC<AddHabitFormProps> = ({ onHabitCreated }) => {
  const [form, setForm] = useState({
    name: "",
    color: COLOR_PRESETS[0].hex,
    habit_type: 'boolean' as 'boolean' | 'counter',
    target_count: 1,
    frequency_type: 'daily' as 'daily' | 'weekly' | 'interval' | 'custom',
    frequency_days: [] as number[],
    frequency_interval_days: 1,
    description: "",
    difficulty_level: 'medium' as 'easy' | 'medium' | 'hard',
    category_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createHabit } = useHabits(format(new Date(), 'yyyy-MM-01'));

  const dayOptions = [0, 1, 2, 3, 4, 5, 6];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const frequencyOptions = ['daily', 'weekly', 'interval', 'custom'] as const;
  const difficultyOptions = ['easy', 'medium', 'hard'] as const;

  const onChange = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createHabit({
        name: form.name.trim(),
        color: form.color,
        habit_type: form.habit_type,
        target_count: form.habit_type === 'counter' ? Math.max(1, form.target_count) : undefined,
        frequency_type: form.frequency_type,
        frequency_days: (form.frequency_type === 'weekly' || form.frequency_type === 'custom') ? form.frequency_days : undefined,
        frequency_interval_days: form.frequency_type === 'interval' ? Math.max(1, form.frequency_interval_days) : undefined,
        description: form.description.trim() || undefined,
        difficulty_level: form.difficulty_level,
        category_id: form.category_id.trim() || undefined
      });
      
      setForm({
        name: "",
        color: COLOR_PRESETS[0].hex,
        habit_type: 'boolean',
        target_count: 1,
        frequency_type: 'daily',
        frequency_days: [],
        frequency_interval_days: 1,
        description: "",
        difficulty_level: 'medium',
        category_id: ""
      });
      
      onHabitCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
      <div className="md:col-span-2">
        <label htmlFor="habit-name" className="block text-sm font-medium mb-1">
          Habit Name
        </label>
        <Input
          id="habit-name"
          value={form.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="e.g., Read for 15 minutes"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Color</label>
        <div className="flex items-center space-x-2">
          {COLOR_PRESETS.map(c => (
            <button
              key={c.hex}
              type="button"
              aria-label={c.name}
              disabled={isSubmitting}
              className={clsx(
                'w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 disabled:hover:scale-100',
                form.color === c.hex ? 'border-gray-800 dark:border-white' : 'border-transparent'
              )}
              style={{ backgroundColor: c.hex }}
              onClick={() => onChange('color', c.hex)}
            />
          ))}
          <input
            type="color"
            value={form.color}
            onChange={e => onChange('color', e.target.value)}
            disabled={isSubmitting}
            className="w-8 h-8 p-0 border-none rounded-full bg-transparent cursor-pointer disabled:cursor-not-allowed"
            aria-label="Custom color picker"
          />
        </div>
      </div>

      <div>
        <label htmlFor="habit-type" className="block text-sm font-medium mb-1">
          Type
        </label>
        <select
          id="habit-type"
          value={form.habit_type}
          onChange={e => onChange('habit_type', e.target.value as "boolean" | "counter")}
          disabled={isSubmitting}
          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="boolean">Done / Not Done</option>
          <option value="counter">Counter</option>
        </select>
      </div>

      {form.habit_type === 'counter' && (
        <div>
          <label htmlFor="target-count" className="block text-sm font-medium mb-1">
            Target
          </label>
          <Input
            id="target-count"
            type="number"
            min={1}
            value={form.target_count}
            onChange={e => onChange('target_count', Math.max(1, Number(e.target.value)))}
            placeholder="e.g., 5"
            disabled={isSubmitting}
          />
        </div>
      )}

      <div>
        <label htmlFor="frequency-type" className="block text-sm font-medium mb-1">
          Frequency
        </label>
        <select
          id="frequency-type"
          value={form.frequency_type}
          onChange={e => onChange('frequency_type', e.target.value as "daily" | "weekly" | "interval" | "custom")}
          disabled={isSubmitting}
          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {frequencyOptions.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
        </select>
      </div>

      {form.frequency_type === 'interval' && (
        <div>
          <label htmlFor="interval-days" className="block text-sm font-medium mb-1">
            Every X Days
          </label>
          <Input
            id="interval-days"
            type="number"
            min={1}
            value={form.frequency_interval_days}
            onChange={e => onChange('frequency_interval_days', Math.max(1, Number(e.target.value)))}
            placeholder="e.g., 3"
            disabled={isSubmitting}
          />
        </div>
      )}

      {(form.frequency_type === 'weekly' || form.frequency_type === 'custom') && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">On These Days</label>
          <div className="flex gap-2 flex-wrap">
            {dayOptions.map(d => (
              <button
                key={d}
                type="button"
                disabled={isSubmitting}
                className={clsx(
                  'px-3 py-1.5 text-sm border rounded-md transition-colors disabled:opacity-50',
                  form.frequency_days.includes(d)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
                )}
                onClick={() => {
                  const arr = form.frequency_days.includes(d)
                    ? form.frequency_days.filter(x => x !== d)
                    : [...form.frequency_days, d].sort();
                  onChange('frequency_days', arr);
                }}
              >{dayNames[d]}</button>
            ))}
          </div>
        </div>
      )}

      <div className="md:col-span-2">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (Optional)
        </label>
        <Input
          id="description"
          value={form.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="Why is this habit important?"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={form.difficulty_level}
          onChange={e => onChange('difficulty_level', e.target.value as "medium" | "easy" | "hard")}
          disabled={isSubmitting}
          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {difficultyOptions.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category (Optional)
        </label>
        <Input
          id="category"
          value={form.category_id}
          onChange={e => onChange('category_id', e.target.value)}
          placeholder="e.g., Health"
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="md:col-span-2 h-10">
        {isSubmitting ? "Creating..." : "Create Habit"}
      </Button>
    </form>
  );
};

interface HabitCellProps {
  habit : Habit;
  date : Date;
  onToggle : (habitId : string , date : string , increment ?: number) => Promise<void>;
  getHabitProgress : (habitId : string , date : string) => {
    count : number;
    target : number;
    percentage : number;
    done : boolean;
  };
}

const HabitCell : React.FC<HabitCellProps> = ({ habit , date , onToggle , getHabitProgress }) => {
  const { count , done } = getHabitProgress(habit.id , date.toISOString());
  const future = isFuture(date) && !isToday(date);
  const [ isUpdating , setIsUpdating ] = useState(false);

  const handleToggle = async () => {
    if(future || isUpdating) return;
    setIsUpdating(true);
    try{
      if(habit.habit_type === 'boolean') {
        await onToggle(habit.id,date.toISOString());
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = async () => {
    if(future || isUpdating) return;
    setIsUpdating(true);
    try {
      if(habit.habit_type === 'counter') {
        await onToggle(habit.id,date.toISOString(),1);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if(future || count <= 0 || isUpdating) return;
    setIsUpdating(true);
    try {
      if(habit.habit_type === 'counter') {
        await onToggle(habit.id,date.toISOString(),-1);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-[2.5rem] h-12">
      {habit.habit_type === 'boolean' ? (
        <button
          disabled={future || isUpdating}
          onClick={handleToggle}
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
            done 
              ? 'text-white shadow-md' 
              : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600',
            isToday(date) && 'ring-2 ring-blue-400 ring-offset-1',
            (future || isUpdating) && 'opacity-50 cursor-not-allowed'
          )}
          style={done ? { backgroundColor: habit.color } : {}}
        >
          {done ? (
            <FiCheck className="w-4 h-4" />
          ) : (
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {format(date, 'd')}
            </span>
          )}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-1">          
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleDecrement} 
              disabled={future || count <= 0 || isUpdating}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            > 
              <FiMinus className="w-3 h-3" /> 
            </button>
            <span className={clsx(
              'text-sm font-semibold min-w-[1.5rem] text-center px-1',
              done ? 'text-white px-2 py-1 rounded' : 'text-gray-700 dark:text-gray-300'
            )}
            style={done ? { backgroundColor: habit.color } : {}}
            >
              {count}
            </span>
            <button 
              onClick={handleIncrement} 
              disabled={future || isUpdating}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            > 
              <FiPlus className="w-3 h-3" /> 
            </button>
          </div>
        </div>
      )}
    </div>    
  )
}

interface HabitRowProps {
  habit : Habit;
  days : Date[];
  onToggle : (habitId : string , date : string , increment ?: number) => Promise<void>;
  onArchive : (habitId : string) => Promise<void>;
  onDelete : (habitId : string) => Promise<void>;
  getHabitProgress : (habitId : string , date : string) =>  {
    count : number;
    target : number;
    percentage : number;
    done : boolean;
  };
}

const HabitRow : React.FC<HabitRowProps> = ({ habit, days, onToggle, onArchive, onDelete, getHabitProgress }) => {
  const [ confirmArchive , setConfirmArchive ] = useState(false);
  const [ confirmDelete , setConfirmDelete ] = useState(false);
  const [ isProcessing , setIsProcessing ] = useState(false);

  const handleArchive = async () => {
    if(!confirmArchive) {
      setConfirmArchive(true);
      return;
    }
    setIsProcessing(true);
    try {
      await onArchive(habit.id);
    } finally {
      setIsProcessing(false);
      setConfirmArchive(false);
    }
  };

  const handleDelete = async () => {
    if(!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsProcessing(true);
    try {
      await onDelete(habit.id);
    } finally {
      setIsProcessing(false);
      setConfirmDelete(false);
    }
  };
  return (
    <div className="grid grid-cols-[240px_1fr] gap-4 items-center py-3 border-t border-gray-100 dark:border-slate-700/50">
      <div className="flex justify-between items-center pr-4">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: habit.color }}
          />
          <div className="min-w-0 flex-1">
            <span className="font-semibold truncate block">{habit.name}</span>
            {habit.description && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                {habit.description}
              </span>
            )}
          </div>
        </div>
        <Menu as="div" className="relative">
          <MenuButton as={Button} variant="ghost" size="icon" className="flex-shrink-0" disabled={isProcessing}>
            <FiMoreVertical className="w-4 h-4"/>
          </MenuButton>
          <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <MenuItems className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black/5 z-10">
              <div className="p-1">
                <MenuItem>{({ active }) => (
                  <button 
                    onClick={handleArchive}
                    disabled={isProcessing}
                    className={clsx(
                      'w-full px-2 py-2 flex items-center text-sm rounded disabled:opacity-50',
                      active ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    )}
                  >
                    <FiArchive className="mr-2 w-4 h-4"/>
                    {confirmArchive ? 'Confirm Archive' : 'Archive'}
                  </button>
                )}</MenuItem>
                <MenuItem>{({ active }) => (
                  <button 
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className={clsx(
                      'w-full px-2 py-2 flex items-center text-sm rounded disabled:opacity-50',
                      active ? 'bg-red-50 dark:bg-red-900/20' : ''
                    )}
                  >
                    <FiTrash2 className="mr-2 w-4 h-4"/>
                    {confirmDelete ? 'Confirm Delete' : 'Delete'}
                  </button>
                )}</MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
      <div className="flex gap-1 overflow-x-auto scrollbar-thin">
        {days.map(d => (
          <HabitCell 
            key={d.toISOString()} 
            habit={habit} 
            date={d} 
            onToggle={onToggle}
            getHabitProgress={getHabitProgress}
          />
        ))}
      </div>
    </div>    
  );
};

export const Habits : React.FC = () => {
  const { user } = useAuth();
  const [ currentMonth , setCurrentMonth ] = useState(new Date());
  const [ authOpen , setAuthOpen ] = useState(false);

  const daysInCurrentMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start , end });
  },[currentMonth]);

  const {
    habits,
    loading,
    error,
    toggleHabit,
    deleteHabit,
    archiveHabit,
    getHabitProgress,
  } = useHabits(format(currentMonth,'yyyy-MM-01'));

  const handleMonthChange = (dir : 'prev' | 'next') => {
    const newMonth = dir === 'prev' ? subMonths(currentMonth,1) : addMonths(currentMonth,1);
    setCurrentMonth(newMonth);
  }

  if(error) {
    return (
      <div className="py-8">
        <div className="text-red-500 bg-red-500 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-semibold">Error loading habits</h3>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if(!user) {
    return <UnauthenticatedView onOpen={() => setAuthOpen(true)} open={authOpen} onClose={() => setAuthOpen(false)}/>;
  }

  return (
    <div className="py-8 max-w-full">
      <header className="flex flex-col sm:flex-row sm:justify-between mb-8">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange('prev')} aria-label="Previous Month">
            <FiChevronLeft className="h-5 w-5"/>
          </Button>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 min-w-[140px] text-center">
            {format(currentMonth,"MMMM yyyy")}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange('next')}>
            <FiChevronRight className="w-5 h-5"/>
          </Button>
        </div>
      </header>
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {loading && <SkeletonGrid rows={3} cols={7} cellClass="bg-gray-200 dark:bg-slate-700/60"/>}
        {!loading && habits.map(h => (
          <MobileRow
            key={h.id}
            habit={h}
            onToggle={(id , date , inc) => 
              toggleHabit(id,date,inc).then(() => undefined)
            }
            onArchive={id => archiveHabit(id).then(() => undefined)}
            onDelete={id => deleteHabit(id).then(() => undefined)}
            getHabitProgress={getHabitProgress}/>
        ))}
      </div>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-[240px_ifr] gap-4 sticky top-0 bg-white dark:bg-slate-800/50 py-4 border-b border-gray-200 dark:border-slate-700 text-center items-center justify-center">
            <div className="flex items-center">
{/*               <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Habits
              </span> */}
            </div>
            <div className="flex gap-1 overflow-x-auto scrollbar-thin">
{/*               {daysInCurrentMonth.map(d => (
                <div
                  key={d.toISOString()}
                  className={clsx(
                    'text-center min-w-[2.5rem] flex-shrink-0 py-1 rounded transition-colors',
                    isToday(d)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300'
                  )}>
                    <div className="text-xs font-medium mb-1">{format(d,'E')}</div>
                    <div className="text-xs font-semibold">{format(d,'d')}</div>
                  </div>
              ))} */}
            </div>
          </div>
          {/* Habit List */}
          <div className="px-4">
            {loading && <SkeletonGrid rows={3} cols={daysInCurrentMonth.length} cellClass="bg-gray-200 dark:bg-slate-700/60"/>}
            {!loading && habits.map(h => (
              <HabitRow
                key={h.id}
                habit={h}
                days={daysInCurrentMonth}
                onToggle={(id,date,inc) => 
                  toggleHabit(id,date,inc).then(() => undefined)
                }
                onArchive={id => archiveHabit(id).then(() => undefined)}
                onDelete={id => deleteHabit(id).then(() => undefined)}
                getHabitProgress={getHabitProgress}/>
            ))}
          </div>
        </div>
      </div>
      {!loading && habits.length === 0 && <EmptyState/>}
      <AddHabitForm/>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}/>
    </div>
  );
};

const SkeletonGrid : React.FC<{ rows : number ; cols : number ; cellClass : string}> = ({ rows , cols , cellClass }) => (
  <div className="space-y-2">
    {Array.from({ length : rows }).map((_,i) => (
      <div key={i} className="grid grid-cols-[240px_1fr] gap-4 items-center py-3">
        <div className={`h-12 rounded-lg ${cellClass} animate-pulse`}/>
        <div className="flex gap-1">
          {Array.from({ length : cols }).map((_,j) => (
            <div key={j} className={`w-10 h-12 rounded-lg ${cellClass} animate-pulse flex-shrink-0`}/>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const UnauthenticatedView: React.FC<{ onOpen(): void; open: boolean; onClose(): void }> = ({ onOpen, open, onClose }) => (
  <div className="py-24 flex flex-col items-center justify-center text-center">
    <h3 className="text-xl font-semibold">Track your progress.</h3>
    <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to get started.</p>
    <Button className="mt-6" onClick={onOpen}><FiLogIn className="mr-2"/>Sign In</Button>
    <AuthModal open={open} onClose={onClose} />
  </div>
);

const EmptyState: React.FC = () => (
  <div className="py-16 text-center border-dashed border-2 border-gray-300 dark:border-slate-600 rounded-lg mt-8">
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No habits yet!</h3>
    <p className="mt-2 text-gray-500 dark:text-gray-400">Add one below to get started.</p>
  </div>
);


const MobileRow: React.FC<{ 
  habit: Habit; 
  onToggle: (habitId: string, date: string, increment?: number) => Promise<void>;
  onArchive: (habitId: string) => Promise<void>;
  onDelete: (habitId: string) => Promise<void>;
  getHabitProgress: (habitId: string, date: string) => {
    count: number;
    target: number;
    percentage: number;
    done: boolean;
  };
}> = ({ habit, onToggle, onArchive, onDelete, getHabitProgress }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Show current week for mobile
  const days = eachDayOfInterval({ 
    start: startOfWeek(new Date(), { weekStartsOn: 1 }), 
    end: endOfWeek(new Date(), { weekStartsOn: 1 }) 
  });

  const handleArchive = async () => {
    setIsProcessing(true);
    try {
      await onArchive(habit.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete(habit.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-800/50 shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: habit.color }}
          />
          <span className="font-semibold truncate">{habit.name}</span>
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleArchive}
            disabled={isProcessing}
          >
            <FiArchive className="w-4 h-4"/>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={isProcessing}
          >
            <FiTrash2 className="w-4 h-4"/>
          </Button>
        </div>
      </div>
      <div className="flex justify-between gap-1">
        {days.map(d => (
          <HabitCell 
            key={d.toISOString()} 
            habit={habit} 
            date={d} 
            onToggle={onToggle}
            getHabitProgress={getHabitProgress}
          />
        ))}
      </div>
    </div>
  );
};


export default Habits;
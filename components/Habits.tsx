'use client';

import React, { useState, Fragment, useMemo, useEffect } from "react";
import {
  format,
  isFuture,
  isToday,
  eachDayOfInterval,
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
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArchive,
  FiMoreVertical,
  FiX
} from "react-icons/fi";
import { Menu, Transition, Dialog, DialogPanel, DialogTitle, RadioGroup, Radio, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Label } from './ui/label';
import clsx from "clsx";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import type { Habit } from "@/types/habit";
import { useHabits } from "@/hooks/useHabits";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const COLOR_PRESETS = [
  { name: 'Sky Blue', hex: '#3B82F6' },
  { name: 'Mint Green', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Coral Red', hex: '#EF4444' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Teal', hex: '#06B6D4' },  
];

interface AddHabitFormProps {
  onHabitCreated : () => void;
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createHabit } = useHabits(format(new Date(), 'yyyy-MM-01'));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const habitTypeOptions = [
    { value: 'boolean', label: 'Done / Not Done' },
    { value: 'counter', label: 'Counter' }
  ] as const;

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Specific Days' },
    { value: 'interval', label: 'Every X Days' }
  ] as const;

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
        frequency_days: form.frequency_type === 'weekly' ? form.frequency_days : undefined,
        frequency_interval_days: form.frequency_type === 'interval' ? form.frequency_interval_days : undefined,
        description: form.description.trim() || undefined,
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
      });
      
      onHabitCreated();
    } catch (error) {
      console.error('Failed to create habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!form.name.trim()) return false;
    if (form.frequency_type === 'weekly' && form.frequency_days.length === 0) return false;
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-y-6">
      <div>
        <Label htmlFor="habit-name">Habit Name</Label>
        <Input 
          id="habit-name" 
          value={form.name} 
          onChange={e => onChange('name', e.target.value)} 
          placeholder="e.g., Read for 15 minutes" 
          required 
          disabled={isSubmitting} 
        />
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex items-center space-x-2">
          {COLOR_PRESETS.map(c => (
            <button 
              key={c.hex} 
              type="button" 
              aria-label={c.name} 
              disabled={isSubmitting}
              className={clsx(
                'w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 disabled:hover:scale-100', 
                form.color === c.hex ? 'border-gray-900 dark:border-white' : 'border-transparent'
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
      
      <RadioGroup value={form.habit_type} onChange={(v) => onChange('habit_type', v)} disabled={isSubmitting}>
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {habitTypeOptions.map(o => (
            <Radio 
              key={o.value} 
              value={o.value} 
              className={({ checked }) => clsx(
                'cursor-pointer rounded-lg px-4 py-2 text-center text-sm font-semibold border-2 transition', 
                checked ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
              )}
            >
              {o.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>

      {form.habit_type === 'counter' && (
        <div>
          <Label htmlFor="target-count">Target Goal</Label>
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
      
      <RadioGroup value={form.frequency_type} onChange={(v: 'daily' | 'weekly' | 'interval' | 'custom') => onChange('frequency_type', v)} disabled={isSubmitting}>
        <Label>Frequency</Label>
        <div className="grid grid-cols-3 gap-2">
          {frequencyOptions.map(o => (
            <Radio 
              key={o.value} 
              value={o.value} 
              className={({ checked }) => clsx(
                'cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold border-2 transition', 
                checked ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
              )}
            >
              {o.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>

      {form.frequency_type === 'interval' && (
        <div>
          <Label htmlFor="interval-days">Every X Days</Label>
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

      {form.frequency_type === 'weekly' && (
        <div>
          <Label>On These Days</Label>
          <div className="flex gap-1.5 flex-wrap">
            {dayNames.map((name, index) => (
              <button 
                key={index} 
                type="button" 
                disabled={isSubmitting}
                className={clsx(
                  'w-10 h-10 text-sm border rounded-lg transition-colors disabled:opacity-50', 
                  form.frequency_days.includes(index) 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
                )}
                onClick={() => {
                  const arr = form.frequency_days.includes(index) 
                    ? form.frequency_days.filter(x => x !== index) 
                    : [...form.frequency_days, index].sort();
                  onChange('frequency_days', arr);
                }}
              >
                {name}
              </button>
            ))}
          </div>
          {form.frequency_type === 'weekly' && form.frequency_days.length === 0 && (
            <p className="text-sm text-red-500 mt-1">Please select at least one day</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input 
          id="description" 
          value={form.description} 
          onChange={e => onChange('description', e.target.value)} 
          placeholder="Why is this habit important?" 
          disabled={isSubmitting} 
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !isFormValid()} 
        className="h-11 text-base font-semibold mt-4"
      >
        {isSubmitting ? "Creating..." : "Create Habit"}
      </Button>
    </form>
  );
};

const AddHabitDialog: React.FC<{ open: boolean, onClose: () => void }> = ({ open, onClose }) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md bg-white dark:bg-slate-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    aria-label="Close"
                  >
                    <span className="sr-only">Close</span>
                    <FiX className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <DialogTitle as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                  Add a New Habit
                </DialogTitle>
                
                <div className="mt-4">
                    <AddHabitForm onHabitCreated={onClose} />
                </div>
                
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>    
  );
};
interface HabitCellProps {
  habit: Habit;
  date: Date;
  onToggle: (habitId: string, date: string, increment?: number) => Promise<void>;
  getHabitProgress: (habitId: string, date: string) => { count: number; target: number; percentage: number; done: boolean; };
}

const HabitCell: React.FC<HabitCellProps> = ({ habit, date, onToggle, getHabitProgress }) => {
  const { count, target } = getHabitProgress(habit.id, date.toISOString());
  const future = isFuture(date) && !isToday(date);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'increment' | 'decrement'; show: boolean }>({ type: 'increment', show: false });

  const handleAction = async (action: () => Promise<void>) => {
    if (future || isUpdating) return;
    setIsUpdating(true);
    try { 
      await action(); 
    } 
    finally { 
      setIsUpdating(false); 
    }
  };

  const showFeedback = (type: 'increment' | 'decrement') => {
    setFeedback({ type, show: true });
    setTimeout(() => setFeedback(prev => ({ ...prev, show: false })), 500);
  };

  const handleIncrement = () => {
    showFeedback('increment');
    handleAction(() => onToggle(habit.id, date.toISOString(), 1));
  };

  const handleDecrement = () => {
    if (count > 0) {
      showFeedback('decrement');
      handleAction(() => onToggle(habit.id, date.toISOString(), -1));
    }
  };

  const handleBooleanToggle = () => handleAction(() => onToggle(habit.id, date.toISOString()));

  const dayText = format(date, 'd');
  const clipPathId = `clip-${habit.id}-${format(date, 'yyyyMMdd')}`;

  if (habit.habit_type === 'boolean') {
    const done = count > 0;
    return (
      <div className="flex-shrink-0 flex flex-col items-center gap-1.5 text-center">
        <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{format(date,'E')}</span>
        <button
          disabled={future || isUpdating}
          onClick={handleBooleanToggle}
          className={clsx(
            'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 group',
            done ? 'text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 bg-opacity-50',
            isToday(date) && !done && 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900',
            (future || isUpdating) && 'opacity-50 cursor-not-allowed',
            'active:scale-95'
          )}
          style={ done ? { backgroundColor : habit.color } : {} }
        >
          <div className="flex flex-col items-center">
            <span className={
              clsx(
                "font-semibold text-xl",
                done ? "text-white" : "text-gray-800 dark:text-gray-200"
              )
            }>{dayText}</span>
            {done && (
              <FiCheck className="w-3 h-3 text-white/80 mt-0.5" />
            )}            
          </div>
        </button>
      </div>
    )
  }

  const fillPercentage = Math.min(count / target, 1);
  
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5 text-center">
      <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{format(date, 'E')}</span>
      <div className="relative">
        <div
          className={clsx(
            'relative rounded-full flex items-center justify-center select-none transition-transform duration-100',
            'w-14 h-14 overflow-hidden',
            isToday(date) && 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900',
            (future || isUpdating) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <svg width="100%" height="100%" viewBox="0 0 56 56" className="absolute inset-0">
            <defs>
              <clipPath id={clipPathId}>
                <rect x="0" y={56 * (1 - fillPercentage)} width="56" height={56 * fillPercentage} />
              </clipPath>
            </defs>
            <circle cx="28" cy="28" r="28" className="text-gray-100 dark:text-slate-700" fill="currentColor"/>
            <circle cx="28" cy="28" r="28" fill={habit.color} clipPath={`url(#${clipPathId})`} />
          </svg>
          <button
            onClick={handleDecrement}
            disabled={future || isUpdating || count === 0}
            className={clsx(
              'absolute left-0 top-0 w-1/2 h-full z-10 flex items-center justify-center',
              'transition-all duration-150 rounded-l-full',
              !future && !isUpdating && count > 0 && 'hover:bg-black/10 active:bg-black/20',
              count === 0 && 'cursor-not-allowed opacity-50'
            )}
            title={count > 0 ? "Tap to decrease" : "Cannot decrease below 0"}
          >
            <FiMinus className={clsx(
              'w-4 h-4 text-white/70 opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100'
            )} />
          </button>

          <button
            onClick={handleIncrement}
            disabled={future || isUpdating}
            className={clsx(
              'absolute right-0 top-0 w-1/2 h-full z-10 flex items-center justify-center',
              'transition-all duration-150 rounded-r-full',
              !future && !isUpdating && 'hover:bg-black/10 active:bg-black/20'
            )}
            title="Tap to increase"
          >
            <FiPlus className={clsx(
              'w-4 h-4 text-white/70 opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100'
            )} />
          </button>
          <div className="relative z-5 flex flex-col items-center justify-center pointer-events-none">
            <span className={clsx(
              "font-semibold text-xl",
              fillPercentage > 0.5 ? "text-white" : "text-gray-800 dark:text-gray-200"
            )}>
              {dayText}
            </span>
            {count > 0 && (
              <span className={clsx(
                "text-xs opacity-80",
                fillPercentage > 0.5 ? "text-white" : "text-gray-500 dark:text-gray-400"
              )}>
                {count}
              </span>
            )}
          </div>
        </div>

        {feedback.show && (
          <div className={clsx(
            'absolute -top-6 left-1/2 transform -translate-x-1/2 z-20',
            'bg-black/80 text-white text-xs px-2 py-1 rounded',
            'animate-pulse'
          )}>
            {feedback.type === 'increment' ? '+1' : '-1'}
          </div>
        )}

      </div>

      {count === 0 && !future && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Tap right to add
        </div>
      )}
    </div>
  );
};

interface HabitRowProps {
  habit: Habit;
  days: Date[];
  onToggle: (habitId: string, date: string, increment?: number) => Promise<void>;
  onArchive: (habitId: string) => Promise<void>;
  onDelete: (habitId: string) => Promise<void>;
  getHabitProgress: (habitId: string, date: string) => { count: number; target: number; percentage: number; done: boolean; };
  isMobile: boolean;
}

const HabitRow : React.FC<HabitRowProps> = ({
  habit,
  days,
  onToggle,
  onArchive,
  onDelete,
  getHabitProgress,
  isMobile
}) => {
  const [confirmAction, setConfirmAction] = useState<'archive' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
    if (!confirmAction) return;

    const timer = setTimeout(() => {
      setConfirmAction(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [confirmAction]);

   const handleArchive = async () => {
    if (confirmAction !== 'archive') {
      setConfirmAction('archive');
      return;
    }

    setIsProcessing(true);
    try {
      await onArchive(habit.id);
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    if (confirmAction !== 'delete') {
      setConfirmAction('delete');
      return;
    }

    setIsProcessing(true);
    try {
      await onDelete(habit.id);
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <div
      className={clsx(
        "group transition-colors",
        isMobile
          ? "flex flex-col bg-white dark:bg-slate-800/70 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700/80 p-4"
          : "grid grid-cols-[minmax(220px,1fr)_minmax(300px,3fr)] py-3 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50/80 dark:hover:bg-slate-800/50"
      )}
      onMouseLeave={() => setConfirmAction(null)}
    >
      <div className={clsx("flex justify-between items-center", isMobile ? "mb-4" : "pr-4 pl-4")}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate text-gray-800 dark:text-gray-100">{habit.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate block">
              {habit.habit_type === 'counter' ? `Goal: ${habit.target_count || 1}` : habit.description || 'Simple Habit'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMobile && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleArchive}
                disabled={isProcessing}
                className={clsx(
                  "h-8 w-8 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 dark:hover:text-amber-400",
                  confirmAction === 'archive' && 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
                )}
                title={confirmAction === 'archive' ? "Click again to confirm archive" : "Archive Habit"}
              >
                <FiArchive className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isProcessing}
                className={clsx(
                  "h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:text-red-400",
                  confirmAction === 'delete' && 'bg-red-500/10 text-red-500 dark:text-red-400'
                )}
                title={confirmAction === 'delete' ? "Click again to confirm delete" : "Delete Habit"}
              >
                <FiTrash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          {isMobile && (
            <Menu as="div" className="relative">
              <MenuButton as={Button} variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8" disabled={isProcessing}>
                <FiMoreVertical className="w-4 h-4" />
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
                <MenuItems className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black/5 z-10 p-1">
                  <MenuItem>
                    {({ active }) => (
                      <button onClick={handleArchive} disabled={isProcessing} className={clsx('w-full px-2 py-2 flex items-center text-sm rounded transition-colors disabled:opacity-50', confirmAction === 'archive' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' : (active && 'bg-gray-100 dark:bg-slate-700'))}>
                        <FiArchive className="mr-2 w-4 h-4" /> {confirmAction === 'archive' ? 'Confirm Archive' : 'Archive'}
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <button onClick={handleDelete} disabled={isProcessing} className={clsx('w-full px-2 py-2 flex items-center text-sm rounded transition-colors disabled:opacity-50 text-red-600 dark:text-red-400', confirmAction === 'delete' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' : (active && 'bg-gray-100 dark:bg-slate-700'))}>
                        <FiTrash2 className="mr-2 w-4 h-4" /> {confirmAction === 'delete' ? 'Confirm Delete' : 'Delete'}
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          )}
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-2">
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
}

export const Habits : React.FC = () => {
  const { user } = useAuth();
  const [ currentMonth , setCurrentMonth ] = useState(new Date());
  const [ authOpen , setAuthOpen ] = useState(false);
  const [ isAddHabitOpen , setIsAddHabitOpen ] = useState(false);

  const isMobile = useMediaQuery('(max-width : 768px)');

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
    getHabitProgress
  } = useHabits(format(currentMonth,'yyyy-MM-01'));

  if (error) {
    return <div className="py-8"><div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-4"><h3 className="font-semibold">Error loading habits</h3><p className="text-sm mt-1">{error.message}</p></div></div>;
  }
  if (!user) {
    return <UnauthenticatedView onOpen={() => setAuthOpen(true)} open={authOpen} onClose={() => setAuthOpen(false)} />;
  }

  return (
    <div className="py-8 max-w-full">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Habit Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Stay consistent, see progress.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous Month"><FiChevronLeft className="h-5 w-5" /></Button>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 min-w-[150px] text-center">{format(currentMonth, "MMMM yyyy")}</h3>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next Month"><FiChevronRight className="w-5 h-5" /></Button>
        </div>
      </header>


      <div className={clsx("mt-8", isMobile ? "space-y-4 px-2" : "bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/80 shadow-sm")}>
        {loading && <div className="p-10 text-center text-gray-500">Loading your habits...</div>}
        
        {!loading && habits.length > 0 && (
          habits.map(h => (
            <HabitRow
              key={h.id} habit={h} days={daysInCurrentMonth}
              onToggle={(id, date, inc) => toggleHabit(id, date, inc).then(() => undefined)}
              onArchive={id => archiveHabit(id).then(() => undefined)}
              onDelete={id => deleteHabit(id).then(() => undefined)}
              getHabitProgress={getHabitProgress}
              isMobile={isMobile}
            />
          ))
        )}
        
        {!loading && habits.length === 0 && (
          <div className={isMobile ? "" : "p-4"}>
            <EmptyState onAddHabit={() => setIsAddHabitOpen(true)} />
          </div>
        )}
        <div className="flex items-center justify-center p-1">
          <Button onClick={() => setIsAddHabitOpen(true)} className="ml-4"><FiPlus className="mr-2 -ml-1"/>Add Habit</Button>
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <AddHabitDialog open={isAddHabitOpen} onClose={() => setIsAddHabitOpen(false)} />  
    </div>
  );
}

const UnauthenticatedView: React.FC<{ onOpen(): void; open: boolean; onClose(): void }> = ({ onOpen, open, onClose }) => (
  <div className="py-24 flex flex-col items-center justify-center text-center">
    <h3 className="text-2xl font-bold">Track your progress.</h3>
    <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to build habits that last.</p>
    <Button className="mt-6" size="lg" onClick={onOpen}><FiLogIn className="mr-2" />Sign In to Get Started</Button>
    <AuthModal open={open} onClose={onClose} />
  </div>
);

const EmptyState: React.FC<{ onAddHabit: () => void }> = ({ onAddHabit }) => (
  <div className="py-16 text-center">
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No habits yet!</h3>
    <p className="mt-2 text-gray-500 dark:text-gray-400">Ready to build a new routine? Add your first habit.</p>
    <Button variant="outline" className="mt-6" onClick={onAddHabit}><FiPlus className="mr-2"/>Add Your First Habit</Button>
  </div>
);

export default Habits;
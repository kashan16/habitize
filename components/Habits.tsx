// Habits.tsx
"use client";

import { useState, Fragment } from "react";
import {
  format,
  isFuture,
  isToday,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek
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
import { useHabitContext } from "@/context/HabitContext";
import type { Habit } from "@/types/habit";
import { useHabits } from "@/hooks/useHabits";

// Preset color swatches
const COLOR_PRESETS = [
  { name: 'Sky Blue',   hex: '#3B82F6' },
  { name: 'Mint Green', hex: '#10B981' },
  { name: 'Amber',      hex: '#F59E0B' },
  { name: 'Coral Red',  hex: '#EF4444' },
  { name: 'Purple',     hex: '#8B5CF6' },
  { name: 'Teal',       hex: '#06B6D4' },
];

// ---------------- Add Habit Form ----------------
const AddHabitForm: React.FC = () => {
  const { createHabit, loading } = useHabitContext();
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

  const dayOptions = [0, 1, 2, 3, 4, 5, 6]; // Sunday: 0, Monday: 1, etc.
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const frequencyOptions = ['daily', 'weekly', 'interval', 'custom'] as const;
  const difficultyOptions = ['easy', 'medium', 'hard'] as const;

  const onChange = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    await createHabit({
      name: form.name,
      color: form.color,
      habit_type: form.habit_type,
      target_count: form.habit_type === 'counter' ? form.target_count : undefined,
      frequency_type: form.frequency_type,
      frequency_days: (form.frequency_type === 'weekly' || form.frequency_type === 'custom') ? form.frequency_days : undefined,
      frequency_interval_days: form.frequency_type === 'interval' ? form.frequency_interval_days : undefined,
      description: form.description,
      difficulty_level: form.difficulty_level,
      category_id: form.category_id || undefined
    });
    // Reset form
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
              className={clsx(
                'w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110',
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
            className="w-8 h-8 p-0 border-none rounded-md bg-transparent cursor-pointer"
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
          onChange={e => onChange('habit_type', e.target.value as any)}
          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={e => onChange('target_count', Number(e.target.value))}
            placeholder="e.g., 5"
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
          onChange={e => onChange('frequency_type', e.target.value as any)}
          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={e => onChange('frequency_interval_days', Number(e.target.value))}
            placeholder="e.g., 3"
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
                className={clsx(
                  'px-3 py-1.5 text-sm border rounded-md transition-colors',
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
        />
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={form.difficulty_level}
          onChange={e => onChange('difficulty_level', e.target.value as any)}
          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        />
      </div>

      <Button type="submit" disabled={loading} className="md:col-span-2 h-10">
        {loading ? "Creating..." : "Create Habit"}
      </Button>
    </form>
  );
};


// ---------------- Habit Cell ----------------
interface HabitCellProps { habit: Habit; date: Date; }
const HabitCell: React.FC<HabitCellProps> = ({ habit, date }) => {
  const { toggleHabit, getHabitProgress } = useHabitContext();
  const { count, target, done } = getHabitProgress(habit.id, date.toISOString());
  const future = isFuture(date) && !isToday(date);
  
  const onToggle = () => { if (!future && habit.habit_type==='boolean') toggleHabit(habit.id, date.toISOString()); };
  const onIncrement = () => { if (!future && habit.habit_type==='counter') toggleHabit(habit.id, date.toISOString(), 1); };
  const onDecrement = () => { if (!future && habit.habit_type==='counter' && count>0) toggleHabit(habit.id, date.toISOString(), -1); };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-400">{format(date,'E')}</span>
      {habit.habit_type==='boolean' ? (
        <button
          disabled={future}
          onClick={onToggle}
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center',
            done ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-slate-700',
            isToday(date) && 'ring-2 ring-blue-500',
            future && 'opacity-50 cursor-not-allowed'
          )}
        >
          {done ? <FiCheck /> : <span className="text-sm font-bold text-gray-500 dark:text-gray-300">{format(date,'d')}</span>}
        </button>
      ) : (
        <div className="flex items-center space-x-1">          
          <button onClick={onDecrement} className="p-1 rounded disabled:opacity-50"> <FiMinus /> </button>
          <span className={clsx('text-sm font-medium', done?'text-blue-600':'text-gray-700')}>{count}</span>
          <button onClick={onIncrement} className="p-1 rounded disabled:opacity-50"> <FiPlus /> </button>
        </div>
      )}
    </div>
  );
};

// ---------------- Habit Row with Archive/Delete ----------------
interface HabitRowProps { habit: Habit; days: Date[]; }
const HabitRow: React.FC<HabitRowProps> = ({ habit, days }) => {
  const { archiveHabit, deleteHabit } = useHabitContext();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="grid grid-cols-[200px_1fr] gap-2 items-center py-2 border-t">
      <div className="flex justify-between items-center">
        <span className="font-semibold truncate">{habit.name}</span>
        <Menu as="div" className="relative">
          <MenuButton as={Button} variant="ghost" size="icon"><FiMoreVertical/></MenuButton>
          <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <MenuItems className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded shadow-lg ring-1 ring-black/5">
              <div className="p-1">
                <MenuItem>{({ active }) => (
                  <button onClick={() => confirmArchive ? archiveHabit(habit.id) : setConfirmArchive(true)} className={clsx('w-full px-2 py-2 flex items-center', active?'bg-yellow-100':'')}>
                    <FiArchive className="mr-2"/>{confirmArchive?'Confirm Archive':'Archive'}
                  </button>
                )}</MenuItem>
                <MenuItem>{({ active }) => (
                  <button onClick={() => confirmDelete ? deleteHabit(habit.id) : setConfirmDelete(true)} className={clsx('w-full px-2 py-2 flex items-center', active?'bg-red-100':'')}>
                    <FiTrash2 className="mr-2"/>{confirmDelete?'Confirm Delete':'Delete'}
                  </button>
                )}</MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
      <div className="grid grid-cols-31 gap-2">
        {days.map(d => <HabitCell key={d.toISOString()} habit={habit} date={d} />)}
      </div>
    </div>
  );
};

// ---------------- Main Component ----------------
export const Habits: React.FC = () => {
  const { user } = useAuth();
  const { habits, loading, error, daysInMonth } = useHabitContext();
  const [authOpen, setAuthOpen] = useState(false);

  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!user) return <UnauthenticatedView onOpen={() => setAuthOpen(true)} open={authOpen} onClose={() => setAuthOpen(false)} />;

  return (
    <div className="py-8">
      <header className="flex flex-col sm:flex-row sm:justify-between mb-8">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <div className="flex gap-2">          
          <Button size="icon"><FiChevronLeft /></Button>
          <Button size="icon"><FiChevronRight /></Button>
        </div>
      </header>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {loading && <SkeletonGrid rows={3} cols={7} cellClass="bg-gray-200 dark:bg-slate-700/60" />}
        {!loading && habits.map(h => <MobileRow key={h.id} habit={h} />)}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto p-4 bg-white dark:bg-slate-800/50 rounded-lg">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[200px_1fr] gap-2 sticky top-0 bg-inherit py-2">
            <span className="text-sm text-gray-500">HABIT</span>
            <div className="grid grid-cols-31 gap-2">              
              {daysInMonth.map(d => <div key={d.toISOString()} className={clsx('text-center', isToday(d)?'text-blue-500':'')}><div className="text-xs">{format(d,'E')}</div><div>{format(d,'d')}</div></div>)}
            </div>
          </div>
          {loading && <SkeletonGrid rows={3} cols={31} cellClass="bg-gray-200 dark:bg-slate-700/60" />}
          {!loading && habits.map(h => <HabitRow key={h.id} habit={h} days={daysInMonth} />)}
        </div>
      </div>

      {!loading && habits.length === 0 && <EmptyState />}

      <AddHabitForm />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

// ---------------- Supporting Components ----------------
const SkeletonGrid: React.FC<{ rows: number; cols: number; cellClass: string }> = ({ rows, cols, cellClass }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-[200px_1fr] gap-2 items-center py-2">
        <div className={`h-10 rounded-lg ${cellClass} animate-pulse`} />
        <div className={`grid grid-cols-${cols} gap-2`}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={`w-8 h-8 rounded-lg ${cellClass} animate-pulse`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const UnauthenticatedView: React.FC<{ onOpen(): void; open: boolean; onClose(): void }> = ({ onOpen, open, onClose }) => (
  <div className="py-24 flex flex-col items-center justify-center text-center">
    <h3 className="text-xl font-semibold">Track your progress.</h3>
    <p className="mt-2">Sign in to get started.</p>
    <Button className="mt-6" onClick={onOpen}><FiLogIn className="mr-2"/>Sign In</Button>
    <AuthModal open={open} onClose={onClose} />
  </div>
);

const EmptyState: React.FC = () => (
  <div className="py-16 text-center border-dashed border-2 rounded-lg">
    <h3 className="text-xl font-semibold">No habits yet!</h3>
    <p className="mt-2">Add one below to get started.</p>
  </div>
);

const MobileRow: React.FC<{ habit: Habit }> = ({ habit }) => {
  const { deleteHabit, archiveHabit } = useHabitContext();
  const days = eachDayOfInterval({ start: startOfWeek(new Date(),{weekStartsOn:1}), end: endOfWeek(new Date(),{weekStartsOn:1}) });
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-800/50 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">{habit.name}</span>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => archiveHabit(habit.id)}><FiArchive/></Button>
          <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)}><FiTrash2/></Button>
        </div>
      </div>
      <div className="flex justify-between">
        {days.map(d => <HabitCell key={d.toISOString()} habit={habit} date={d} />)}
      </div>
    </div>
  );
};

export default Habits;
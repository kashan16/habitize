import { useHabitContext } from "@/context/HabitContext";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { FiActivity, FiAward, FiCheckCircle, FiLogIn, FiTarget, FiTrendingUp } from "react-icons/fi";
import type { IconType } from "react-icons/lib";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface Trend {
  value : number;
  isPositive : boolean;
}

interface StatsCardProps {
  icon : IconType;
  title : string;
  value : string | number;
  footer ?: string;
  colorClass ?: string;
  trend ?: Trend;
}

const StatsCard = ({
  icon: Icon,
  title,
  value,
  footer,
  colorClass = 'text-blue-500',
  trend
}: StatsCardProps) => (
  <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg bg-opacity-100 ${colorClass.replace('text-','bg-')}`}>
        <Icon className={`h-6 w-6 ${colorClass}`}/>
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <FiTrendingUp className={`h-4 w-4 mr-1 ${trend.isPositive ? '' : 'transformed rotate-180'}`}/>
          {Math.abs(trend.value)}
        </div>
      )}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {footer && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{footer}</p>}
      </div>
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_,i) => (
        <div key={i} className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-slate-700"/>
            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-slate-700"/>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-700"/>
            <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-slate-700"/>
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-slate-700"/>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_,i) => (
        <div key={i} className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm animate-pulse">
          <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-slate-700 mb-4"/>
          <div className="h-64 rounded bg-gray-200 dark:bg-slate-700"/>
        </div>
      ))}
    </div>
  </div>
);

// --- Chart Data Types ---
interface DayData {
  date: string;
  completion: number;
  total: number;
  percentage: number;
}

interface HabitBreakdownEntry {
  name: string;
  fullName: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

interface BarTooltipProps {
  payload: { payload: HabitBreakdownEntry }[];
}

const CompletionChart = () => {
  const { habits, daysInMonth } = useHabitContext();

  const chartData = useMemo<DayData[]>(() =>
    daysInMonth.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const completion = habits.reduce((acc, habit) => {
        const log = habit.logs.find(l => l.log_date === dayStr);
        return acc + (log?.done ? 1 : 0);
      }, 0);

      return {
        date: format(day, 'MMM d'),
        completion,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completion / habits.length) * 100) : 0
      };
    }),
  [habits, daysInMonth]);

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Daily Completed Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: 'none', borderRadius: '8px', color: 'white' }}
            formatter={(val: number, name: string) => [ name === 'percentage' ? `${val}%` : val, name === 'percentage' ? 'Completion Rate' : 'Completed Habits' ]}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const HabitBreakdownChart = () => {
  const { habits } = useHabitContext();

  const chartData = useMemo<HabitBreakdownEntry[]>(() =>
    habits.map((habit, idx) => {
      const completedCount = habit.logs.filter(log => log.done).length;
      const totalDays = habit.logs.length;
      const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

      return {
        name: habit.name.length > 15 ? habit.name.slice(0, 15) + '...' : habit.name,
        fullName: habit.name,
        completed: completedCount,
        total: totalDays,
        percentage,
        color: COLORS[idx % COLORS.length]
      };
    }).sort((a, b) => b.percentage - a.percentage)
  ,[habits]);

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Habit Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: 'none', borderRadius: '8px', color: 'white' }}
            formatter={(val: number) => `${val}%`}
            itemSorter={() => 0}
            content={({ payload }: BarTooltipProps) => {
              if (!payload || !payload[0]) return null;
              const entry = payload[0].payload;
              return (
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <div>{entry.fullName}</div>
                  <div>{entry.completed}/{entry.total} days</div>
                  <div>{entry.percentage}%</div>
                </div>
              );
            }}
          />
          <Bar dataKey="percentage" fill="#3B82F6" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );  
};

interface DistributionEntry {
  name: string;
  value: number;
  color: string;
}

const HabitDistributionChart = () => {
  const { habits } = useHabitContext();

  const chartData = useMemo<DistributionEntry[]>(() => {
    const categories = habits.reduce<Record<string, number>>((acc, habit) => {
      const completedCount = habit.logs.filter(log => log.done).length;
      const ratio = habit.logs.length > 0 ? completedCount / habit.logs.length : 0;
      const category =
        completedCount === 0 ? 'Not Started' :
        ratio <= 0.25 ? 'Beginner' :
        ratio <= 0.5 ? 'Developing' :
        ratio <= 0.75 ? 'Strong' : 'Consistent';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categories).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length]
    }));
  }, [habits]);

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Habit Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'rgb(30 41 59)', border: 'none', borderRadius: '8px', color: 'white' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>    
  );
};

const StatsHeader = () => {
  const { daysInMonth } = useHabitContext();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Statistics</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
        {format(daysInMonth[0] || new Date(), 'MMMM yyyy')} insights
      </p>
    </div>    
  );
};

const StatsCards = () => {
  const { habits, daysInMonth } = useHabitContext();
  const stats = useMemo(() => {
    const totalCompletion = habits.reduce((sum, habit) => sum + habit.logs.filter(l => l.done).length, 0);
    const totalPossible = daysInMonth.length * habits.length;
    const overallPercentage = totalPossible > 0 ? Math.round((totalCompletion / totalPossible) * 100) : 0;
    let bestHabit = 'N/A';
    let bestPerc = 0;
    let activeStreaks = 0;
    let totalPct = 0;
    habits.forEach(h => {
      const pct = daysInMonth.length > 0 ? (h.logs.filter(l => l.done).length / daysInMonth.length) * 100 : 0;
      totalPct += pct;
      if (pct > bestPerc) { bestPerc = pct; bestHabit = h.name; }
      if (h.streak && h.streak.current_streak > 0) activeStreaks++;
    });
    const avgCompletion = habits.length > 0 ? Math.round(totalPct / habits.length) : 0;
    return { totalCompletion, overallPercentage, bestHabit, bestHabitPercentage: Math.round(bestPerc), activeStreaks, avgCompletion };
  }, [habits, daysInMonth]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard icon={FiCheckCircle} title="Overall Completion" value={`${stats.overallPercentage}%`} footer={`${stats.totalCompletion} tasks completed this month`} colorClass="text-green-500"/>
      <StatsCard icon={FiTrendingUp} title="Top Performing Habit" value={stats.bestHabit} footer={`${stats.bestHabitPercentage}% completion rate`} colorClass="text-amber-500"/>
      <StatsCard icon={FiTarget} title="Active Habits" value={habits.length} footer="Total habits being tracked" colorClass="text-indigo-500"/>
      <StatsCard icon={FiAward} title="Average Performance" value={`${stats.avgCompletion}%`} footer={`${stats.activeStreaks} habits with active streaks`} colorClass="text-purple-500"/>
    </div>
  );
};

const ChartsSection = () => (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CompletionChart/>
      <HabitDistributionChart/>
    </div>
    <div className="grid grid-cols-1 gap-6 mt-6">
      <HabitBreakdownChart/>
    </div>
  </>
);

const UnauthenticatedView = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-800/50 rounded-lg">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Track your progress.</h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Sign in to view your habit statistics and insights.</p>
      <Button variant="default" onClick={() => setIsAuthOpen(true)} className="mt-6 flex items-center space-x-2">
        <FiLogIn className="h-4 w-4" />
        <span>Sign In</span>
      </Button>
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>    
  );
};

const EmptyState = () => (
  <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
    <FiActivity className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No habits to analyze</h3>
    <p className="text-gray-500 dark:text-gray-400">Add some habits to see your progress statistics and insights.</p>    
  </div>
)

export function Stats() {
  const { user } = useAuth();
  const { habits, loading, error } = useHabitContext();
  
  if (error) {
    return <div className="text-center py-10 text-red-500">Error loading statistics: {error.message}</div>;
  }

  if (!user) {
    return <UnauthenticatedView/>;
  }

  if (loading) {
    return (
      <div className="py-8">
        <StatsHeader/>
        <StatsSkeleton/>
      </div>
    );
  }

  if (!habits.length) {
    return (
      <div className="py-8">
        <StatsHeader/>
        <EmptyState/>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <StatsHeader/>
      <StatsCards/>
      <ChartsSection/>
    </div>
  );
}

export default Stats;

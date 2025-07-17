"use client";
import { useSleepLogs } from "@/hooks/useSleep";
import { format, parseISO, isValid, addMonths, subMonths, startOfMonth, endOfMinute, endOfMonth, addDays } from "date-fns";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart , Area, Line } from "recharts";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/useAuth";

const formatXAxis = (tickItem : string) => {
    const date = parseISO(tickItem);
    return isValid(date) ? format(date,'d') : '';
};

export function SleepGraph() {
    const { user } = useAuth();
    const today = useMemo(() => new Date() , []);
    const [ selectedMonth , setSelectedMonth ] = useState(format(today,"yyyy-MM"));

    const { logs , loading , upsert , mutate } = useSleepLogs(selectedMonth);
    const [ logDate , setLogDate ] = useState(format(today,'yyyy-MM-dd'));
    const [ hours , setHours ] = useState("");

    const chartData = useMemo(() => {
        if(!logs || logs.length === 0) return [];

        const logMap = new Map(logs.map(log => [log.log_date , log.hours]));
        const data = [];
        const monthStart = startOfMonth(new Date(`${selectedMonth}-02`));
        const monthEnd = endOfMonth(monthStart);

        for(let day = monthStart ; day <= monthEnd ; day = addDays(day , 1)) {
            const dateStr = format(day , 'yyyy-MM-dd');
            data.push({
                date : dateStr,
                hours : logMap.has(dateStr) ? logMap.get(dateStr) : null,
            });
        }
        return data;
    },[logs , selectedMonth]);

    const handleDateChange = ( e : React.ChangeEvent<HTMLInputElement> ) => {
        setLogDate(e.target.value);
    }

    const handleHoursChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if(/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 24) {
            setHours(value);
        }
    };

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        const parsedHours = parseFloat(hours);

        if(!logDate || !isValid(parseISO(logDate)) || isNaN(parsedHours) || parsedHours <= 0) {
            toast.error('Please enter valid sleep hours (0-24).');
            return;
        }

        try {
            await upsert({
                log_date : logDate,
                hours : parsedHours,
            });
            mutate();
            toast.success(`Sleep for ${format(parseISO(logDate) , 'MMM d')} saved!`);
            toast.success("Sleep log saved successfulluy!");
            setLogDate(format(today,"yyyy-MM-dd"));
            setHours('');
        } catch(error) {
            console.error("Error saving sleep log : ",error);
            toast.error("Failed to save sleep log. Please try again. ");
        }
    };

    const handleMonthChange = (direction : 'prev' | 'next' ) => {
        const currentMonthDate = parseISO(selectedMonth);
        let newMonthDate;
        if(direction === 'prev') {
            newMonthDate = subMonths(currentMonthDate , 1);
        } else {
            newMonthDate = addMonths(currentMonthDate , 1);
        }
        setSelectedMonth(format(newMonthDate,'yyyy-MM'));
    };

  if(!user) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-800/50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Build routines that stick.
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Sign in to start tracking your sleep.
        </p>
      </div>
    )
  }

    if(loading && !logs.length) {
        return (
            <div className="h-96 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800">
                Loading Sleep Data!
            </div>
        )
    }

    return (
        <div className="py-8">
            <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    Sleep Overview
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange('prev')} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <FiChevronLeft className="h-5 w-5"/>
                    </Button>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 w-32 text-center">
                        {format(parseISO(`${selectedMonth}-01`),"MMMM yyyy")}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange('next')} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <FiChevronRight className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
            <div className="w-full h-80 mb-10">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data = {chartData} margin={{ top : 5 , right : 20 , left : -10 , bottom : 5}}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                            <XAxis
                                dataKey='date'
                                tickFormatter={formatXAxis}
                                style={{ fontSize : '0.75rem'}}
                                tick={{ fill : 'hsl(var(--muted-foreground))'}}
                                axisLine={{ stroke : 'hsl(var(--muted-foreground))'}}
                                interval="preserveStartEnd"/>
                            <YAxis
                                domain={[0,'dataMax + 1']}
                                allowDecimals={false}
                                style={{ fontSize : "0.75rem"}}
                                tick={{ fill : 'hsl(var(--muted-foreground))'}}
                                tickLine={{ stroke : 'hsl(var(--muted-foreground))'}}
                                axisLine={{ stroke : 'hsl(var(--muted-foreground))'}}/>
                            <Tooltip
                                contentStyle={{ backgroundColor : 'hsl(var(--border))' , borderColor : 'hsl(var(--border))' , borderRadius : "0.5rem" , }} 
                                labelFormatter={(label) => format(parseISO(label) , 'eeee, MMM d')}/>
                            <Line
                                className="stroke-blue-500"
                                connectNulls={true}
                                type="monotone"
                                dataKey="hours"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2.5}
                                dot={{ r : 4 , fill : 'hsl(var(--primary))'}}
                                activeDot={{ r : 8 }}/>    
                        </LineChart>
                    </ResponsiveContainer>
                ):(
                    <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-lg font-medium">No sleep data for this month.</p>
                        <p>Input below</p>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 px-2"> 
                <Input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    max={format(today,'yyyy-MM-dd')}
                    className="h-11"/>
                <Input
                    type="number"
                    value={hours}
                    onChange={handleHoursChange}
                    placeholder="Hours slept (e.g., 7.5)"
                    step="0.1"
                    min="0"
                    max="24"
                    className="h-11"/>
                <Button type="submit" className="w-full sm:w-auto h-11" disabled={!logDate || hours === "" || (loading && logs.length > 0)}>
                    <FiPlus className="mr-2 h-4 w-4"/>
                    Save
                </Button>        
            </form>
        </div>
    )
}
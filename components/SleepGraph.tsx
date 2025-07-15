"use client";
import { useSleepLogs } from "@/hooks/useData";
import { format, parseISO, isValid, addMonths, subMonths } from "date-fns";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Input } from "./ui/input";

const formatXAxis = (tickItem : string) => {
    return format(parseISO(tickItem) , "MMM dd");
};

export function SleepGraph() {
    const today = useMemo(() => new Date() , []);
    const [ selectedMonth , setSelectedMonth ] = useState(format(today,"yyyy-MM"));

    const { logs , loading , upsert } = useSleepLogs(selectedMonth);
    const [ selectedDate , setSelectedDate ] = useState(format(today,'yyyy-MM-dd'));
    const [ hours , setHours ] = useState("");

    const chartData = useMemo(() => {
        return [...logs].sort((a,b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()).map((log) => ({
            date : log.log_date,
            hours : log.hours,
        }));
    },[logs]);

    const handleDateChange = ( e : React.ChangeEvent<HTMLInputElement> ) => {
        setSelectedDate(e.target.value);
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

        if(!selectedDate || !isValid(parseISO(selectedDate))) {
            toast.error('Please enter valid sleep hours (0-24).');
            return;
        }

        try {
            await upsert({
                log_date : selectedDate,
                hours : parsedHours,
            });
            toast.success("Sleep log saved successfulluy!");
            setSelectedDate(format(today,"yyyy-MM-dd"));
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

    if(loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                Loading Sleep Data;
            </div>
        )
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sleep Overview</h2>
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => handleMonthChange('prev')} className="px-2 py-1">
                    <FiChevronLeft className="h-5 w-5"/>
                </Button>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{format(parseISO(selectedMonth) , "MMMM yyyy")}</h3>
                <Button variant="ghost" onClick={() => handleMonthChange('next')} className="px-2 py-1">
                    <FiChevronRight className="h-5 w-5"/>
                </Button>
            </div>
            <div className="w-full h-80 mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top : 10 , right : 30 , left : 0 , bottom : 0 }}>
                            <defs>
                                <linearGradient id="colorHours" x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey='date' tickFormatter={formatXAxis} angle={-45} textAnchor="end" height={60} style = {{ fontSize : '0.75rem' , fill : 'var(--text-color-secondary)', }} interval="preserveStartEnd"/>
                            <YAxis label={{ value: "Hours Slept", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: 'var(--text-color-secondary)' }, }}
                                domain={[0, 12]}
                                tickCount={7}
                                style={{
                                    fontSize: '0.75rem',
                                    fill: 'var(--text-color-secondary)',
                                }}
                            />
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "8px", fontSize: '0.875rem', }}
                                itemStyle={{ color: 'var(--text-color-primary)' }}
                                labelFormatter={(label) => format(parseISO(label), "PPP")}/>
                                <Area type="monotone" dataKey="hours" stroke="#8884d8" fillOpacity={1} fill="url(#colorHours)" activeDot={{ r : 8 , stroke : '#8884d8', fill:"#8884d8" }}/>
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                        No Sleep data for this month. Start logging!
                    </div>                    
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Log Your Sleep</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sleep-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date
                        </label>
                        <Input
                            type="date"
                            id="sleep-date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            max={format(today, "yyyy-MM-dd")} // Prevent logging future dates
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="sleep-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Hours Slept
                        </label>
                        <Input
                            type="number"
                            id="sleep-hours"
                            value={hours}
                            onChange={handleHoursChange}
                            placeholder="e.g., 7.5"
                            step="0.1"
                            min="0"
                            max="24"
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition-colors disabled:opacity-50"
                    disabled={!selectedDate || hours === ""}
                >
                    Save Sleep
                </Button>
            </form>            
        </div>
    )
}
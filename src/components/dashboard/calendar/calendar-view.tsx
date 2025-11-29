"use client";

import { getEvents } from "@/actions/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
    events: any[];
}

export function CalendarView({ events }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Simple week padding calculation
    const startDayOfWeek = monthStart.getDay(); // 0 = Sunday
    const emptyDays = Array(startDayOfWeek).fill(null);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const getEventsForDay = (date: Date) => {
        return events.filter(e => isSameDay(new Date(e.start_time), date));
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold w-40 text-center">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                     <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-muted border rounded-lg overflow-hidden flex-1 min-h-[600px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}
                
                {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="bg-background p-2 min-h-[100px]" />
                ))}

                {days.map(day => {
                    const dayEvents = getEventsForDay(day);
                    return (
                        <div key={day.toISOString()} className={cn(
                            "bg-background p-2 min-h-[100px] border-t group hover:bg-muted/5 transition-colors",
                            isToday(day) && "bg-blue-50/30"
                        )}>
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                    isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>
                            <div className="mt-2 space-y-1">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="text-xs p-1 bg-primary/10 text-primary rounded border border-primary/20 truncate cursor-pointer hover:bg-primary/20">
                                        <div className="font-medium truncate">{event.title}</div>
                                        <div className="text-[10px] opacity-80 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {format(new Date(event.start_time), "h:mm a")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

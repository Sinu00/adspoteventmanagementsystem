"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventBooking } from "@/lib/types/database";

interface EventCalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  startDate?: string;
  endDate?: string;
  excludeEventId?: string;
  onStartDateSelect?: (date: string) => void;
  onEndDateSelect?: (date: string) => void;
}

export default function EventCalendar({
  selectedDate,
  onDateSelect,
  startDate,
  endDate,
  excludeEventId,
  onStartDateSelect,
  onEndDateSelect,
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [eventLimit, setEventLimit] = useState(4);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadEventLimit();
    loadEvents();
  }, [currentMonth]);

  const loadEventLimit = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "event_limit_per_day")
      .single();

    if (data) {
      setEventLimit(parseInt(data.value, 10) || 4);
    }
  };

  const loadEvents = async () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data: eventsData } = await supabase
      .from("event_bookings")
      .select("*")
      .gte("start_date", format(monthStart, "yyyy-MM-dd"))
      .lte("end_date", format(monthEnd, "yyyy-MM-dd"));

    if (eventsData) {
      const filteredEvents = excludeEventId
        ? eventsData.filter((e) => e.id !== excludeEventId)
        : eventsData;

      setEvents(filteredEvents as EventBooking[]);

      // Count events per date
      const counts: Record<string, number> = {};
      filteredEvents.forEach((event) => {
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        const days = eachDayOfInterval({ start, end });
        days.forEach((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          counts[dateKey] = (counts[dateKey] || 0) + 1;
        });
      });
      setEventCounts(counts);
    }
    setLoading(false);
  };

  const getDateColor = (date: Date): string => {
    const dateKey = format(date, "yyyy-MM-dd");
    const count = eventCounts[dateKey] || 0;

    // Check if date is in the selected range
    if (startDate && endDate) {
      const dateStr = format(date, "yyyy-MM-dd");
      if (dateStr >= startDate && dateStr <= endDate) {
        return "bg-[#A78BFA]/20 border-[#A78BFA]";
      }
    }

    if (count === 0) {
      return "bg-[#86EFAC]/20 border-[#86EFAC] hover:bg-[#86EFAC]/30";
    } else if (count >= eventLimit) {
      return "bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-60";
    } else if (count >= 2) {
      return "bg-[#FCD34D]/20 border-[#FCD34D] hover:bg-[#FCD34D]/30";
    } else {
      return "bg-[#86EFAC]/20 border-[#86EFAC] hover:bg-[#86EFAC]/30";
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    const dateKey = format(date, "yyyy-MM-dd");
    const count = eventCounts[dateKey] || 0;
    return count >= eventLimit;
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month to determine offset
  const firstDayOfWeek = getDay(monthStart);
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    const dateStr = format(date, "yyyy-MM-dd");
    
    // If we have separate handlers for start/end, use them
    if (onStartDateSelect && onEndDateSelect) {
      // If no start date selected, or clicking before start date, set as start
      if (!startDate || dateStr < startDate) {
        onStartDateSelect(dateStr);
      } else {
        // Otherwise set as end date
        onEndDateSelect(dateStr);
      }
    } else {
      // Use the single handler
      onDateSelect(dateStr);
    }
  };

  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      {/* Calendar Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Days before month start */}
        {daysBeforeMonth.map((date) => (
          <div
            key={format(date, "yyyy-MM-dd")}
            className="aspect-square p-1"
          >
            <div className="h-full rounded-lg bg-gray-50 text-gray-400 text-xs flex items-center justify-center">
              {format(date, "d")}
            </div>
          </div>
        ))}

        {/* Days in month */}
        {daysInMonth.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const count = eventCounts[dateKey] || 0;
          const isSelected = selectedDate && isSameDay(new Date(selectedDate), date);
          const disabled = isDateDisabled(date);
          const isCurrentDay = isToday(date);

          return (
            <div key={dateKey} className="aspect-square p-1">
              <button
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                className={`
                  w-full h-full rounded-lg border-2 text-sm font-medium transition-all duration-200
                  ${getDateColor(date)}
                  ${isSelected ? "ring-2 ring-[#A78BFA] ring-offset-2 bg-[#A78BFA] text-white border-[#A78BFA]" : ""}
                  ${isCurrentDay ? "ring-1 ring-[#A78BFA]" : ""}
                  ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                  ${!disabled && !isSelected ? "hover:scale-105" : ""}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{format(date, "d")}</span>
                  {count > 0 && (
                    <span className="text-xs mt-0.5 font-bold">
                      {count}
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#86EFAC]/20 border border-[#86EFAC]"></div>
            <span className="text-[#6B7280]">0-1 events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#FCD34D]/20 border border-[#FCD34D]"></div>
            <span className="text-[#6B7280]">2-3 events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-[#6B7280]">{eventLimit}+ events (unavailable)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

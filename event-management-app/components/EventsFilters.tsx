"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import type { EventType } from "@/lib/types/database";

interface EventsFiltersProps {
  eventTypes: EventType[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function EventsFilters({ eventTypes, searchParams }: EventsFiltersProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(
    (searchParams.start_date as string) || ""
  );
  const [endDate, setEndDate] = useState((searchParams.end_date as string) || "");
  const [eventTypeId, setEventTypeId] = useState(
    (searchParams.event_type_id as string) || ""
  );
  const [paymentStatus, setPaymentStatus] = useState(
    (searchParams.payment_status as string) || ""
  );

  const hasActiveFilters =
    startDate || endDate || eventTypeId || paymentStatus;

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    if (eventTypeId) params.set("event_type_id", eventTypeId);
    if (paymentStatus) params.set("payment_status", paymentStatus);
    router.push(`/events?${params.toString()}`);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setEventTypeId("");
    setPaymentStatus("");
    router.push("/events");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-700"
      >
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              Active
            </span>
          )}
        </div>
        <span className="text-gray-400">{showFilters ? "▲" : "▼"}</span>
      </button>

      {showFilters && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Type</label>
            <select
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Types</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All</option>
              <option value="true">Paid</option>
              <option value="false">Pending</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={applyFilters}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

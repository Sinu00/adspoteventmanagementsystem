"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { EventType } from "@/lib/types/database";

interface EventsFiltersProps {
  eventTypes: EventType[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function EventsFilters({ eventTypes, searchParams }: EventsFiltersProps) {
  const router = useRouter();
  const currentEventTypeId = (searchParams.event_type_id as string) || "";
  const currentPaymentStatus = (searchParams.payment_status as string) || "";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams();
    
    // Preserve existing filters
    if (searchParams.start_date) params.set("start_date", searchParams.start_date as string);
    if (searchParams.end_date) params.set("end_date", searchParams.end_date as string);
    
    // Update the clicked filter
    if (key === "event_type_id") {
      if (value === currentEventTypeId && value) {
        // Deselect if clicking the same chip (and it's not "All")
        // Don't add the filter, effectively removing it
      } else if (value) {
        // Set new value
        params.set("event_type_id", value);
      }
      // If value is empty and current is also empty, do nothing (already on "All")
    } else if (key === "payment_status") {
      if (value === currentPaymentStatus && value) {
        // Deselect if clicking the same chip (and it's not "All")
        // Don't add the filter, effectively removing it
      } else if (value) {
        // Set new value
        params.set("payment_status", value);
      }
      // If value is empty and current is also empty, do nothing (already on "All")
    }
    
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="mb-6">
      {/* Payment Status Chips */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleFilterChange("payment_status", "")}
            className={`h-9 rounded-[18px] px-4 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
              !currentPaymentStatus
                ? "bg-[#1F2937] text-white"
                : "bg-transparent text-[#6B7280] border border-[#E5E7EB]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("payment_status", "true")}
            className={`h-9 rounded-[18px] px-4 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
              currentPaymentStatus === "true"
                ? "bg-[#1F2937] text-white"
                : "bg-transparent text-[#6B7280] border border-[#E5E7EB]"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => handleFilterChange("payment_status", "false")}
            className={`h-9 rounded-[18px] px-4 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
              currentPaymentStatus === "false"
                ? "bg-[#1F2937] text-white"
                : "bg-transparent text-[#6B7280] border border-[#E5E7EB]"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Event Type Chips */}
      <div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleFilterChange("event_type_id", "")}
            className={`h-9 rounded-[18px] px-4 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
              !currentEventTypeId
                ? "bg-[#1F2937] text-white"
                : "bg-transparent text-[#6B7280] border border-[#E5E7EB]"
            }`}
          >
            All Types
          </button>
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleFilterChange("event_type_id", type.id)}
              className={`h-9 rounded-[18px] px-4 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                currentEventTypeId === type.id
                  ? "bg-[#1F2937] text-white"
                  : "bg-transparent text-[#6B7280] border border-[#E5E7EB]"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

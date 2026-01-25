import Link from "next/link";
import { getDateRange, getTimeRange } from "@/lib/utils/date";
import { Calendar, Clock, MapPin, IndianRupee, CheckCircle2, XCircle } from "lucide-react";
import type { EventBooking } from "@/lib/types/database";

interface EventCardProps {
  event: EventBooking;
}

export default function EventCard({ event }: EventCardProps) {
  const isPaid = event.payment_status;

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="group relative overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-md hover:border-[#A78BFA]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-medium text-[#1F2937] truncate group-hover:text-[#A78BFA] transition-colors mb-1">
              {event.title}
            </h3>
            <p className="text-sm font-medium text-[#1F2937] mb-0.5">
              {event.customer?.name || "Unknown Customer"}
            </p>
            <p className="text-xs text-[#6B7280]">
              {event.event_type?.name || "Unknown Type"}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-[12px] px-2 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 ${
              isPaid
                ? "bg-[#86EFAC] text-[#1F2937]"
                : "bg-[#FCD34D] text-[#1F2937]"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 size={14} strokeWidth={2} />
            ) : (
              <XCircle size={14} strokeWidth={2} />
            )}
            {isPaid ? "Paid" : "Pending"}
          </div>
        </div>

        <div className="space-y-2.5 border-t border-[#E5E7EB] pt-4">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Calendar size={16} strokeWidth={2} className="text-[#6B7280] shrink-0" />
            <span className="truncate">{getDateRange(event.start_date, event.end_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Clock size={16} strokeWidth={2} className="text-[#6B7280] shrink-0" />
            <span className="truncate">{getTimeRange(event.start_time, event.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <MapPin size={16} strokeWidth={2} className="text-[#6B7280] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
            <IndianRupee size={18} strokeWidth={2} className="text-[#1F2937] shrink-0" />
            <span className="text-base font-bold text-[#1F2937]">
              {event.total_price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

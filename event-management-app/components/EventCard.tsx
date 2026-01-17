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
    <Link href={`/events/${event.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-blue-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {event.customer?.name || "Unknown Customer"}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {event.event_type?.name || "Unknown Type"}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
              isPaid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 size={14} className="stroke-[2.5]" />
            ) : (
              <XCircle size={14} className="stroke-[2.5]" />
            )}
            {isPaid ? "Paid" : "Pending"}
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>{getDateRange(event.start_date, event.end_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400" />
            <span>{getTimeRange(event.start_time, event.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <IndianRupee size={18} className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              {event.total_price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

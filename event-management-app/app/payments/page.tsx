"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getDateRange } from "@/lib/utils/date";
import { DollarSign, Calendar, CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";
import type { EventBooking } from "@/lib/types/database";

export default function PaymentsPage() {
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    const { data, error } = await supabase
      .from("event_bookings")
      .select(
        `
        *,
        customer:customers(*),
        event_type:event_types(*)
      `
      )
      .eq("payment_status", false)
      .order("start_date", { ascending: true });

    if (data) {
      setEvents(data as EventBooking[]);
    }
    setLoading(false);
  };

  const markAsPaid = async (eventId: string) => {
    const { error } = await supabase
      .from("event_bookings")
      .update({ payment_status: true, updated_at: new Date().toISOString() })
      .eq("id", eventId);

    if (!error) {
      loadPendingPayments();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pb-20">
        <div className="mx-auto max-w-4xl px-5 py-4">
          <p className="text-center text-[#6B7280]">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-4xl px-5 py-4">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="text-[#6B7280]" size={24} strokeWidth={2} />
            <h1 className="text-[24px] font-semibold text-[#1F2937]">Pending Payments</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            {events.length} {events.length === 1 ? "payment" : "payments"} pending
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#86EFAC]/20">
              <CheckCircle2 className="text-[#1F2937]" size={32} strokeWidth={2} />
            </div>
            <p className="text-lg font-semibold text-[#1F2937]">All caught up!</p>
            <p className="mt-1 text-sm text-[#6B7280]">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="group rounded-[16px] border border-[#FCD34D] bg-[#FCD34D]/10 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#1F2937]">{event.title}</h3>
                    <p className="mt-1 text-sm font-medium text-[#1F2937]">
                      {event.customer?.name || "Unknown Customer"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      {event.event_type?.name || "Unknown Type"}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                        <Calendar size={16} strokeWidth={2} className="text-[#6B7280]" />
                        <span>{getDateRange(event.start_date, event.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-base font-bold text-[#1F2937]">
                        <IndianRupee size={18} strokeWidth={2} />
                        <span>{event.total_price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsPaid(event.id)}
                    className="flex items-center gap-2 rounded-[20px] bg-[#A78BFA] px-4 h-11 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C4B5FD] active:scale-95 whitespace-nowrap"
                  >
                    <CheckCircle2 size={16} strokeWidth={2} />
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

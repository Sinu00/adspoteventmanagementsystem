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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="text-gray-600" size={24} />
            <h1 className="text-3xl font-bold text-gray-900">Pending Payments</h1>
          </div>
          <p className="text-sm text-gray-600">
            {events.length} {events.length === 1 ? "payment" : "payments"} pending
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="text-emerald-600" size={32} />
            </div>
            <p className="text-lg font-semibold text-gray-900">All caught up!</p>
            <p className="mt-1 text-sm text-gray-500">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="group rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {event.customer?.name || "Unknown Customer"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {event.event_type?.name || "Unknown Type"}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{getDateRange(event.start_date, event.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-base font-bold text-gray-900">
                        <IndianRupee size={18} />
                        <span>{event.total_price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsPaid(event.id)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    <CheckCircle2 size={16} />
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

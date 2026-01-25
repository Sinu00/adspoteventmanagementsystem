import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import EventCard from "@/components/EventCard";
import { formatDate } from "@/lib/utils/date";
import { Calendar, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import type { EventBooking } from "@/lib/types/database";

async function getDashboardData() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get today's events
  const { data: todayEvents } = await supabase
    .from("event_bookings")
    .select(
      `
      *,
      customer:customers(*),
      event_type:event_types(*)
    `
    )
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_time", { ascending: true });

  // Get upcoming events (after today)
  const { data: upcomingEvents } = await supabase
    .from("event_bookings")
    .select(
      `
      *,
      customer:customers(*),
      event_type:event_types(*)
    `
    )
    .gt("end_date", today)
    .order("start_date", { ascending: true })
    .limit(5);

  // Get pending payments count
  const { count: pendingCount } = await supabase
    .from("event_bookings")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", false);

  return {
    todayEvents: (todayEvents as EventBooking[]) || [],
    upcomingEvents: (upcomingEvents as EventBooking[]) || [],
    pendingCount: pendingCount || 0,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { todayEvents, upcomingEvents, pendingCount } = await getDashboardData();

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-4xl px-5 py-4">
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#1F2937]">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/payments">
            <div className="group relative overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-md active:scale-[0.95]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6B7280]">Pending Payments</p>
                  <p className="mt-2 text-3xl font-bold text-[#1F2937]">{pendingCount}</p>
                </div>
                <div className="rounded-full bg-[#FCD34D]/20 p-3">
                  <DollarSign className="text-[#1F2937]" size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
          </Link>

          <div className="rounded-[16px] border border-[#E5E7EB] bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Today's Events</p>
                <p className="mt-2 text-3xl font-bold text-white">{todayEvents.length}</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Calendar className="text-white" size={24} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B7280]">Upcoming</p>
                <p className="mt-2 text-3xl font-bold text-[#1F2937]">{upcomingEvents.length}</p>
              </div>
              <div className="rounded-full bg-[#86EFAC]/20 p-3">
                <TrendingUp className="text-[#1F2937]" size={24} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Events */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="text-[#6B7280]" size={20} strokeWidth={2} />
            <h2 className="text-[20px] font-semibold text-[#1F2937]">
              Today's Events ({formatDate(new Date())})
            </h2>
          </div>
          {todayEvents.length === 0 ? (
            <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <AlertCircle className="mx-auto text-[#6B7280]" size={32} strokeWidth={2} />
              <p className="mt-3 text-[#6B7280]">No events scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <EventCard key={event.id} event={event as EventBooking} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-[#6B7280]" size={20} strokeWidth={2} />
              <h2 className="text-[20px] font-semibold text-[#1F2937]">Upcoming Events</h2>
            </div>
            {upcomingEvents.length > 0 && (
              <Link
                href="/events"
                className="text-sm text-[#A78BFA] hover:text-[#C4B5FD] font-medium transition-colors duration-200"
              >
                View All →
              </Link>
            )}
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <AlertCircle className="mx-auto text-[#6B7280]" size={32} strokeWidth={2} />
              <p className="mt-3 text-[#6B7280]">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event as EventBooking} />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

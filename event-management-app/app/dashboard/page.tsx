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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/payments">
            <div className="group relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending Payments</p>
                  <p className="mt-2 text-3xl font-bold text-amber-900">{pendingCount}</p>
                </div>
                <div className="rounded-full bg-amber-100 p-3">
                  <DollarSign className="text-amber-600" size={24} />
                </div>
              </div>
            </div>
          </Link>

          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Today's Events</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">{todayEvents.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Upcoming</p>
                <p className="mt-2 text-3xl font-bold text-emerald-900">{upcomingEvents.length}</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-3">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Events */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="text-gray-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900">
              Today's Events ({formatDate(new Date())})
            </h2>
          </div>
          {todayEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto text-gray-400" size={32} />
              <p className="mt-3 text-gray-500">No events scheduled for today</p>
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
        <div>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-gray-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto text-gray-400" size={32} />
              <p className="mt-3 text-gray-500">No upcoming events</p>
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

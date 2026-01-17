import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import EventCard from "@/components/EventCard";
import EventsFilters from "@/components/EventsFilters";
import { Plus, Calendar } from "lucide-react";
import type { EventBooking } from "@/lib/types/database";

async function getEvents(searchParams: { [key: string]: string | string[] | undefined }) {
  const supabase = await createClient();
  let query = supabase
    .from("event_bookings")
    .select(
      `
      *,
      customer:customers(*),
      event_type:event_types(*)
    `
    );

  // Apply filters
  if (searchParams.start_date) {
    query = query.gte("start_date", searchParams.start_date as string);
  }
  if (searchParams.end_date) {
    query = query.lte("end_date", searchParams.end_date as string);
  }
  if (searchParams.event_type_id) {
    query = query.eq("event_type_id", searchParams.event_type_id as string);
  }
  if (searchParams.payment_status !== undefined) {
    const paymentStatus = searchParams.payment_status === "true";
    query = query.eq("payment_status", paymentStatus);
  }

  const { data: events } = await query.order("start_date", { ascending: false });

  // Get event types for filter
  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("*")
    .order("name", { ascending: true });

  return {
    events: (events as EventBooking[]) || [],
    eventTypes: eventTypes || [],
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { events, eventTypes } = await getEvents(searchParams);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="mt-1 text-sm text-gray-600">Manage all your event bookings</p>
          </div>
          <Link
            href="/events/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            Add Event
          </Link>
        </div>

        <EventsFilters eventTypes={eventTypes} searchParams={searchParams} />

        <div className="mt-6 space-y-3">
          {events.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <Calendar className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-500 font-medium">No events found</p>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event as EventBooking} />)
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

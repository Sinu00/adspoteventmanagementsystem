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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const { events, eventTypes } = await getEvents(resolvedSearchParams);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-4xl px-5 py-4">
        {/* Header */}
        <div className="mb-6 flex h-[60px] items-center justify-between">
          <h1 className="text-[24px] font-semibold text-[#1F2937]">Events</h1>
          <Link
            href="/events/new"
            className="flex items-center gap-2 rounded-[20px] bg-[#A78BFA] px-4 h-11 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C4B5FD] active:scale-95"
          >
            <Plus size={18} strokeWidth={2} />
            Add Event
          </Link>
        </div>

        <EventsFilters eventTypes={eventTypes} searchParams={resolvedSearchParams} />

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <Calendar className="mx-auto text-[#6B7280]" size={48} strokeWidth={2} />
              <p className="mt-4 text-[#1F2937] font-medium">No events found</p>
              <p className="mt-1 text-sm text-[#6B7280]">Try adjusting your filters</p>
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

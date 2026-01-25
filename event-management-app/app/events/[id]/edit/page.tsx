import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EventForm from "@/components/EventForm";
import { Edit } from "lucide-react";

async function getFormData(eventId: string) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("event_bookings")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return null;
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("*")
    .order("name", { ascending: true });

  return {
    event,
    customers: customers || [],
    eventTypes: eventTypes || [],
  };
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const formData = await getFormData(params.id);

  if (!formData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-2xl px-5 page-container">
        <div className="mb-6 flex items-center gap-2 pt-4">
          <Edit className="text-[#6B7280]" size={24} strokeWidth={2} />
          <h1 className="text-[24px] font-semibold text-[#1F2937]">Edit Event</h1>
        </div>
        <EventForm
          customers={formData.customers}
          eventTypes={formData.eventTypes}
          event={formData.event}
        />
      </div>
    </div>
  );
}

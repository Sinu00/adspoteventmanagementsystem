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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-2">
          <Edit className="text-gray-600" size={24} />
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
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

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { Plus } from "lucide-react";

async function getFormData() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("*")
    .order("name", { ascending: true });

  return {
    customers: customers || [],
    eventTypes: eventTypes || [],
  };
}

export default async function NewEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { customers, eventTypes } = await getFormData();

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-2xl px-5 py-4">
        <div className="mb-6 flex items-center gap-2">
          <Plus className="text-[#6B7280]" size={24} strokeWidth={2} />
          <h1 className="text-[24px] font-semibold text-[#1F2937]">Add New Event</h1>
        </div>
        <EventForm customers={customers} eventTypes={eventTypes} />
      </div>
    </div>
  );
}

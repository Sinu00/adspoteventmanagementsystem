import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getDateRange, getTimeRange } from "@/lib/utils/date";
import {
  ArrowLeft,
  Edit,
  User,
  Tag,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { EventBooking } from "@/lib/types/database";

async function getEvent(id: string) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("event_bookings")
    .select(
      `
      *,
      customer:customers(*),
      event_type:event_types(*)
    `
    )
    .eq("id", id)
    .single();

  return event as EventBooking | null;
}

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  const isPaid = event.payment_status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/events"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Events
          </Link>
          <Link
            href={`/events/${event.id}/edit`}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 active:scale-95"
          >
            <Edit size={16} />
            Edit
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
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

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <User className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500">Customer</h3>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {event.customer?.name || "N/A"}
                </p>
                {event.customer?.phone && (
                  <p className="mt-0.5 text-sm text-gray-600">{event.customer.phone}</p>
                )}
                {event.customer?.email && (
                  <p className="mt-0.5 text-sm text-gray-600">{event.customer.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5">
                <Tag className="text-purple-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500">Event Type</h3>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {event.event_type?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <Calendar className="text-emerald-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500">Date</h3>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {getDateRange(event.start_date, event.end_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-50 p-2.5">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500">Time</h3>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {getTimeRange(event.start_time, event.end_time)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-50 p-2.5">
                <MapPin className="text-red-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500">Location</h3>
                <p className="mt-1 text-base font-semibold text-gray-900">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-50 p-2.5">
                <IndianRupee className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500">Total Price</h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  ₹{event.total_price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {event.notes && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <FileText className="text-gray-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500">Notes</h3>
                  <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{event.notes}</p>
                </div>
              </div>
            )}

            {event.images && event.images.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-50 p-2.5">
                  <ImageIcon className="text-indigo-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 text-sm font-semibold text-gray-500">Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {event.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Event image ${index + 1}`}
                        className="rounded-lg object-cover shadow-md"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

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
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-2xl px-5 page-container">
        <div className="mb-6 flex items-center justify-between pt-4">
          <Link
            href="/events"
            className="flex items-center gap-2 text-[#FCD34D] hover:text-[#FDE68A] font-medium transition-colors duration-200"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back to Events
          </Link>
          <Link
            href={`/events/${event.id}/edit`}
            className="flex items-center gap-2 rounded-[20px] bg-[#FCD34D] px-4 h-11 text-sm font-medium text-[#1F2937] shadow-sm transition-all duration-200 hover:bg-[#FDE68A] active:scale-95"
          >
            <Edit size={16} strokeWidth={2} />
            Edit
          </Link>
        </div>

        <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <div className="mb-6 flex items-start justify-between">
            <h1 className="text-[20px] font-semibold text-[#1F2937]">{event.title}</h1>
            <div
              className={`flex items-center gap-1.5 rounded-[12px] px-2 py-1.5 text-xs font-semibold whitespace-nowrap ${
                isPaid
                  ? "bg-[#86EFAC] text-[#1F2937]"
                  : "bg-[#FCD34D] text-[#1F2937]"
              }`}
            >
              {isPaid ? (
                <CheckCircle2 size={14} strokeWidth={2} />
              ) : (
                <XCircle size={14} strokeWidth={2} />
              )}
              {isPaid ? "Paid" : "Pending"}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#FCD34D] to-[#FDE68A] p-2.5">
                <User className="text-white" size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-medium text-[#6B7280]">Customer</h3>
                <p className="mt-1 text-base font-medium text-[#1F2937]">
                  {event.customer?.name || "N/A"}
                </p>
                {event.customer?.phone && (
                  <p className="mt-0.5 text-sm text-[#6B7280]">{event.customer.phone}</p>
                )}
                {event.customer?.email && (
                  <p className="mt-0.5 text-sm text-[#6B7280]">{event.customer.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#FCD34D] to-[#FDE68A] p-2.5">
                <Tag className="text-white" size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-medium text-[#6B7280]">Event Type</h3>
                <p className="mt-1 text-base font-medium text-[#1F2937]">
                  {event.event_type?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#86EFAC]/20 p-2.5">
                <Calendar className="text-[#1F2937]" size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-medium text-[#6B7280]">Date</h3>
                <p className="mt-1 text-base font-medium text-[#1F2937]">
                  {getDateRange(event.start_date, event.end_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#FCD34D]/20 p-2.5">
                <Clock className="text-[#1F2937]" size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-medium text-[#6B7280]">Time</h3>
                <p className="mt-1 text-base font-medium text-[#1F2937]">
                  {getTimeRange(event.start_time, event.end_time)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#E5E7EB] p-2.5">
                <MapPin className="text-[#1F2937]" size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-medium text-[#6B7280]">Location</h3>
                <p className="mt-1 text-base font-medium text-[#1F2937]">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#FCD34D]/20 p-2.5">
                <IndianRupee className="text-[#1F2937]" size={20} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-medium text-[#6B7280]">Total Price</h3>
                <p className="mt-1 text-3xl font-bold text-[#1F2937]">
                  ₹{event.total_price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {event.notes && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#E5E7EB] p-2.5">
                  <FileText className="text-[#1F2937]" size={20} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-medium text-[#6B7280]">Notes</h3>
                  <p className="mt-1 text-base text-[#1F2937] whitespace-pre-wrap">{event.notes}</p>
                </div>
              </div>
            )}

            {event.images && event.images.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gradient-to-br from-[#FCD34D] to-[#FDE68A] p-2.5">
                  <ImageIcon className="text-white" size={20} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 text-[13px] font-medium text-[#6B7280]">Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {event.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Event image ${index + 1}`}
                        className="rounded-[16px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
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

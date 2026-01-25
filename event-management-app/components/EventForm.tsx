"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkEventConflict } from "@/lib/utils/validation";
import EventCalendar from "@/components/EventCalendar";
import {
  User,
  Tag,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Plus,
  Phone,
} from "lucide-react";
import type { Customer, EventType, EventBooking } from "@/lib/types/database";

interface EventFormProps {
  customers: Customer[];
  eventTypes: EventType[];
  event?: EventBooking;
}

export default function EventForm({ customers: initialCustomers, eventTypes, event }: EventFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conflictError, setConflictError] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);

  // Convert date and time to datetime-local format
  const formatDateTimeLocal = (date: string, time: string): string => {
    if (!date || !time) return "";
    return `${date}T${time}`;
  };

  // Split datetime-local to date and time
  const splitDateTimeLocal = (datetime: string): { date: string; time: string } => {
    if (!datetime) return { date: "", time: "" };
    const [date, time] = datetime.split("T");
    return { date: date || "", time: time || "" };
  };

  const [formData, setFormData] = useState({
    customer_id: event?.customer_id || "",
    event_type_id: event?.event_type_id || "",
    title: event?.title || "",
    start_datetime: event ? formatDateTimeLocal(event.start_date, event.start_time) : "",
    end_datetime: event ? formatDateTimeLocal(event.end_date, event.end_time) : "",
    location: event?.location || "",
    total_price: event?.total_price || 0,
    payment_status: event?.payment_status || false,
    notes: event?.notes || "",
  });

  // Separate state for price input to allow proper editing
  const [priceInput, setPriceInput] = useState(
    event?.total_price ? event.total_price.toString() : ""
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"start" | "end">("start");

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const selectedCustomer = customers.find((c) => c.id === formData.customer_id);

  // Load customers when new one is created
  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });
    if (data) {
      setCustomers(data as Customer[]);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      setError("Please enter customer name and phone number");
      return;
    }

    setCreatingCustomer(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase
        .from("customers")
        .insert([{ name: newCustomer.name.trim(), phone: newCustomer.phone.trim() }])
        .select()
        .single();

      if (insertError) throw insertError;

      await loadCustomers();

      // Select the newly created customer
      setFormData({ ...formData, customer_id: data.id });
      setSearchQuery(data.name);
      setShowNewCustomerForm(false);
      setNewCustomer({ name: "", phone: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create customer");
    } finally {
      setCreatingCustomer(false);
    }
  };

  const checkConflicts = async () => {
    const start = splitDateTimeLocal(formData.start_datetime);
    const end = splitDateTimeLocal(formData.end_datetime);

    if (!start.date || !end.date || !start.time || !end.time) {
      return;
    }

    const { data: existingEvents } = await supabase
      .from("event_bookings")
      .select("*");

    if (existingEvents) {
      const conflict = checkEventConflict(
        {
          start_date: start.date,
          end_date: end.date,
          start_time: start.time,
          end_time: end.time,
          id: event?.id,
        },
        existingEvents as EventBooking[]
      );

      if (conflict) {
        setConflictError(
          `Conflict detected with event "${conflict.title}" on ${conflict.start_date}`
        );
      } else {
        setConflictError("");
      }
    }
  };

  // Check for conflicts when dates/times change
  useEffect(() => {
    if (formData.start_datetime && formData.end_datetime) {
      checkConflicts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.start_datetime, formData.end_datetime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.customer_id) {
      setError("Please select or create a customer.");
      setLoading(false);
      return;
    }

    const start = splitDateTimeLocal(formData.start_datetime);
    const end = splitDateTimeLocal(formData.end_datetime);

    if (!start.date || !end.date || !start.time || !end.time) {
      setError("Please select start and end date/time.");
      setLoading(false);
      return;
    }

    if (conflictError) {
      setError("Please resolve the scheduling conflict before saving.");
      setLoading(false);
      return;
    }

    // Validate price
    const priceValue = priceInput === "" ? 0 : parseFloat(priceInput);
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        customer_id: formData.customer_id,
        event_type_id: formData.event_type_id,
        title: formData.title,
        start_date: start.date,
        end_date: end.date,
        start_time: start.time,
        end_time: end.time,
        location: formData.location,
        total_price: priceValue,
        payment_status: formData.payment_status,
        notes: formData.notes,
      };

      if (event) {
        const { error } = await supabase
          .from("event_bookings")
          .update({
            ...submitData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("event_bookings").insert([submitData]);
        if (error) throw error;
      }

      router.push("/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    const current = calendarMode === "start" ? formData.start_datetime : formData.end_datetime;
    const { time } = splitDateTimeLocal(current);
    const newDateTime = time ? `${date}T${time}` : `${date}T09:00`;

    if (calendarMode === "start") {
      setFormData({ ...formData, start_datetime: newDateTime });
      // If end date is before start date, update it
      if (formData.end_datetime && formData.end_datetime < newDateTime) {
        setFormData({ ...formData, start_datetime: newDateTime, end_datetime: newDateTime });
      }
    } else {
      setFormData({ ...formData, end_datetime: newDateTime });
    }
    setShowCalendar(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-full max-w-full overflow-hidden"
    >
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {conflictError && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <AlertTriangle size={18} />
          <span>{conflictError}</span>
        </div>
      )}

      {/* Customer Selection with Inline Creation */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">
          <User size={16} className="inline mr-1.5" />
          Customer *
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowCustomerDropdown(true);
            }}
            onFocus={() => setShowCustomerDropdown(true)}
            placeholder="Search customer by name or phone..."
            className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
          />
          {showCustomerDropdown && (
            <div className="absolute z-10 mt-1 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl max-h-60">
              {filteredCustomers.length > 0 ? (
                <>
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, customer_id: customer.id });
                        setSearchQuery(customer.name);
                        setShowCustomerDropdown(false);
                      }}
                      className="block w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone size={12} />
                        {customer.phone}
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No customers found
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowNewCustomerForm(true);
                  setShowCustomerDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-200 flex items-center gap-2"
              >
                <Plus size={16} />
                Add New Customer
              </button>
            </div>
          )}
        </div>

        {/* New Customer Form */}
        {showNewCustomerForm && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-blue-900">Add New Customer</h4>
              <button
                type="button"
                onClick={() => {
                  setShowNewCustomerForm(false);
                  setNewCustomer({ name: "", phone: "" });
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Customer Name *"
                className="w-full max-w-full rounded-[16px] border border-[#FCD34D] bg-white px-3 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
              />
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="Mobile Number *"
                className="w-full max-w-full rounded-[16px] border border-[#FCD34D] bg-white px-3 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
              />
              <button
                type="button"
                onClick={handleCreateCustomer}
                disabled={creatingCustomer}
                className="w-full rounded-[20px] bg-[#FCD34D] h-11 px-4 text-sm font-medium text-[#1F2937] transition-all duration-200 hover:bg-[#FDE68A] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {creatingCustomer ? "Creating..." : "Create Customer"}
              </button>
            </div>
          </div>
        )}

        {selectedCustomer && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
            <CheckCircle2 size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{selectedCustomer.name}</span>
            <span className="text-xs text-blue-700">({selectedCustomer.phone})</span>
          </div>
        )}
      </div>

      {/* Event Type */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">
          <Tag size={16} className="inline mr-1.5" />
          Event Type *
        </label>
        <select
          required
          value={formData.event_type_id}
          onChange={(e) => setFormData({ ...formData, event_type_id: e.target.value })}
          className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
        >
          <option value="">Select event type</option>
          {eventTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
          placeholder="Event title or short description"
        />
      </div>

      {/* Date & Time with Calendar */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">
          <Calendar size={16} className="inline mr-1.5" />
          Date & Time *
        </label>

        {/* Calendar Toggle */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => {
              setShowCalendar(!showCalendar);
              setCalendarMode("start");
            }}
            className="text-sm text-[#FCD34D] hover:text-[#FDE68A] font-medium transition-colors duration-200"
          >
            {showCalendar ? "Hide Calendar" : "Show Calendar"}
          </button>
        </div>

        {/* Calendar Component */}
        {showCalendar && (
          <div className="mb-4">
            <EventCalendar
              selectedDate={splitDateTimeLocal(formData.start_datetime).date}
              onDateSelect={handleDateSelect}
              startDate={splitDateTimeLocal(formData.start_datetime).date}
              endDate={splitDateTimeLocal(formData.end_datetime).date}
              excludeEventId={event?.id}
              onStartDateSelect={(date) => {
                const { time } = splitDateTimeLocal(formData.start_datetime);
                const newDateTime = time ? `${date}T${time}` : `${date}T09:00`;
                setFormData({ ...formData, start_datetime: newDateTime });
              }}
              onEndDateSelect={(date) => {
                const { time } = splitDateTimeLocal(formData.end_datetime);
                const newDateTime = time ? `${date}T${time}` : `${date}T17:00`;
                setFormData({ ...formData, end_datetime: newDateTime });
              }}
            />
          </div>
        )}

        {/* Start Date & Time */}
        <div className="mb-4">
          <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">Start Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.start_datetime}
            onChange={(e) => {
              setFormData({ ...formData, start_datetime: e.target.value });
              // If end datetime is before start, update it
              if (formData.end_datetime && e.target.value > formData.end_datetime) {
                setFormData({ ...formData, start_datetime: e.target.value, end_datetime: e.target.value });
              }
            }}
            className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
          />
        </div>

        {/* End Date & Time */}
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">End Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.end_datetime}
            min={formData.start_datetime}
            onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
            className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">
          <MapPin size={16} className="inline mr-1.5" />
          Location *
        </label>
        <input
          type="text"
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
          placeholder="Event location"
        />
      </div>

      {/* Price */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">
          <IndianRupee size={16} className="inline mr-1.5" />
          Total Price (₹) *
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={priceInput}
          onChange={(e) => {
            const value = e.target.value;
            // Allow empty string for clearing
            setPriceInput(value);
            // Only update formData if value is not empty and is a valid number
            if (value !== "" && value !== "0") {
              const numValue = parseFloat(value);
              if (!isNaN(numValue) && numValue >= 0) {
                setFormData({ ...formData, total_price: numValue });
              }
            }
          }}
          onBlur={(e) => {
            // Ensure valid number on blur
            const value = e.target.value.trim();
            if (value === "" || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
              setPriceInput("");
              setFormData({ ...formData, total_price: 0 });
            } else {
              const numValue = parseFloat(value);
              setPriceInput(numValue.toString());
              setFormData({ ...formData, total_price: numValue });
            }
          }}
          className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border"
          placeholder="0.00"
        />
      </div>

      {/* Payment Status */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={formData.payment_status}
            onChange={(e) => setFormData({ ...formData, payment_status: e.target.checked })}
            className="h-5 w-5 rounded border-[#E5E7EB] text-[#FCD34D] focus:ring-2 focus:ring-[#FCD34D]"
          />
          <div>
            <span className="text-sm font-medium text-[#1F2937]">Payment Received</span>
            <p className="text-xs text-[#6B7280]">Mark this if payment has been collected</p>
          </div>
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full max-w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20 box-border resize-none"
          placeholder="Additional notes..."
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !!conflictError}
          className="flex-1 rounded-[20px] bg-[#FCD34D] h-11 px-6 text-base font-medium text-[#1F2937] shadow-sm transition-all duration-200 hover:bg-[#FDE68A] focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-[20px] border border-[#E5E7EB] bg-transparent h-11 px-6 text-base font-medium text-[#1F2937] transition-all duration-200 hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#E5E7EB]"
        >
          <X size={18} strokeWidth={2} />
          Cancel
        </button>
      </div>
    </form>
  );
}

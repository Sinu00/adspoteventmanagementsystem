"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Settings, Save, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventLimitsPage() {
  const [eventLimit, setEventLimit] = useState(4);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadEventLimit();
  }, []);

  const loadEventLimit = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "event_limit_per_day")
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (data) {
        setEventLimit(parseInt(data.value, 10) || 4);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (eventLimit < 1 || eventLimit > 20) {
      setError("Event limit must be between 1 and 20");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // Try to update first
      const { error: updateError } = await supabase
        .from("settings")
        .update({
          value: eventLimit.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("key", "event_limit_per_day");

      // If update fails (no row exists), insert
      if (updateError) {
        const { error: insertError } = await supabase
          .from("settings")
          .insert([
            {
              key: "event_limit_per_day",
              value: eventLimit.toString(),
              description: "Maximum number of events allowed per day",
            },
          ]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pb-20">
        <div className="mx-auto max-w-2xl px-5 page-container">
          <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)] pt-4">
            <p className="text-[#6B7280]">Loading...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-2xl px-5 page-container">
        <div className="mb-6 pt-4">
          <div className="mb-2 flex items-center gap-2">
            <Settings className="text-[#6B7280]" size={24} strokeWidth={2} />
            <h1 className="text-[24px] font-semibold text-[#1F2937]">Event Limits</h1>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              <AlertCircle size={18} />
              <span>Settings saved successfully!</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Maximum Events Per Day
              </label>
              <p className="mb-3 text-xs text-gray-500">
                Set the maximum number of events that can be scheduled on a single day. 
                Dates with this many or more events will be marked as unavailable (red) in the calendar.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={eventLimit}
                  onChange={(e) => setEventLimit(parseInt(e.target.value, 10) || 1)}
                  className="w-24 rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base font-semibold text-center transition-all duration-200 focus:border-[#FCD34D] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FCD34D]/20"
                />
                <span className="text-[#6B7280]">events per day</span>
              </div>
            </div>

            {/* Color Legend */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <h3 className="mb-3 text-sm font-medium text-[#1F2937]">Calendar Color Guide</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#86EFAC]/20 border border-[#86EFAC]"></div>
                  <span className="text-[#6B7280]">0-1 events (Available)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#FCD34D]/20 border border-[#FCD34D]"></div>
                  <span className="text-[#6B7280]">2-3 events (Limited availability)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-red-100 border border-red-300"></div>
                  <span className="text-[#6B7280]">
                    {eventLimit}+ events (Unavailable - cannot select)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#FCD34D] h-11 px-6 text-base font-medium text-[#1F2937] shadow-sm transition-all duration-200 hover:bg-[#FDE68A] focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Save size={18} strokeWidth={2} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

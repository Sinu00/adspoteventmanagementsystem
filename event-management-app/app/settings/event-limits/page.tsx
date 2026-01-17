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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Settings className="text-gray-600" size={24} />
            <h1 className="text-3xl font-bold text-gray-900">Event Limits</h1>
          </div>
          <p className="text-sm text-gray-600">Configure maximum events per day</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
                  className="w-24 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base font-semibold text-center transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-gray-600">events per day</span>
              </div>
            </div>

            {/* Color Legend */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Calendar Color Guide</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-green-50 border border-green-200"></div>
                  <span className="text-gray-600">0-1 events (Available)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-orange-50 border border-orange-200"></div>
                  <span className="text-gray-600">2-3 events (Limited availability)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-red-100 border border-red-300"></div>
                  <span className="text-gray-600">
                    {eventLimit}+ events (Unavailable - cannot select)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

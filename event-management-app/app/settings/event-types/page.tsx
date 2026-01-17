"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Tag, Plus, Edit2, Trash2, X, FileText } from "lucide-react";
import type { EventType } from "@/lib/types/database";

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    const { data } = await supabase
      .from("event_types")
      .select("*")
      .order("name", { ascending: true });

    if (data) {
      setEventTypes(data as EventType[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEventType) {
      const { error } = await supabase
        .from("event_types")
        .update(formData)
        .eq("id", editingEventType.id);
      if (!error) {
        loadEventTypes();
        setShowForm(false);
        setEditingEventType(null);
        setFormData({ name: "", description: "" });
      }
    } else {
      const { error } = await supabase.from("event_types").insert([formData]);
      if (!error) {
        loadEventTypes();
        setShowForm(false);
        setFormData({ name: "", description: "" });
      }
    }
  };

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType);
    setFormData({
      name: eventType.name,
      description: eventType.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event type?")) {
      const { error } = await supabase.from("event_types").delete().eq("id", id);
      if (!error) {
        loadEventTypes();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Tag className="text-gray-600" size={24} />
              <h1 className="text-3xl font-bold text-gray-900">Event Types</h1>
            </div>
            <p className="text-sm text-gray-600">Manage event categories</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingEventType(null);
              setFormData({ name: "", description: "" });
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            Add Event Type
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEventType ? "Edit Event Type" : "Add Event Type"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingEventType(null);
                  setFormData({ name: "", description: "" });
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="e.g., Marriage, Birthday, Engagement"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {editingEventType ? "Update" : "Add Event Type"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEventType(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {eventTypes.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <Tag className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-500 font-medium">No event types found</p>
              <p className="mt-1 text-sm text-gray-400">Add your first event type to get started</p>
            </div>
          ) : (
            eventTypes.map((eventType) => (
              <div
                key={eventType.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-purple-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{eventType.name}</h3>
                    {eventType.description && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                        <FileText size={14} className="text-gray-400 mt-0.5" />
                        <span>{eventType.description}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(eventType)}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(eventType.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

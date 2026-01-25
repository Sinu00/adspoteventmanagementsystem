"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Users, Plus, Edit2, Trash2, Phone, Mail, FileText, X } from "lucide-react";
import type { Customer } from "@/lib/types/database";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

    if (data) {
      setCustomers(data as Customer[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCustomer) {
      const { error } = await supabase
        .from("customers")
        .update(formData)
        .eq("id", editingCustomer.id);
      if (!error) {
        loadCustomers();
        setShowForm(false);
        setEditingCustomer(null);
        setFormData({ name: "", phone: "", email: "", notes: "" });
      }
    } else {
      const { error } = await supabase.from("customers").insert([formData]);
      if (!error) {
        loadCustomers();
        setShowForm(false);
        setFormData({ name: "", phone: "", email: "", notes: "" });
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      notes: customer.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (!error) {
        loadCustomers();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pb-20">
        <div className="mx-auto max-w-4xl px-5 py-4">
          <p className="text-center text-[#6B7280]">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-4xl px-5 py-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Users className="text-[#6B7280]" size={24} strokeWidth={2} />
              <h1 className="text-[24px] font-semibold text-[#1F2937]">Customers</h1>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCustomer(null);
              setFormData({ name: "", phone: "", email: "", notes: "" });
            }}
            className="flex items-center gap-2 rounded-[20px] bg-[#A78BFA] px-4 h-11 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C4B5FD] active:scale-95"
          >
            <Plus size={18} strokeWidth={2} />
            Add Customer
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#1F2937]">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                  setFormData({ name: "", phone: "", email: "", notes: "" });
                }}
                className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1F2937] transition-colors duration-200"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#A78BFA] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#A78BFA] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#A78BFA] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#1F2937]">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-base transition-all duration-200 focus:border-[#A78BFA] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-[20px] bg-[#A78BFA] h-11 px-6 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#C4B5FD] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:ring-offset-2 active:scale-95"
                >
                  {editingCustomer ? "Update" : "Add Customer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCustomer(null);
                    setFormData({ name: "", phone: "", email: "", notes: "" });
                  }}
                  className="flex items-center gap-2 rounded-[20px] border border-[#E5E7EB] bg-transparent h-11 px-6 text-base font-medium text-[#1F2937] transition-all duration-200 hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#E5E7EB]"
                >
                  <X size={18} strokeWidth={2} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {customers.length === 0 ? (
            <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <Users className="mx-auto text-[#6B7280]" size={48} strokeWidth={2} />
              <p className="mt-4 text-[#1F2937] font-medium">No customers found</p>
              <p className="mt-1 text-sm text-[#6B7280]">Add your first customer to get started</p>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-md hover:border-[#A78BFA]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-[16px] font-medium text-[#1F2937]">{customer.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <Phone size={14} strokeWidth={2} className="text-[#6B7280]" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <Mail size={14} strokeWidth={2} className="text-[#6B7280]" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.notes && (
                        <div className="flex items-start gap-2 text-sm text-[#6B7280] mt-2">
                          <FileText size={14} strokeWidth={2} className="text-[#6B7280] mt-0.5" />
                          <span>{customer.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="flex items-center gap-1.5 rounded-[20px] bg-[#A78BFA] px-3 h-9 text-sm font-medium text-white transition-all duration-200 hover:bg-[#C4B5FD] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:ring-offset-2 active:scale-95"
                    >
                      <Edit2 size={14} strokeWidth={2} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="flex items-center gap-1.5 rounded-[20px] bg-red-600 px-3 h-9 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-95"
                    >
                      <Trash2 size={14} strokeWidth={2} />
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

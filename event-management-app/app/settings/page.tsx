import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import { Users, Tag, LogOut, Settings as SettingsIcon, Calendar } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <SettingsIcon className="text-gray-600" size={24} />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-sm text-gray-600">Manage your master data and account</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/settings/customers"
            className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Customer Master</h2>
                  <p className="mt-1 text-sm text-gray-600">Manage customers</p>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                →
              </div>
            </div>
          </Link>

          <Link
            href="/settings/event-types"
            className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-purple-100 p-3">
                  <Tag className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Event Type Master</h2>
                  <p className="mt-1 text-sm text-gray-600">Manage event types</p>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-purple-600 transition-colors">→</div>
            </div>
          </Link>

          <Link
            href="/settings/event-limits"
            className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-orange-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-orange-100 p-3">
                  <Calendar className="text-orange-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Event Limits</h2>
                  <p className="mt-1 text-sm text-gray-600">Configure maximum events per day</p>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-orange-600 transition-colors">→</div>
            </div>
          </Link>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3">
                <LogOut className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account</h2>
                <p className="mt-1 text-sm text-gray-600">Sign out of your account</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

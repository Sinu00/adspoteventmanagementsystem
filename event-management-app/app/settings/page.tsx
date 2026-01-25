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
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="mx-auto max-w-2xl px-5 py-4">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <SettingsIcon className="text-[#6B7280]" size={24} strokeWidth={2} />
            <h1 className="text-[24px] font-semibold text-[#1F2937]">Settings</h1>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/settings/customers"
            className="group block rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-md hover:border-[#A78BFA]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] p-3">
                  <Users className="text-white" size={24} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[16px] font-medium text-[#1F2937]">Customer Master</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Manage customers</p>
                </div>
              </div>
              <div className="text-[#6B7280] group-hover:text-[#A78BFA] transition-colors duration-200">
                →
              </div>
            </div>
          </Link>

          <Link
            href="/settings/event-types"
            className="group block rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-md hover:border-[#A78BFA]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] p-3">
                  <Tag className="text-white" size={24} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[16px] font-medium text-[#1F2937]">Event Type Master</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Manage event types</p>
                </div>
              </div>
              <div className="text-[#6B7280] group-hover:text-[#A78BFA] transition-colors duration-200">→</div>
            </div>
          </Link>

          <Link
            href="/settings/event-limits"
            className="group block rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:shadow-md hover:border-[#A78BFA]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] p-3">
                  <Calendar className="text-white" size={24} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[16px] font-medium text-[#1F2937]">Event Limits</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Configure maximum events per day</p>
                </div>
              </div>
              <div className="text-[#6B7280] group-hover:text-[#A78BFA] transition-colors duration-200">→</div>
            </div>
          </Link>

          <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3">
                <LogOut className="text-red-600" size={24} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[16px] font-medium text-[#1F2937]">Account</h2>
                <p className="mt-1 text-sm text-[#6B7280]">Sign out of your account</p>
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Plus, DollarSign, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/events/new", label: "Add", icon: Plus },
  { href: "/payments", label: "Payments", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center pb-4 safe-area-pb">
      <div className="mx-4 rounded-full bg-[#1F2937] shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="flex h-[70px] items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200"
              >
                <div className={`flex items-center justify-center ${isActive ? "w-12 h-12 rounded-full bg-white" : ""}`}>
                  <Icon
                    size={24}
                    strokeWidth={2}
                    className={isActive ? "text-[#1F2937]" : "text-white"}
                  />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "font-semibold text-white" : "text-white"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

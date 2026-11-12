"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionUser } from "@/services/sessionAuth";
import {
  HomeIcon,
  GridIcon,
  TagIcon,
  HeartIcon,
  MailIcon,
  CreditCardIcon,
  UserIcon,
  HelpCircleIcon,
  LogoutIcon,
  ShieldCheckIcon,
} from "./Icons";

export default function BuyerSidebar({ className = "" }) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionUser = useSessionUser();

  const navItems = [
    {
      label: "Dashboard",
      href: "/buyer/dashboard",
      icon: HomeIcon,
      active: pathname === "/buyer/dashboard",
    },
    {
      label: "Marketplace",
      href: "/marketplace",
      icon: GridIcon,
      active: pathname === "/marketplace" || pathname === "/buyer/marketplace",
    },
    {
      label: "Categories",
      href: "/buyer/categories",
      icon: TagIcon,
      active: pathname.startsWith("/buyer/categories"),
    },
    {
      label: "Saved Products",
      href: "/buyer/saved",
      icon: HeartIcon,
      active: pathname === "/buyer/saved" || pathname === "/marketplace/saved",
    },
    {
      label: "My Enquiries",
      href: "/buyer/enquiries",
      icon: MailIcon,
      active: pathname.startsWith("/buyer/enquiries"),
    },
    {
      label: "Seller Access",
      href: "/buyer/subscription",
      icon: CreditCardIcon,
      active: pathname === "/buyer/subscription",
    },
    {
      label: "Buyer Profile",
      href: "/buyer/profile",
      icon: UserIcon,
      active: pathname === "/buyer/profile",
    },
    {
      label: "Help & Support",
      href: "/buyer/help",
      icon: HelpCircleIcon,
      active: pathname === "/buyer/help",
    },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
      router.push("/login");
    }
  };

  const displayName = sessionUser?.name || "Sherlin A";
  const displayEmail = sessionUser?.email || "sherlinzenith@gmail.com";
  const displayRole = sessionUser?.buyerType || sessionUser?.role || "Food Processor";

  return (
    <aside className={`w-full md:w-64 shrink-0 ${className}`}>
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-6 sticky top-24">
        {/* Buyer Identity Card */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
          <div className="relative w-16 h-16 rounded-full bg-[#174B35] text-white flex items-center justify-center text-xl font-black shadow-inner ring-4 ring-emerald-50 mb-3">
            <span>{displayName.charAt(0).toUpperCase()}</span>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 leading-snug">{displayName}</h3>
          <p className="text-xs text-gray-400 truncate max-w-full">{displayEmail}</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[10px] font-bold">
            <ShieldCheckIcon className="w-3 h-3 text-emerald-700" />
            <span>{displayRole}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.active;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-[#174B35] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-semibold"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-gray-100 space-y-1">
          <Link
            href="/get-started"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#174B35] hover:bg-emerald-50 transition-colors"
          >
            <span>Role Switcher</span>
            <span>&rarr;</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <LogoutIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}


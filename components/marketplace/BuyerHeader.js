"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRD_CATEGORIES } from "@/data/marketplaceCatalog";
import { useSessionUser } from "@/services/sessionAuth";
import { getBuyerEnquiries } from "@/services/enquiryApi";
import { getBuyerAccessEntitlement } from "@/services/sellerAccessApi";
import {
  SearchIcon,
  HeartIcon,
  MailIcon,
  BellIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CloseIcon,
  SproutIcon,
  CheckIcon,
  UserIcon,
  CreditCardIcon,
  HelpCircleIcon,
} from "./Icons";

export default function BuyerHeader({
  initialSearch = "",
  initialCategory = "All Categories",
  onSearch,
  onOpenPostRequirement,
  onOpenSellerAccess,
  onOpenProfile,
  onOpenHelp,
}) {
  const router = useRouter();
  const sessionUser = useSessionUser();

  // Search input & selected category dropdown
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchCategory, setSearchCategory] = useState(initialCategory);

  // Deliver to location state (from session or default)
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    return sessionUser?.location?.city
      ? `${sessionUser.location.city}, ${sessionUser.location.pinCode || "642001"}`
      : "Pollachi, 642001";
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editCity, setEditCity] = useState("Pollachi");
  const [editPincode, setEditPincode] = useState("642001");

  // Dynamic counts for Saved, Enquiries, Alerts, Quota
  const [savedCount, setSavedCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [alertCount, setAlertCount] = useState(2);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(10);

  // Dropdown states
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const categoryTimeoutRef = useRef(null);

  // Sync session user location if changes
  useEffect(() => {
    if (sessionUser?.location?.city) {
      setDeliveryLocation(`${sessionUser.location.city}, ${sessionUser.location.pinCode || "642001"}`);
      setEditCity(sessionUser.location.city);
      setEditPincode(sessionUser.location.pinCode || "642001");
    }
  }, [sessionUser]);

  // Load Saved count & Enquiry count & Quota
  useEffect(() => {
    const updateCounts = async () => {
      // Saved count
      try {
        const raw = localStorage.getItem("ulavan_saved_products");
        if (raw) {
          const arr = JSON.parse(raw);
          setSavedCount(Array.isArray(arr) ? arr.length : 0);
        }
      } catch (e) {}

      // Enquiries count
      try {
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const res = await getBuyerEnquiries(buyerId);
        if (res.success && Array.isArray(res.data)) {
          setEnquiryCount(res.data.length);
        }
      } catch (e) {}

      // Quota remaining
      try {
        const buyerId = sessionUser?.id || sessionUser?.applicationId || "BUY_CURRENT_USER";
        const ent = await getBuyerAccessEntitlement(buyerId);
        if (ent && typeof ent.viewsRemaining === "number") {
          setQuotaRemaining(ent.viewsRemaining);
        }
      } catch (e) {}
    };

    updateCounts();

    const handleSavedChanged = () => updateCounts();
    const handleEnquirySubmitted = () => updateCounts();
    window.addEventListener("ulavan_saved_changed", handleSavedChanged);
    window.addEventListener("ulavan_enquiry_submitted", handleEnquirySubmitted);

    return () => {
      window.removeEventListener("ulavan_saved_changed", handleSavedChanged);
      window.removeEventListener("ulavan_enquiry_submitted", handleEnquirySubmitted);
    };
  }, [sessionUser]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, searchCategory);
    } else {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (searchCategory && searchCategory !== "All Categories") params.set("category", searchCategory);
      router.push(`/marketplace?${params.toString()}`);
    }
  };

  const handleCategoryHover = (catName) => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    setActiveCategoryDropdown(catName);
  };

  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setActiveCategoryDropdown(null);
    }, 200);
  };

  const handleSaveLocation = () => {
    if (editCity.trim()) {
      setDeliveryLocation(`${editCity.trim()}, ${editPincode.trim() || "642001"}`);
      setIsLocationModalOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-2xs font-sans">
      {/* ======================================================== */}
      {/* MAIN TOP BAR (Screenshot 6 Reference): Logo | Nav | Search | Avatar */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <Link href="/marketplace" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center relative shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-[#174B35]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
          <span className="text-xl font-black text-[#174B35] tracking-tight">
            UlavanSanthai
          </span>
        </Link>

        {/* Middle: Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
          <Link
            href="/buyer/dashboard"
            className="hover:text-[#174B35] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/marketplace"
            className="text-[#174B35] font-bold border-b-2 border-[#174B35] pb-0.5"
          >
            Marketplace
          </Link>
          <Link href="/buyer/categories" className="hover:text-[#174B35] transition-colors">
            Categories
          </Link>
          <Link href="/buyer/sellers" className="hover:text-[#174B35] transition-colors">
            Suppliers
          </Link>
          <Link
            href="/buyer/help"
            className="hover:text-[#174B35] transition-colors"
          >
            Help &amp; Resources
          </Link>
        </nav>

        {/* Right: Search Input + Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 md:flex-initial justify-end">
          {/* Search Input matching Screenshot 6 */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-xs w-full hidden sm:block"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, categories..."
              className="w-full h-9.5 pl-3.5 pr-9 text-xs rounded-full border border-gray-300 focus:border-[#174B35] outline-none bg-gray-50/70 focus:bg-white text-gray-800 placeholder:text-gray-400 transition-all shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#174B35] cursor-pointer"
              title="Search catalog"
            >
              <SearchIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Quick links: Saved & Enquiries */}
          <Link
            href="/buyer/saved"
            className="p-1.5 rounded-full text-gray-600 hover:text-[#174B35] hover:bg-gray-100 transition-colors relative"
            title="Saved Products"
          >
            <HeartIcon className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </Link>

          <Link
            href="/buyer/enquiries"
            className="p-1.5 rounded-full text-gray-600 hover:text-[#174B35] hover:bg-gray-100 transition-colors relative"
            title="My Enquiries"
          >
            <MailIcon className="w-5 h-5" />
            {enquiryCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#174B35] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {enquiryCount}
              </span>
            )}
          </Link>

          {/* 3. Alerts (Unread Count) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsAlertsOpen(!isAlertsOpen);
                setIsProfileOpen(false);
              }}
              className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-gray-700 hover:text-[#174B35] hover:bg-gray-50 transition-colors relative cursor-pointer"
              title="Platform Alerts & Notifications"
            >
              <div className="relative">
                <BellIcon className="w-5 h-5" />
                {alertCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {alertCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-0.5 hidden md:block">Alerts</span>
            </button>

            {/* Alerts Dropdown Modal */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="font-extrabold text-sm text-gray-900">Procurement Alerts</span>
                  <button
                    type="button"
                    onClick={() => setAlertCount(0)}
                    className="text-[11px] text-[#174B35] font-bold hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                </div>
                <div className="divide-y divide-gray-100 text-xs">
                  <div className="py-2.5 space-y-1">
                    <div className="font-bold text-gray-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <SproutIcon className="w-3.5 h-3.5 text-[#174B35]" />
                        <span>New Harvest Available</span>
                      </span>
                      <span className="text-[10px] text-gray-400">10m ago</span>
                    </div>
                    <p className="text-gray-600 text-[11px]">
                      Kongu Natural Organic Farms posted 2.5 MT fresh Salem Turmeric.
                    </p>
                  </div>
                  <div className="py-2.5 space-y-1">
                    <div className="font-bold text-gray-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Seller Views Available</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Active</span>
                    </div>
                    <p className="text-gray-600 text-[11px]">
                      You have <strong>{quotaRemaining} of 10 seller views</strong> remaining.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Profile Dropdown (My Seller Access, My Business Profile, Help & Support) */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsAlertsOpen(false);
              }}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/60 hover:bg-white transition-all cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-full bg-[#174B35] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                <span>{sessionUser?.name ? sessionUser.name.charAt(0).toUpperCase() : "S"}</span>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                  {sessionUser?.name || "Verified Buyer"}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold leading-none">
                  {quotaRemaining} Views Left
                </span>
              </div>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {/* User Info Header */}
                <div className="p-3 bg-[#F5F5EB] rounded-xl mb-1 space-y-0.5">
                  <div className="font-extrabold text-gray-900">{sessionUser?.name || "Buyer Member"}</div>
                  <div className="text-[11px] text-gray-500 truncate">{sessionUser?.email || "buyer@ulavansanthai.in"}</div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase mt-1 flex items-center gap-1">
                    <ShieldCheckIcon className="w-3 h-3 text-emerald-700" />
                    <span>Verified Platform Member (Rs 365 Paid)</span>
                  </div>
                </div>

                {/* Menu Action Items */}
                <div className="space-y-0.5">
                  <Link
                    href="/buyer/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 font-bold text-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span>Buyer Dashboard</span>
                  </Link>

                  <Link
                    href="/buyer/subscription"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#E8F0E3] hover:text-[#174B35] font-bold text-gray-700 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCardIcon className="w-4 h-4 text-gray-500" />
                      <span>My Seller Access</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#174B35] text-white text-[10px] font-black">
                      {quotaRemaining} left
                    </span>
                  </Link>

                  <Link
                    href="/buyer/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 font-bold text-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span>My Business Profile</span>
                  </Link>

                  <Link
                    href="/buyer/help"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 font-bold text-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <HelpCircleIcon className="w-4 h-4 text-gray-500" />
                    <span>Help &amp; Support</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1 pt-1 space-y-0.5">
                    <Link
                      href="/get-started"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-[#174B35] bg-[#E8F0E3]/50 hover:bg-[#E8F0E3] font-bold transition-colors"
                    >
                      <span>Switch Role (Buyer / Seller)</span>
                      <span>&rarr;</span>
                    </Link>
                    <Link
                      href="/seller/dashboard"
                      className="block px-3 py-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium"
                    >
                      Open Seller Dashboard &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE ROW: Search Bar on small screens                 */}
      {/* ======================================================== */}
      <div className="sm:hidden px-3 pb-2 pt-0">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center rounded-xl border border-[#174B35]/40 bg-white overflow-hidden shadow-2xs"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commodities or suppliers..."
            className="flex-1 h-9 px-3 text-xs text-gray-900 outline-none"
          />
          <button
            type="submit"
            className="h-9 px-3.5 bg-[#174B35] text-white text-xs font-bold"
          >
            <SearchIcon className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: The 5 BRD Categories | Verified | Post Req       */}
      {/* ======================================================== */}
      <div className="bg-[#F8FAF7] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-1.5 sm:py-2 gap-4 text-xs font-bold">
          {/* Left: The Five BRD Categories with Dropdown */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {BRD_CATEGORIES.map((cat) => {
              const isDropdownActive = activeCategoryDropdown === cat.name;
              return (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => handleCategoryHover(cat.name)}
                  onMouseLeave={handleCategoryLeave}
                >
                  <Link
                    href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                      searchCategory === cat.name
                        ? "bg-[#174B35] text-white"
                        : "text-gray-700 hover:text-[#174B35] hover:bg-white"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({cat.count})</span>
                    <ChevronDownIcon className="w-3 h-3 opacity-60" />
                  </Link>

                  {/* Mega-Dropdown for Subcategories */}
                  {isDropdownActive && (
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in duration-150 space-y-2">
                      <div className="pb-1 border-b border-gray-100">
                        <div className="font-extrabold text-gray-900 text-xs">{cat.name}</div>
                        <div className="text-[10px] text-gray-400">{cat.tamilName}</div>
                      </div>
                      <div className="space-y-1">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub}
                            href={`/marketplace?category=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub)}`}
                            className="block px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-[#174B35] text-gray-600 text-xs font-medium transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                      <div className="pt-1.5 border-t border-gray-100">
                        <Link
                          href={`/buyer/categories?id=${cat.id}`}
                          className="text-[11px] font-bold text-[#174B35] hover:underline block text-center"
                        >
                          View Full Category Guide &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Verified Suppliers & Post a Requirement */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/marketplace?verifiedOnly=true"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-[#174B35] hover:bg-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <CheckCircleIcon className="w-3.5 h-3.5 text-[#174B35]" />
              <span>Verified Suppliers</span>
            </Link>

            <button
              type="button"
              onClick={onOpenPostRequirement}
              className="px-3.5 py-1.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-extrabold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>+</span>
              <span>Post Requirement</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Deliver To Location Modal                               */}
      {/* ======================================================== */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-extrabold text-base text-gray-900">Choose Delivery Location</span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Select your procurement facility location to see accurate freight and direct mandi delivery options across Tamil Nadu.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City / Town</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 font-semibold focus:ring-2 focus:ring-[#174B35] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={editPincode}
                  onChange={(e) => setEditPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 font-semibold focus:ring-2 focus:ring-[#174B35] outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                className="px-5 py-2 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

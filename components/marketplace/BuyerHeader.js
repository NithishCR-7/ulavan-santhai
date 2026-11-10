"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRD_CATEGORIES } from "@/data/marketplaceCatalog";
import { useSessionUser } from "@/services/sessionAuth";
import { getBuyerEnquiries } from "@/services/enquiryApi";
import { getBuyerAccessEntitlement } from "@/services/sellerAccessApi";

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

      // Seller Access Quota
      try {
        const quotaRes = await getBuyerAccessEntitlement();
        if (quotaRes.success && quotaRes.data) {
          setQuotaRemaining(quotaRes.data.quotaRemaining ?? 10);
        }
      } catch (e) {}
    };

    updateCounts();

    // Event listener for storage changes
    const handleStorage = () => updateCounts();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("ulavan_saved_changed", handleStorage);
    window.addEventListener("ulavan_access_changed", handleStorage);
    window.addEventListener("ulavan_enquiry_submitted", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("ulavan_saved_changed", handleStorage);
      window.removeEventListener("ulavan_access_changed", handleStorage);
      window.removeEventListener("ulavan_enquiry_submitted", handleStorage);
    };
  }, [sessionUser]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsAlertsOpen(false);
      }
    };
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
      {/* ROW 1: Logo | Deliver To | Search Bar | Counts | Profile */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Title */}
        <Link href="/marketplace" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center relative shrink-0 shadow-2xs border border-gray-200 group-hover:scale-105 transition-transform">
            <Image
              src="/images/ulavan-santhai-emblem@2x.png"
              alt="Ulavan Santhai Logo"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black text-[#174B35] tracking-tight leading-none">
              Ulavan Santhai
            </span>
            <span className="text-[9px] uppercase font-bold text-[#729B59] tracking-wider mt-0.5">
              Agricultural Marketplace
            </span>
          </div>
        </Link>

        {/* Deliver To Chip (Clickable) */}
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/80 text-left transition-colors cursor-pointer shrink-0 max-w-[190px]"
          title="Change procurement delivery location"
        >
          <svg className="w-4 h-4 text-[#174B35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex flex-col truncate">
            <span className="text-[9px] font-medium text-gray-500 uppercase leading-none">Deliver to</span>
            <span className="text-xs font-bold text-gray-900 truncate leading-tight mt-0.5">
              {deliveryLocation}
            </span>
          </div>
        </button>

        {/* Center: Search Bar with Category Selector + Button */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex flex-1 max-w-2xl items-center rounded-2xl border-2 border-[#174B35]/40 focus-within:border-[#174B35] bg-white overflow-hidden shadow-2xs transition-all"
        >
          {/* Category Selector Dropdown */}
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="h-10.5 pl-3 pr-7 text-xs font-bold text-gray-700 bg-gray-50 border-r border-gray-200 outline-none cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
          >
            <option value="All Categories">All Categories</option>
            {BRD_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search turmeric, carrots, ponni rice, groundnut oil, suppliers..."
            className="flex-1 h-10.5 px-3.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />

          {/* Search Button */}
          <button
            type="submit"
            className="h-10.5 px-4 bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden md:inline">Search</span>
          </button>
        </form>

        {/* Right Section: Saved | Enquiries | Alerts | Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-3" ref={profileRef}>
          {/* 1. Saved (Count) */}
          <Link
            href="/marketplace/saved"
            className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-gray-700 hover:text-[#174B35] hover:bg-gray-50 transition-colors relative"
            title="View Saved / Bookmarked Products"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-0.5 hidden md:block">Saved</span>
          </Link>

          {/* 2. Enquiries (Count) */}
          <Link
            href="/buyer/enquiries"
            className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-gray-700 hover:text-[#174B35] hover:bg-gray-50 transition-colors relative"
            title="View My Sent Enquiries & Responses"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {enquiryCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#174B35] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {enquiryCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-0.5 hidden md:block">Enquiries</span>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
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
                      <span>🌱 New Harvest Available</span>
                      <span className="text-[10px] text-gray-400">10m ago</span>
                    </div>
                    <p className="text-gray-600 text-[11px]">
                      Kongu Natural Organic Farms posted 2.5 MT fresh Salem Turmeric.
                    </p>
                  </div>
                  <div className="py-2.5 space-y-1">
                    <div className="font-bold text-gray-900 flex items-center justify-between">
                      <span>✓ Seller Views Available</span>
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
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsAlertsOpen(false);
              }}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/60 hover:bg-white transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#174B35] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                {sessionUser?.name ? sessionUser.name.charAt(0).toUpperCase() : "B"}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                  {sessionUser?.name || "Verified Buyer"}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold leading-none">
                  {quotaRemaining} Views Left
                </span>
              </div>
              <svg className="w-3.5 h-3.5 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {/* User Info Header */}
                <div className="p-3 bg-[#F5F5EB] rounded-xl mb-1 space-y-0.5">
                  <div className="font-extrabold text-gray-900">{sessionUser?.name || "Buyer Member"}</div>
                  <div className="text-[11px] text-gray-500 truncate">{sessionUser?.email || "buyer@ulavansanthai.in"}</div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase mt-1">
                    ✓ Verified Platform Member (₹365 Paid)
                  </div>
                </div>

                {/* Menu Action Items */}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onOpenSellerAccess) onOpenSellerAccess();
                      else router.push("/marketplace?view=access");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#E8F0E3] hover:text-[#174B35] font-bold text-gray-700 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>My Seller Access</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#174B35] text-white text-[10px] font-black">
                      {quotaRemaining} left
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onOpenProfile) onOpenProfile();
                      else router.push("/dashboard?role=buyer");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 font-bold text-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>My Business Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onOpenHelp) onOpenHelp();
                      else router.push("/marketplace?view=help");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 font-bold text-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Help &amp; Support</span>
                  </button>

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
            🔍
          </button>
        </form>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: The 4 BRD Categories | Verified | Post Req       */}
      {/* ======================================================== */}
      <div className="bg-[#F8FAF7] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-1.5 sm:py-2 gap-4 text-xs font-bold">
          {/* Left: The Four BRD Categories with Dropdown */}
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-gray-700 hover:text-[#174B35] hover:bg-white transition-colors shrink-0"
                  >
                    <span>{cat.icon}</span>
                    <span className="whitespace-nowrap">{cat.name}</span>
                    <svg className="w-3 h-3 text-gray-400 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>

                  {/* Subcategories Dropdown Panel */}
                  {isDropdownActive && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in duration-100 text-xs">
                      <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">
                        Subcategories
                      </div>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/marketplace?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`}
                          onClick={() => setActiveCategoryDropdown(null)}
                          className="block px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-[#E8F0E3] hover:text-[#174B35] transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
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
              <span className="text-[#174B35]">✓</span>
              <span>Verified Suppliers</span>
            </Link>

            <button
              type="button"
              onClick={onOpenPostRequirement}
              className="px-3.5 py-1.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-extrabold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>+</span>
              <span>Post a Requirement</span>
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
                ✕
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
                  maxLength={6}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 font-semibold focus:ring-2 focus:ring-[#174B35] outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                className="flex-1 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-sm"
              >
                Update Location
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


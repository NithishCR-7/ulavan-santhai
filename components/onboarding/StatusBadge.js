"use client";

export default function StatusBadge({ status, size = "md" }) {
  const normalized = (status || "PENDING_REVIEW").toUpperCase();

  const config = {
    SUBMITTED: {
      label: "Submitted",
      bg: "bg-blue-100 text-blue-800 border-blue-300",
      dot: "bg-blue-600",
    },
    PENDING_REVIEW: {
      label: "Pending Review",
      bg: "bg-amber-100 text-amber-800 border-amber-300",
      dot: "bg-amber-600",
    },
    UNDER_REVIEW: {
      label: "Under Review",
      bg: "bg-indigo-100 text-indigo-800 border-indigo-300",
      dot: "bg-indigo-600",
    },
    APPROVED: {
      label: "Approved",
      bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      dot: "bg-emerald-600",
    },
    REQUIRES_RESUBMISSION: {
      label: "Requires Resubmission",
      bg: "bg-orange-100 text-orange-800 border-orange-300",
      dot: "bg-orange-600",
    },
    CHANGES_REQUESTED: {
      label: "Changes Requested",
      bg: "bg-orange-100 text-orange-800 border-orange-300",
      dot: "bg-orange-600",
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-red-100 text-red-800 border-red-300",
      dot: "bg-red-600",
    },
    DRAFT: {
      label: "Draft",
      bg: "bg-gray-100 text-gray-700 border-gray-300",
      dot: "bg-gray-500",
    },
  };

  const current = config[normalized] || config.PENDING_REVIEW;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs sm:text-sm gap-2",
    lg: "px-4 py-1.5 text-sm sm:text-base gap-2 font-bold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${
        current.bg
      } ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}

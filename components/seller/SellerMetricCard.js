"use client";

export default function SellerMetricCard({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeType = "neutral", // "success" | "warning" | "info" | "neutral"
}) {
  const badgeStyles = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs hover:border-[#729B59]/50 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          {/* Simple, Readable Label */}
          <span className="text-xs sm:text-sm font-bold text-gray-600 block mb-1">
            {title}
          </span>
          {/* High-Contrast Large Number for Easy Reading */}
          <span className="text-3xl sm:text-4xl font-black text-[#174B35] tracking-tight">
            {value}
          </span>
        </div>

        {/* Clean Agricultural Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {/* Helpful Subtitle & Badge */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
        <span className="text-gray-500 font-medium text-xs truncate">{subtitle}</span>
        {badgeText && (
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
              badgeStyles[badgeType] || badgeStyles.neutral
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

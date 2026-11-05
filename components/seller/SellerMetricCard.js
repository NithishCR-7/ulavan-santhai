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
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-[#729B59]/40 transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <span className="text-3xl font-black text-[#174B35] tracking-tight">
            {value}
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0 shadow-2xs">
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-500 font-medium">{subtitle}</span>
        {badgeText && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles[badgeType] || badgeStyles.neutral}`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}


"use client";

export default function SelectionCard({
  id,
  title,
  subtitle,
  description,
  icon,
  badge,
  selected,
  onSelect,
}) {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`relative p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
        selected
          ? "border-emerald-600 bg-emerald-50/40 shadow-lg shadow-emerald-100 ring-2 ring-emerald-500/20"
          : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
      }`}
    >
      {/* Top row with icon & selection radio */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${
            selected
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
          }`}
        >
          {icon}
        </div>

        {/* Radio Pill */}
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected
              ? "border-emerald-600 bg-emerald-600"
              : "border-gray-300 group-hover:border-emerald-400"
          }`}
        >
          {selected && (
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </div>
      </div>

      {/* Title & Badge */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
            {title}
          </h3>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs font-semibold text-emerald-700 mb-1">
            {subtitle}
          </p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Selected Indicator Bar */}
      <div
        className={`h-1 w-full rounded-full mt-3 transition-colors ${
          selected ? "bg-emerald-600" : "bg-transparent"
        }`}
      />
    </div>
  );
}


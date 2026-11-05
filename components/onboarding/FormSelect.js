"use client";

export default function FormSelect({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  error,
  helperText,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={id || name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 text-sm transition-all focus:outline-none focus:ring-2 appearance-none pr-10 ${
            error
              ? "border-red-400 focus:ring-red-400 bg-red-50/20"
              : "border-gray-300 focus:ring-emerald-500 focus:border-transparent bg-white"
          } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>

        {/* Custom Dropdown Chevron */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-600 mt-1 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}


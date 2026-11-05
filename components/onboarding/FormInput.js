"use client";

export default function FormInput({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon,
  prefix,
  disabled = false,
  className = "",
  ...props
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
        {prefix && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-gray-500 pointer-events-none">
            {prefix}
          </span>
        )}
        {icon && !prefix && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={id || name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full py-2.5 rounded-xl border text-gray-900 text-sm transition-all focus:outline-none focus:ring-2 ${
            prefix || icon ? "pl-11" : "px-4"
          } pr-4 ${
            error
              ? "border-red-400 focus:ring-red-400 bg-red-50/20"
              : "border-gray-300 focus:ring-emerald-500 focus:border-transparent bg-white"
          } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
          {...props}
        />
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


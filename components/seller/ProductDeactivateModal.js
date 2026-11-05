"use client";

export default function ProductDeactivateModal({
  isOpen,
  onClose,
  product,
  onConfirm,
  isActionLoading = false,
  targetStatus = "INACTIVE", // "INACTIVE" | "ACTIVE"
}) {
  if (!isOpen || !product) return null;

  const isDeactivating = targetStatus === "INACTIVE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${
              isDeactivating ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isDeactivating ? "⚠️" : "🌾"}
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">
              {isDeactivating ? "Deactivate Produce Listing?" : "Reactivate Produce Listing?"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Produce: <strong className="text-gray-800">{product.title}</strong>
            </p>
          </div>
        </div>

        {/* Informative Explanation */}
        <div
          className={`p-4 rounded-2xl text-xs leading-relaxed ${
            isDeactivating
              ? "bg-amber-50 border border-amber-200 text-amber-900"
              : "bg-emerald-50 border border-emerald-200 text-emerald-900"
          }`}
        >
          {isDeactivating ? (
            <>
              Deactivating will <strong>hide this product</strong> from commercial buyers on the marketplace.
              Your product record and specifications will be preserved, and you can reactivate it at any time when new harvest stock is ready.
            </>
          ) : (
            <>
              Reactivating will restore this crop listing to your active catalog so commercial buyers can send you direct purchase enquiries again.
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isActionLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isActionLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 ${
              isDeactivating
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#174B35] hover:bg-[#103A29]"
            }`}
          >
            {isActionLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : isDeactivating ? (
              <span>Yes, Deactivate Product</span>
            ) : (
              <span>Yes, Reactivate Product</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


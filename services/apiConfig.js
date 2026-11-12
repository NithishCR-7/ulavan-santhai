/**
 * Ulavan Santhai - Centralized Dynamic API Configuration & Request Helper
 * Connects strictly to the backend API configured in the environment (.env.local).
 * Never hardcodes any IP or port; always driven by process.env.
 * No mock/static fallback data: returns live backend responses only.
 */

// On the client side (browser), using relative "" allows Next.js rewrite/proxy to handle CORS.
// On the server side, it resolves directly to BACKEND_URL or NEXT_PUBLIC_API_URL.
export const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");

/**
 * Standard dynamic API request wrapper with JWT token injection and zero-cache guarantee.
 * Strictly communicates with backend without returning synthetic/mock fallbacks.
 *
 * @param {string} endpoint - Relative path (e.g. '/api/v1/marketplace/products')
 * @param {object} options - Fetch options (method, headers, body)
 */
export async function apiFetch(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    ...options.headers,
  };

  // Attach session token if available
  if (typeof window !== "undefined") {
    const token =
      sessionStorage.getItem("ulavan_auth_token") ||
      localStorage.getItem("ulavan_auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const targetUrl = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    const res = await fetch(targetUrl, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      return {
        success: true,
        status: res.status,
        data: json?.data !== undefined ? json.data : json,
        raw: json,
      };
    }

    // Backend returned an error response (4xx / 5xx)
    const errData = await res.json().catch(() => null);
    const errorMessage =
      errData?.message ||
      errData?.error ||
      `Backend request failed with status ${res.status}`;

    return {
      success: false,
      status: res.status,
      error: errorMessage,
      data: null,
      raw: errData,
    };
  } catch (networkError) {
    console.error(`[UlavanSanthai API] Network error calling ${endpoint}:`, networkError.message);
    return {
      success: false,
      status: 0,
      error: networkError.message || "Backend server unreachable. Please verify network and backend service.",
      data: null,
    };
  }
}

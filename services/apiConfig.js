/**
 * Ulavan Santhai - Centralized Dynamic API Configuration & Request Helper
 * Connects dynamically to the backend API configured in .env.local without hardcoded URLs.
 * Bypasses cache memory with cache: 'no-store' on all requests.
 */

// On the client side (browser), using relative "" allows Next.js rewrite proxy to handle CORS automatically.
// On the server side, it falls back to BACKEND_URL or NEXT_PUBLIC_API_URL.
export const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");

/**
 * Standard dynamic API request wrapper with JWT token injection and zero-cache guarantee
 * @param {string} endpoint - Relative path (e.g. '/api/v1/seller/dashboard')
 * @param {object} options - Fetch options (method, headers, body)
 * @param {any} mockFallback - Data to return if the backend endpoint is offline or not yet deployed
 */
export async function apiFetch(endpoint, options = {}, mockFallback = null) {
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
      console.info(`[UlavanSanthai API] Live backend response (200 OK) from ${endpoint}`);
      return {
        success: true,
        data: json?.data ?? json,
        isMock: false,
        source: "backend_api",
      };
    }

    // Backend endpoint offline or not yet implemented on server (404 / 502 / 503)
    if (res.status === 404 || res.status >= 502) {
      console.warn(
        `[UlavanSanthai API] Route ${endpoint} returned HTTP ${res.status}. Falling back to contract data.`
      );
      return {
        success: true,
        data: mockFallback,
        isMock: true,
        source: "mock_contract_fallback",
        status: res.status,
      };
    }

    const errData = await res.json().catch(() => null);
    return {
      success: false,
      error: errData?.message || `Request failed with status ${res.status}`,
      isMock: false,
    };
  } catch (networkError) {
    console.warn(
      `[UlavanSanthai API] Network unreachable for ${endpoint}. Error: ${networkError.message}`
    );
    return {
      success: true,
      data: mockFallback,
      isMock: true,
      source: "mock_offline_fallback",
      error: networkError.message,
    };
  }
}

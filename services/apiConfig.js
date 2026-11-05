/**
 * Ulavan Santhai - Centralized API Configuration & Request Helper
 * Connects to the backend API while safely falling back to structured mock data
 * when endpoints are still under development.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Standard API request wrapper with JWT token injection and mock fallback
 * @param {string} endpoint - Relative path (e.g. '/api/v1/seller/dashboard')
 * @param {object} options - Fetch options (method, headers, body)
 * @param {any} mockFallback - Data to return if the backend endpoint is not yet online
 */
export async function apiFetch(endpoint, options = {}, mockFallback = null) {
  const headers = {
    "Content-Type": "application/json",
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
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      return {
        success: true,
        data: json?.data ?? json,
        isMock: false,
        source: "backend_api",
      };
    }

    // Backend endpoint not yet deployed (404 / 502 / 503)
    if (res.status === 404 || res.status >= 502) {
      console.info(
        `[UlavanSanthai API] Route ${endpoint} returned ${res.status}. Active mock contract fallback.`
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
    console.info(
      `[UlavanSanthai API] Network unreachable for ${endpoint}. Active mock contract fallback.`
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


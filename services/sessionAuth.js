"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export const defaultSessionUser = {
  name: "Farmer Ramesh Kumar",
  username: "ramesh_kumar",
  email: "ramesh@example.com",
  mobile: "9876543210",
};

let cachedClientString = null;
let lastRawStorage = null;

function getClientSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify(defaultSessionUser);
  }

  try {
    const raw =
      sessionStorage.getItem("ulavan_user") ||
      sessionStorage.getItem("ulavan_registered_user") ||
      localStorage.getItem("ulavan_registered_user") ||
      "";

    if (raw === lastRawStorage && cachedClientString !== null) {
      return cachedClientString;
    }

    lastRawStorage = raw;

    if (raw) {
      const parsed = JSON.parse(raw);
      cachedClientString = JSON.stringify({
        name: parsed.name || parsed.username || defaultSessionUser.name,
        username: parsed.username || defaultSessionUser.username,
        email: parsed.email || defaultSessionUser.email,
        mobile: parsed.mobile || defaultSessionUser.mobile,
      });
      return cachedClientString;
    }
  } catch {
    // ignore
  }

  cachedClientString = JSON.stringify(defaultSessionUser);
  return cachedClientString;
}

const serverSnapshotString = JSON.stringify(defaultSessionUser);

function getServerSnapshot() {
  return serverSnapshotString;
}

/**
 * useSessionUser hook
 * Provides hydration-safe access to logged-in user credentials from session / local storage.
 */
export function useSessionUser() {
  const authJson = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  try {
    return JSON.parse(authJson);
  } catch {
    return defaultSessionUser;
  }
}


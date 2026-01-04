// Centralized API base URL helper for CRA builds.
//
// If REACT_APP_BACKEND_URL is not set, we fall back to same-origin API routes
// (e.g. Vercel rewrites/proxy) using relative URLs like `/api/...`.
const rawBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();

export const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "");
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";


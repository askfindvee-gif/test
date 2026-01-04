// Centralized API base URL helper for CRA builds.
//
// If REACT_APP_BACKEND_URL is not set, we fall back to same-origin API routes
// (e.g. Vercel rewrites/proxy) using relative URLs like `/api/...`.
//
// This file also contains a "demo mode" offline API shim so the UI remains
// fully navigable when the backend is missing/broken.
const rawBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();

export const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "");
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

const DEMO_TOKEN = "demo-token";

function getToken() {
  return localStorage.getItem("pfa_token") || "";
}

export function isDemoMode() {
  return getToken() === DEMO_TOKEN;
}

function loadOrInit(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function demoData() {
  const incidents = loadOrInit("pfa_demo_incidents", [
    {
      id: "inc-1",
      type: "Cruelty",
      description: "Reported abuse near market area; requires immediate response.",
      location: "Saket, Delhi",
      status: "pending",
      severity: "high",
      reported_by: "Citizen Report",
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: "inc-2",
      type: "Accident",
      description: "Injured dog spotted near highway divider.",
      location: "Rohini, Delhi",
      status: "investigating",
      severity: "medium",
      reported_by: "Helpline",
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]);

  const activities = loadOrInit("pfa_demo_activities", [
    {
      id: "act-1",
      type: "Feed",
      description: "Morning feeding drive completed.",
      location: "Mayur Vihar, Delhi",
      volunteer_id: "vol-1",
      volunteer_name: "Rajesh Kumar",
      created_at: nowIso(),
    },
    {
      id: "act-2",
      type: "Rescue",
      description: "Rescued kitten from construction site.",
      location: "Saket, Delhi",
      volunteer_id: "vol-2",
      volunteer_name: "Ananya Singh",
      created_at: nowIso(),
    },
  ]);

  const volunteers = loadOrInit("pfa_demo_volunteers", [
    {
      id: "vol-1",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 90000 00001",
      location: "South Delhi",
      status: "approved",
      joined_at: nowIso(),
    },
    {
      id: "vol-2",
      name: "Ananya Singh",
      email: "ananya@example.com",
      phone: "+91 90000 00002",
      location: "East Delhi",
      status: "pending",
      joined_at: nowIso(),
    },
  ]);

  const missing = loadOrInit("pfa_demo_missing", [
    {
      id: "mis-1",
      animal_type: "Dog",
      description: "Brown indie, friendly, last seen near park gate.",
      location: "Rohini, Delhi",
      status: "lost",
      contact: "+91 90000 00003",
      reported_by: "Citizen Report",
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ]);

  const sos = loadOrInit("pfa_demo_sos", [
    {
      id: "sos-1",
      description: "Animal in distress; aggressive crowd nearby.",
      location: "Sector 12, Noida",
      urgency: "high",
      status: "active",
      reported_by: "Hotline",
      created_at: nowIso(),
      resolved_at: null,
    },
  ]);

  return { incidents, activities, volunteers, missing, sos };
}

function demoResponse(data) {
  return Promise.resolve({ data });
}

function parseStatusFromUrl(url) {
  try {
    const u = new URL(url, "http://local");
    return u.searchParams.get("status");
  } catch {
    return null;
  }
}

function extractApiPath(urlOrPath) {
  // Accept:
  // - "/incidents"
  // - "/api/incidents"
  // - "https://host/api/incidents?x=y"
  // - "/api/incidents?x=y"
  if (typeof urlOrPath !== "string") return "";

  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const u = new URL(urlOrPath);
    return `${u.pathname}${u.search}`;
  }

  return urlOrPath;
}

export async function apiGet(urlOrPath, config, axiosInstance) {
  if (!isDemoMode()) {
    const axiosLib = axiosInstance || (await import("axios")).default;
    const url = urlOrPath.startsWith("http") || urlOrPath.startsWith("/api")
      ? urlOrPath
      : `${API_BASE}${urlOrPath}`;
    return axiosLib.get(url, config);
  }

  const path = extractApiPath(urlOrPath);
  const { incidents, activities, volunteers, missing, sos } = demoData();

  if (path.includes("/dashboard/stats")) {
    const impact_score = incidents.length + activities.length + sos.length * 2;
    return demoResponse({
      impact_score,
      days_active: 30,
      total_incidents: incidents.length,
      total_activities: activities.length,
      total_missing: missing.length,
      total_sos: sos.length,
      pending_volunteers: volunteers.filter((v) => v.status === "pending").length,
    });
  }
  if (path.includes("/auth/me")) {
    return demoResponse({ id: "demo-admin", email: "admin@pfa.org", name: "Admin", role: "admin", created_at: nowIso() });
  }
  if (path.includes("/incidents")) return demoResponse(incidents);
  if (path.includes("/activities")) return demoResponse(activities);
  if (path.includes("/volunteers")) return demoResponse(volunteers);
  if (path.includes("/missing")) return demoResponse(missing);
  if (path.includes("/sos")) return demoResponse(sos);

  // Analytics demo data
  if (path.includes("/analytics/insights")) {
    return demoResponse([
      { id: "1", type: "critical", title: "Recurring Hotspots", description: "Repeated incidents in 14 locations/week", confidence: 92, trend: "+28%", severity: "high" },
      { id: "2", type: "seasonal", title: "Seasonal Spike", description: "Incidents increased during festivals", confidence: 87, trend: "+18%", severity: "medium" },
      { id: "3", type: "stable", title: "Cruelty Velocity", description: "Incident rate stabilizing", confidence: 78, trend: "-2%", severity: "stable" },
      { id: "4", type: "strong", title: "Prevention Score", description: "Feeding drives correlate with fewer conflicts", confidence: 86, trend: "0.86", severity: "positive" },
    ]);
  }
  if (path.includes("/analytics/patterns")) {
    return demoResponse([
      { id: "p1", pattern_name: "Post-festival displacement surge", description: "Confidence Level: 92% - Expected Duration: 48h", type: "detected", severity: "warning" },
      { id: "p2", pattern_name: "Construction site recurring incidents", description: "Sector 4, Rohini - 5 cases / 24h", type: "new_cluster", severity: "critical" },
      { id: "p3", pattern_name: "Positive impact: Feeding drives", description: "South District - conflict reduced by 46%", type: "correlation", severity: "positive" },
    ]);
  }
  if (path.includes("/analytics/trends")) {
    return demoResponse({
      trends: {
        accident: [
          { month: "May", count: 65 },
          { month: "Jun", count: 72 },
          { month: "Jul", count: 58 },
          { month: "Aug", count: 89 },
          { month: "Sep", count: 95 },
          { month: "Oct", count: 112 },
        ],
        cruelty: [
          { month: "May", count: 32 },
          { month: "Jun", count: 38 },
          { month: "Jul", count: 28 },
          { month: "Aug", count: 45 },
          { month: "Sep", count: 51 },
          { month: "Oct", count: 48 },
        ],
      },
      impact: [
        { frequency: 1, incidents: 145 },
        { frequency: 2, incidents: 132 },
        { frequency: 3, incidents: 118 },
        { frequency: 4, incidents: 98 },
        { frequency: 5, incidents: 76 },
      ],
    });
  }
  if (path.includes("/analytics/geographic")) {
    return demoResponse({
      locations: [
        { state: "Delhi", district: "North Delhi", city: "Rohini", latitude: 28.7495, longitude: 77.0736, incident_count: 42, severity: "high", status: "Monitor" },
        { state: "Delhi", district: "South Delhi", city: "Saket", latitude: 28.5245, longitude: 77.2072, incident_count: 28, severity: "medium", status: "Stable" },
        { state: "Delhi", district: "East Delhi", city: "Mayur Vihar", latitude: 28.6082, longitude: 77.2986, incident_count: 15, severity: "low", status: "Safe" },
      ],
      stats: { high_feeding_zones: 85, recurring_cruelty_areas: 24, repeated_complaints: 142, intervention_regions: 7 },
    });
  }
  if (path.includes("/analytics/clusters")) {
    return demoResponse({
      clusters: { urban: 324, semi_urban: 189, rural: 92 },
      districts: [
        { district: "South", count: 245 },
        { district: "East", count: 312 },
        { district: "West", count: 198 },
        { district: "North", count: 276 },
        { district: "Ctrl", count: 156 },
        { district: "Rur", count: 89 },
      ],
    });
  }

  return demoResponse([]);
}

export async function apiPost(urlOrPath, body, config, axiosInstance) {
  if (!isDemoMode()) {
    const axiosLib = axiosInstance || (await import("axios")).default;
    const url = urlOrPath.startsWith("http") || urlOrPath.startsWith("/api")
      ? urlOrPath
      : `${API_BASE}${urlOrPath}`;
    return axiosLib.post(url, body, config);
  }
  // Currently no demo POST endpoints needed for navigation; return success.
  return demoResponse({ ok: true });
}

export async function apiPut(urlOrPath, body, config, axiosInstance) {
  if (!isDemoMode()) {
    const axiosLib = axiosInstance || (await import("axios")).default;
    const url = urlOrPath.startsWith("http") || urlOrPath.startsWith("/api")
      ? urlOrPath
      : `${API_BASE}${urlOrPath}`;
    return axiosLib.put(url, body, config);
  }

  const path = extractApiPath(urlOrPath);
  const data = demoData();

  if (path.includes("/incidents/")) {
    const id = path.split("/incidents/")[1]?.split("?")[0];
    const status = parseStatusFromUrl(path);
    const updated = data.incidents.map((i) =>
      i.id === id ? { ...i, status: status || i.status, updated_at: nowIso() } : i,
    );
    save("pfa_demo_incidents", updated);
    return demoResponse({ ok: true });
  }

  if (path.includes("/missing/")) {
    const id = path.split("/missing/")[1]?.split("?")[0];
    const status = parseStatusFromUrl(path);
    const updated = data.missing.map((m) =>
      m.id === id ? { ...m, status: status || m.status, updated_at: nowIso() } : m,
    );
    save("pfa_demo_missing", updated);
    return demoResponse({ ok: true });
  }

  if (path.includes("/sos/")) {
    const id = path.split("/sos/")[1]?.split("?")[0];
    const updated = data.sos.map((a) =>
      a.id === id ? { ...a, status: "resolved", resolved_at: nowIso() } : a,
    );
    save("pfa_demo_sos", updated);
    return demoResponse({ ok: true });
  }

  if (path.includes("/volunteers/")) {
    const id = path.split("/volunteers/")[1]?.split("?")[0];
    const status = body?.status;
    const updated = data.volunteers.map((v) => (v.id === id ? { ...v, status: status || v.status } : v));
    save("pfa_demo_volunteers", updated);
    return demoResponse({ ok: true });
  }

  return demoResponse({ ok: true });
}

export async function apiDelete(urlOrPath, config, axiosInstance) {
  if (!isDemoMode()) {
    const axiosLib = axiosInstance || (await import("axios")).default;
    const url = urlOrPath.startsWith("http") || urlOrPath.startsWith("/api")
      ? urlOrPath
      : `${API_BASE}${urlOrPath}`;
    return axiosLib.delete(url, config);
  }

  const path = extractApiPath(urlOrPath);
  const data = demoData();

  if (path.includes("/volunteers/")) {
    const id = path.split("/volunteers/")[1]?.split("?")[0];
    const updated = data.volunteers.filter((v) => v.id !== id);
    save("pfa_demo_volunteers", updated);
    return demoResponse({ ok: true });
  }

  return demoResponse({ ok: true });
}


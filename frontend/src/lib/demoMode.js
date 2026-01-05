function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem("pfa_token");
}

export function isDemoMode() {
  if (!isBrowser()) return false;
  const token = window.localStorage.getItem("pfa_token");
  return token === "demo" || window.localStorage.getItem("pfa_demo") === "1";
}

export function hasBackendUrl() {
  return Boolean(process.env.REACT_APP_BACKEND_URL);
}

export function shouldUseDemoData() {
  return isDemoMode() || !hasBackendUrl();
}

export function setDemoAuth() {
  if (!isBrowser()) return;
  window.localStorage.setItem("pfa_token", "demo");
  window.localStorage.setItem("pfa_demo", "1");
  window.localStorage.setItem(
    "pfa_user",
    JSON.stringify({
      name: "Demo Admin",
      email: "demo@pfa.org",
      role: "demo"
    })
  );
}

export function clearAuth() {
  if (!isBrowser()) return;
  window.localStorage.removeItem("pfa_token");
  window.localStorage.removeItem("pfa_user");
  window.localStorage.removeItem("pfa_demo");
}


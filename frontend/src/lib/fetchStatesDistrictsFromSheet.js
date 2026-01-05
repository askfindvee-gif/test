const SHEET_ID = "1jf-Hq8tRYm6QYi3T423BhpJ_kVMyZz6ERuG7zhiP5wk";
const GID = "202346606";
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

const SMALL_WORDS = new Set(["and", "of", "the"]);

function titleCaseName(input) {
  if (!input) return "";
  const words = String(input)
    .trim()
    .replace(/\s+/g, " ")
    .split(" ");

  return words
    .map((w, idx) => {
      if (!w) return w;
      if (w === "&") return "&";

      const lower = w.toLowerCase();
      if (SMALL_WORDS.has(lower) && idx !== 0) return lower;

      // Preserve short acronyms like NCT, UT, etc.
      if (/^[A-Z]{2,3}$/.test(w) && !SMALL_WORDS.has(w.toLowerCase())) return w;

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function extractGvizJson(text) {
  const start = text.indexOf("(");
  const end = text.lastIndexOf(");");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Unexpected Google gviz response format");
  }
  return JSON.parse(text.slice(start + 1, end));
}

/**
 * Fetches states + districts from the configured Google Sheet.
 * Expected columns (first row headers): State Name at index 1, District Name at index 3.
 */
export async function fetchStatesDistrictsFromSheet({ signal } = {}) {
  const res = await fetch(GVIZ_URL, { signal, credentials: "omit" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet (${res.status})`);
  }

  const text = await res.text();
  const json = extractGvizJson(text);
  const rows = json?.table?.rows || [];

  // First row is headers in this sheet.
  const dataRows = rows.slice(1);

  const districtsByState = {};

  for (const r of dataRows) {
    const cells = r?.c || [];
    const stateRaw = cells?.[1]?.v;
    const districtRaw = cells?.[3]?.v;

    if (!stateRaw || !districtRaw) continue;

    const state = titleCaseName(stateRaw);
    const district = titleCaseName(districtRaw);

    if (!districtsByState[state]) districtsByState[state] = new Set();
    districtsByState[state].add(district);
  }

  const normalized = {};
  for (const [state, set] of Object.entries(districtsByState)) {
    normalized[state] = Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  const states = Object.keys(normalized).sort((a, b) => a.localeCompare(b));
  return { states, districtsByState: normalized };
}


// Route-level permission matrix. Each entry is the set of roles that may access that prefix.
// More specific paths override shorter prefixes (matched longest-first in middleware).

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // dashboard intentionally omitted — all roles can access it (role-aware content)
  "/admin/users":      ["ADMIN"],
  "/admin/audit":      ["ADMIN"],
  "/admin/settings":   ["ADMIN"],
  "/admin/expenses":   ["ADMIN", "SECRETARY"],
  "/admin/payments":   ["ADMIN", "SECRETARY"],
  "/admin/sponsors":   ["ADMIN", "SECRETARY"],
  "/admin/meetings":   ["ADMIN", "SECRETARY"],
  "/admin/members":    ["ADMIN", "SECRETARY"],
  "/admin/archive":    ["ADMIN", "SECRETARY"],
  "/admin/tournaments":["ADMIN", "SECRETARY"],
  "/admin/blog":       ["ADMIN", "SECRETARY", "AUTHOR"],
  "/admin/gallery":    ["ADMIN", "SECRETARY", "AUTHOR"],
  "/admin/players":    ["ADMIN", "SECRETARY", "COACH"],
  "/admin/coaches":    ["ADMIN", "SECRETARY", "COACH"],
  "/admin/attendance": ["ADMIN", "SECRETARY", "COACH"],
  "/admin/scores":     ["ADMIN", "SECRETARY", "COACH"],

  // dashboard, calendar, profile — all roles (no entry = all allowed)
};

export function canAccess(pathname: string, role: string): boolean {
  // Find the longest matching prefix
  const match = Object.keys(ROUTE_PERMISSIONS)
    .filter((prefix) => pathname.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0];

  if (!match) return true; // no restriction
  return ROUTE_PERMISSIONS[match].includes(role);
}

// Landing page per role — where to redirect after login or forbidden access
export const ROLE_HOME: Record<string, string> = {
  ADMIN:     "/admin/dashboard",
  SECRETARY: "/admin/dashboard",
  COACH:     "/admin/dashboard",
  AUTHOR:    "/admin/dashboard",
};

// Items each role can see in the sidebar (used client-side)
export const ALLOWED_NAV: Record<string, string[]> = {
  ADMIN: [], // empty = all
  SECRETARY: [
    "/admin/dashboard", "/admin/calendar",
    "/admin/players", "/admin/coaches", "/admin/attendance", "/admin/scores",
    "/admin/members", "/admin/meetings", "/admin/sponsors", "/admin/tournaments", "/admin/archive",
    "/admin/payments",
    "/admin/blog", "/admin/gallery",
    "/admin/profile",
  ],
  COACH: [
    "/admin/dashboard", "/admin/calendar",
    "/admin/players", "/admin/coaches", "/admin/attendance", "/admin/scores",
    "/admin/profile",
  ],
  AUTHOR: [
    "/admin/dashboard",
    "/admin/blog", "/admin/gallery",
    "/admin/profile",
  ],
};

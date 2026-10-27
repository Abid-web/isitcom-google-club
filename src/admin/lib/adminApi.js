import { supabaseRestFetch, supabaseStorageUpload } from "../../lib/supabaseRest";
import { getValidAccessToken } from "./authClient";

async function authFetch(path, options = {}) {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }
  return supabaseRestFetch(path, { ...options, token });
}

export async function logAdminAction(action, targetTable, targetId = null, details = {}) {
  try {
    await authFetch("/rpc/log_admin_action", {
      method: "POST",
      body: JSON.stringify({
        p_action: action,
        p_target_table: targetTable,
        p_target_id: targetId ? String(targetId) : null,
        p_details: details,
      }),
    });
  } catch {
    // Non-blocking for UI
  }
}

// --- Dashboard ---
export async function getDashboardKPIs() {
  return authFetch("/rpc/get_admin_dashboard_kpis", { method: "POST" });
}

// --- Applications ---
export async function getApplications({ status, department, search } = {}) {
  const query = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
  });

  if (status && status !== "all") {
    query.set("status", `eq.${status}`);
  }
  if (department && department !== "all") {
    query.set("department", `eq.${department}`);
  }
  if (search) {
    const s = encodeURIComponent(`*${search}*`);
    query.set("or", `(full_name.ilike.${s},email.ilike.${s},field_of_study.ilike.${s})`);
  }

  return authFetch(`/club_applications?${query.toString()}`);
}

export async function updateApplication(id, updates) {
  const payload = {
    ...updates,
    reviewed_at: new Date().toISOString(),
  };

  const result = await authFetch(`/club_applications?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  await logAdminAction("update_application", "club_applications", id, updates);
  return result;
}

export async function deleteApplication(id) {
  const result = await authFetch(`/club_applications?id=eq.${id}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  await logAdminAction("delete_application", "club_applications", id);
  return result;
}

// --- Events ---
export async function getEvents() {
  return authFetch("/events?select=*&order=display_order.asc,created_at.desc");
}

export async function createEvent(eventData) {
  const result = await authFetch("/events", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(eventData),
  });
  await logAdminAction("create_event", "events", result?.[0]?.id, { title: eventData.title });
  return result?.[0];
}

export async function updateEvent(id, updates) {
  const result = await authFetch(`/events?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  });
  await logAdminAction("update_event", "events", id, updates);
  return result?.[0];
}

export async function deleteEvent(id) {
  const result = await authFetch(`/events?id=eq.${id}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  await logAdminAction("delete_event", "events", id);
  return result;
}

// --- Team Members ---
export async function getTeamMembers() {
  return authFetch("/team_members?select=*&order=display_order.asc,name.asc");
}

export async function createTeamMember(memberData) {
  const result = await authFetch("/team_members", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(memberData),
  });
  await logAdminAction("create_team_member", "team_members", result?.[0]?.id, { name: memberData.name });
  return result?.[0];
}

export async function updateTeamMember(id, updates) {
  const result = await authFetch(`/team_members?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  });
  await logAdminAction("update_team_member", "team_members", id, updates);
  return result?.[0];
}

export async function deleteTeamMember(id) {
  const result = await authFetch(`/team_members?id=eq.${id}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  await logAdminAction("delete_team_member", "team_members", id);
  return result;
}

// --- Departments ---
export async function getDepartments() {
  return authFetch("/departments?select=*&order=display_order.asc");
}

export async function updateDepartment(id, updates) {
  const result = await authFetch(`/departments?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  });
  await logAdminAction("update_department", "departments", id, updates);
  return result?.[0];
}

// --- Gallery ---
export async function getGalleryImages() {
  return authFetch("/gallery_images?select=*&order=display_order.asc,created_at.desc");
}

export async function createGalleryImage(data) {
  const result = await authFetch("/gallery_images", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(data),
  });
  await logAdminAction("create_gallery_image", "gallery_images", result?.[0]?.id, { label: data.label });
  return result?.[0];
}

export async function deleteGalleryImage(id) {
  const result = await authFetch(`/gallery_images?id=eq.${id}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  await logAdminAction("delete_gallery_image", "gallery_images", id);
  return result;
}

// --- Stats ---
export async function getSiteStats() {
  return authFetch("/site_stats?select=*&order=display_order.asc");
}

export async function updateSiteStat(id, updates) {
  const result = await authFetch(`/site_stats?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updates),
  });
  await logAdminAction("update_site_stat", "site_stats", id, updates);
  return result?.[0];
}

// --- Settings ---
export async function getSiteSettings() {
  const list = await authFetch("/site_settings?select=*&limit=1");
  return list?.[0] || null;
}

export async function updateSiteSettings(updates) {
  const result = await authFetch("/site_settings?id=eq.current", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  });
  await logAdminAction("update_site_settings", "site_settings", "current", updates);
  return result?.[0];
}

// --- Audit & Security ---
export async function getAuditLogs(limit = 40) {
  return authFetch(`/audit_log?select=*&order=created_at.desc&limit=${limit}`);
}

export async function getSecuritySummary() {
  return authFetch("/rpc/get_blocked_attempts_summary", { method: "POST" });
}

export async function getAdminUsers() {
  return authFetch("/admin_users?select=*&order=created_at.desc");
}

// --- Media Upload ---
export async function uploadMedia(file, folder = "uploads") {
  const token = await getValidAccessToken();
  if (!token) throw new Error("Authentication required for upload.");

  const ext = file.name.split(".").pop() || "webp";
  const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return supabaseStorageUpload("club-media", safeName, file, token);
}

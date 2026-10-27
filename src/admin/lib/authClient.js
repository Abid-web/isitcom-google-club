import { supabaseAuthFetch, supabaseRestFetch } from "../../lib/supabaseRest";

const SESSION_STORAGE_KEY = "igc_admin_session";

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session && session.access_token ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Storage quota or private mode fallback
  }
}

export async function loginWithPassword(email, password) {
  const payload = await supabaseAuthFetch("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_at: Date.now() + (payload.expires_in || 3600) * 1000,
    user: payload.user,
  };

  // Verify that this user actually has admin rights in public.admin_users
  try {
    const adminProfile = await supabaseRestFetch("/rpc/get_current_admin", {
      method: "POST",
      token: session.access_token,
    });

    if (!adminProfile || !adminProfile.role) {
      throw new Error("Access denied: You do not have administrator permissions for this club.");
    }

    session.admin = adminProfile;
    saveSession(session);
    return session;
  } catch (err) {
    saveSession(null);
    throw err;
  }
}

export async function refreshAdminSession() {
  const session = getStoredSession();
  if (!session || !session.refresh_token) {
    saveSession(null);
    return null;
  }

  try {
    const payload = await supabaseAuthFetch("/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });

    const newSession = {
      ...session,
      access_token: payload.access_token,
      refresh_token: payload.refresh_token || session.refresh_token,
      expires_at: Date.now() + (payload.expires_in || 3600) * 1000,
      user: payload.user || session.user,
    };

    saveSession(newSession);
    return newSession;
  } catch {
    saveSession(null);
    return null;
  }
}

export async function logoutAdmin() {
  const session = getStoredSession();
  if (session && session.access_token) {
    try {
      await supabaseAuthFetch("/logout", {
        method: "POST",
        token: session.access_token,
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  saveSession(null);
}

/**
 * Returns a valid access token, auto-refreshing if it is about to expire (within 2 minutes).
 */
export async function getValidAccessToken() {
  let session = getStoredSession();
  if (!session) return null;

  const now = Date.now();
  // Refresh if less than 2 minutes remain
  if (session.expires_at && session.expires_at - now < 120_000) {
    session = await refreshAdminSession();
  }

  return session ? session.access_token : null;
}

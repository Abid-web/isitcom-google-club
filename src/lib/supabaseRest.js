const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const publishableKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const cooldownKey = "igc-application-cooldown";
const browserCooldownMs = 60_000;

function getSupabaseConfig() {
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Applications are temporarily unavailable. The database connection is not configured.");
  }

  let url;
  try {
    url = new URL(supabaseUrl);
  } catch {
    throw new Error("Applications are temporarily unavailable. The database URL is invalid.");
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("Applications are temporarily unavailable. A secure database URL is required.");
  }

  return { url: url.toString().replace(/\/$/, ""), publishableKey };
}

function getFriendlyError(status, payload) {
  if (status === 429 || payload?.code === "RATE_LIMITED") {
    return "Too many applications were sent. Please wait before trying again.";
  }
  if (status === 400 || payload?.code === "23514") {
    return "Please check your answers and try again.";
  }
  if (status === 401 || status === 403 || payload?.code === "42501") {
    return "Applications are not accepting submissions right now. Please try again later.";
  }
  if (status === 409 || payload?.code === "23505") {
    return "An application with these details has already been submitted.";
  }
  if (status >= 500) {
    return "The application service is temporarily unavailable. Please try again shortly.";
  }
  return "We could not send your application. Please try again.";
}

export async function submitClubApplication(values) {
  const { url, publishableKey: key } = getSupabaseConfig();
  try {
    const lastSubmission = Number(window.localStorage.getItem(cooldownKey));
    if (Number.isFinite(lastSubmission) && Date.now() - lastSubmission < browserCooldownMs) {
      throw new Error("Please wait one minute before sending another application.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Please wait")) throw error;
  }

  const payload = {
    p_full_name: values.name.trim(),
    p_email: values.email.trim().toLowerCase(),
    p_study_year: values.year,
    p_field_of_study: values.field.trim(),
    p_department: values.department,
    p_motivation: values.motivation.trim() || null,
    p_website: values.website,
  };

  let response;
  try {
    response = await fetch(`${url}/rest/v1/rpc/submit_club_application`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Could not reach the application service. Check your connection and try again.");
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(getFriendlyError(response.status, errorPayload));
  }

  try {
    window.localStorage.setItem(cooldownKey, String(Date.now()));
  } catch {
    // Storage can be unavailable in private browsing; server limits still apply.
  }
}

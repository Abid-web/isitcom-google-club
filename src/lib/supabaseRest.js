const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const publishableKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

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
  const payload = {
    full_name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    study_year: values.year,
    field_of_study: values.field.trim(),
    department: values.department,
    motivation: values.motivation.trim(),
  };

  let response;
  try {
    response = await fetch(`${url}/rest/v1/club_applications`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
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
}

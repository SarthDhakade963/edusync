import { getSession, signOut } from "next-auth/react";

export async function fetchWithToken(input: RequestInfo, init?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const session = await getSession();
    const accessToken = session?.accessToken;
    const headers = new Headers(init?.headers as HeadersInit);

    headers.set("Content-Type", "application/json");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    let res = await fetch(`${baseUrl}${input}`, { ...init, headers });

    // Check for 401 (expired token)
    if (res.status === 401) {
      console.warn("⚠️ Access token expired, attempting refresh...");

      const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include", // to send refresh token cookie
      });

      if (!refreshRes.ok) {
        console.error("❌ Refresh token invalid — signing out user.");
        signOut({ callbackUrl: "/" });
        throw new Error("Session expired. Please login again.");
      }

      console.log("🔁 Token refreshed successfully. Retrying original request...");

      // Get new access token from refreshed session
      const newSession = await getSession();
      const newAccessToken = newSession?.accessToken;
      if (newAccessToken) headers.set("Authorization", `Bearer ${newAccessToken}`);

      // Retry original request
      res = await fetch(`${baseUrl}${input}`, { ...init, headers });
    }

    // Parse error if response not ok
    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      const errorText = contentType?.includes("application/json")
        ? JSON.stringify(await res.json())
        : await res.text();
      throw new Error(errorText);
    }

    return res;
  } catch (error) {
    console.error("🚨 fetchWithToken error:", error);
    throw error;
  }
}

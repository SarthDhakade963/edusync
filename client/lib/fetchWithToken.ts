import { getSession, signOut } from "next-auth/react";

export async function fetchWithToken(input: RequestInfo, init?: RequestInit) {
  try {
    const session = await getSession();
    const accesstoken = session?.accessToken;
    const refreshToken = session?.refreshToken;
    const headers = new Headers(init?.headers as HeadersInit);

    if (accesstoken) headers.set("Authorization", `Bearer ${accesstoken}`);

    headers.set("Content-Type", "application/json");

    let res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${input}`,
      {
        ...init,
        headers,
      }
    );

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      const errorText = contentType?.includes("application/json")
        ? JSON.stringify(await res.json())
        : await res.text();
      throw new Error(errorText);
    }

    if (res.status === 401) {
      console.warn("⚠️ Access token expired, attempting refresh...");

      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (refreshResponse.ok) {
        console.log(
          "🔁 Token refreshed successfully. Retrying original request..."
        );
        // Step 3: Retry the original request
        res = await fetch(
          `${process.env.NEXT_PUBLIC_SPRING_BASE_URL}${input}`,
          {
            ...init,
            headers,
          }
        );
      } else {
        console.error("❌ Refresh token invalid — signing out user.");
        signOut({ callbackUrl: "/" });
        return refreshResponse; // optional early return
      }
    }

    return res;
  } catch (error) {
    console.error("🚨 fetchWithToken error:", error);
    throw error;
  }
}

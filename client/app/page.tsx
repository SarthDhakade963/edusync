"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      if (session.user.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/student/dashboard");
    } else {
      router.push("/auth");
    }
  }, [session, router]);
  return null;
}

"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const autoRedirect = () => {
      router.push("/auth");
    };

    autoRedirect();
  }, [router]);
  return null;
};

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";

export default function AppLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const authRaw = localStorage.getItem("auth");

    if (!authRaw) {
      router.replace("/login");
      return;
    }

    const auth = JSON.parse(authRaw);

    if (!auth.expiresAt || Date.now() > auth.expiresAt) {
      localStorage.removeItem("auth");
      router.replace("/login");
    }
  }, [router]);

  return (
    <>
      <Header />
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
    </>
  );
}
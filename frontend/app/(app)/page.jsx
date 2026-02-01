"use client";

import { useEffect, useState } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserPage from "@/components/user/UserPage";

export default function HomePage() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth) {
      setRole(auth.user.role);
    }
  }, []);

  if (!role) return null;

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <UserPage />;
}
"use client";

import { useEffect, useState } from "react";
import { getAuth } from "@/utils/api";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserPage from "@/components/user/UserPage";

export default function HomePage() {
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setRole(auth.user.role);
      setUserName(auth.user.name);
    }
  }, []);

  if (!role) return null;

  return role === "admin" ? <AdminDashboard /> : <UserPage userName={userName} />;
}

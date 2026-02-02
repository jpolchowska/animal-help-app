"use client";

import { getAuth } from "@/utils/api";
import AdoptionsAdmin from "@/components/admin/AdoptionsAdmin";
import MyAdoptions from "@/components/user/MyAdoptions";

export default function AdoptionsPage() {
  const auth = getAuth();
  const role = auth?.user?.role;

  if (!role) return null;

  if (role === "admin") {
    return <AdoptionsAdmin />
  }

  return <MyAdoptions />;
}
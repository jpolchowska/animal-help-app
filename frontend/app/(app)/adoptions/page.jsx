"use client";

import dynamic from "next/dynamic";
import { getAuth } from "@/utils/api";
// import AdoptionsAdmin from "@/components/admin/AdoptionsAdmin";
// import MyAdoptions from "@/components/user/MyAdoptions";

const MyAdoptions = dynamic(
  () => import("@/components/user/MyAdoptions"),
  { ssr: false }
);

const AdoptionsAdmin = dynamic(
  () => import("@/components/admin/AdoptionsAdmin"),
  { ssr: false }
);

export default function AdoptionsPage() {
  const auth = getAuth();
  const role = auth?.user?.role;

  if (!role) return null;

  if (role === "admin") {
    return <AdoptionsAdmin />
  }

  return <MyAdoptions />;
}
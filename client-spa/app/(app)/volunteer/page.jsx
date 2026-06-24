"use client";

import { getAuth } from "@/utils/api";
import { useState, useEffect } from "react";

import VolunteerJoin from "@/components/volunteer/VolunteerJoin";
import VolunteerTasks from "@/components/volunteer/VolunteerTasks";
import MyTasks from "@/components/volunteer/MyTasks";
import AdminTasks from "@/components/volunteer/AdminTasks";
import VolunteerView from "@/components/volunteer/VolunteerView";

export default function VolunteerPage() {
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setRole(auth?.user?.role || null);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (role === "admin") return <AdminTasks />;
  if (role === "volunteer") return <VolunteerView />;
  return <VolunteerJoin onBecameVolunteer={() => setRole("volunteer")} />;
}
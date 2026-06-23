"use client";

import { useEffect } from "react";
import { getKeycloakInstance } from "@/utils/keycloak";

export default function RegisterPage() {
  useEffect(() => {
    getKeycloakInstance()?.login();
  }, []);

  return null;
}

export function getAuth() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("auth");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getAuth();
}

export function getUser() {
  return getAuth()?.user || null;
}

export function getRole() {
  return getAuth()?.user?.role || null;
}

export function logout() {
  localStorage.removeItem("auth");
  window.location.href = "/login";
}
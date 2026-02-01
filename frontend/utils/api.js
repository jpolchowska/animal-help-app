export function getAuth() {
  if (typeof window === "undefined") return null;
  const auth = localStorage.getItem("auth");
  return auth ? JSON.parse(auth) : null;
}

export async function authFetch(url, options = {}) {
  const auth =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("auth"))
      : null;

  const headers = options.isFormData
    ? {}
    : { "Content-Type": "application/json" };

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: `Bearer ${auth?.token}`
    }
  });
}
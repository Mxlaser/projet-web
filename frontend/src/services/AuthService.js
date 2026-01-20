import { api } from "../api/axios";

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  //{ token: "..." }
  return res.data;
}

export async function register(payload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

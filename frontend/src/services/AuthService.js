import { api } from "../api/axios";

export async function login(email, password) {
  const res = await api.post("/api/auth/login", {
    email,
    password,
  });
  return res.data; 
}

export async function register(payload) {
  const res = await api.post("/api/auth/register", payload);
  return res.data;
}

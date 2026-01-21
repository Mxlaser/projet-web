import { api } from "../api/axios";

export async function fetchResources(params = {}) {
  const res = await api.get("/api/resources", { params });
  return res.data; 
}

export async function deleteResource(id) {
  const res = await api.delete(`/api/resources/${id}`);
  return res.data;
}

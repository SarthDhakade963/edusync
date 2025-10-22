// lib/auth.ts
import api from "./api";

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const signup = async (body: { name: string; email: string; password: string; role?: string }) => {
  const res = await api.post("/auth/signup", body);
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

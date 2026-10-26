import api, { setToken } from "./api";

const startSession = ({ user, token }) => {
  setToken(token);
  return user;
};

export const login = async ({ email, password }) =>
  startSession(await api.post("/auth/login", { email, password }, { auth: false }));

export const register = async ({ name, email, password }) =>
  startSession(await api.post("/auth/register", { name, email, password }, { auth: false }));

export const fetchCurrentUser = async () => (await api.get("/auth/me")).user;

export const logout = () => setToken(null);

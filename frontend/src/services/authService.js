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

// Signs out every other session and keeps this one alive with the fresh token.
export const changePassword = async ({ currentPassword, newPassword }) =>
  startSession(await api.post("/auth/change-password", { currentPassword, newPassword }));

// Is public sign-up still open? It is only open until the first (Admin) account exists.
export const fetchRegistrationOpen = async () => (await api.get("/auth/registration", { auth: false })).open;

export const logout = () => setToken(null);

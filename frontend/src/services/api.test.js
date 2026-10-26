import { beforeEach, describe, expect, it, vi } from "vitest";
import api, { ApiError, onUnauthorized, query, setToken } from "./api";

const reply = (status, body) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

beforeEach(() => {
  localStorage.clear();
  onUnauthorized(null);
  vi.stubGlobal("fetch", vi.fn());
});

describe("query", () => {
  it("skips empty values and the All placeholder", () => {
    expect(query({ search: "pen", status: "All", page: 2, empty: "", nothing: undefined })).toBe("?search=pen&page=2");
    expect(query({})).toBe("");
    expect(query()).toBe("");
  });

  it("encodes special characters", () => {
    expect(query({ search: "a&b c" })).toBe("?search=a%26b+c");
  });
});

describe("api requests", () => {
  it("sends the stored token and unwraps data", async () => {
    setToken("abc123");
    fetch.mockReturnValue(reply(200, { success: true, data: { items: [1] } }));

    await expect(api.get("/things")).resolves.toEqual({ items: [1] });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/\/things$/);
    expect(options.headers.Authorization).toBe("Bearer abc123");
  });

  it("does not send a token on login-style calls", async () => {
    setToken("abc123");
    fetch.mockReturnValue(reply(200, { data: {} }));
    await api.post("/auth/login", { email: "a@b.c" }, { auth: false });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: "a@b.c" });
  });

  it("throws the server's message with its status and details", async () => {
    fetch.mockReturnValue(reply(400, { message: "Amount must be positive", details: [{ field: "amount" }] }));

    const error = await api.post("/x", {}).catch((err) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Amount must be positive");
    expect(error.status).toBe(400);
    expect(error.details).toEqual([{ field: "amount" }]);
  });

  it("calls the unauthorized handler on a 401 for signed-in calls only", async () => {
    const handler = vi.fn();
    onUnauthorized(handler);

    fetch.mockReturnValue(reply(401, { message: "Invalid or expired token" }));
    await api.get("/finance/ledger").catch(() => {});
    expect(handler).toHaveBeenCalledTimes(1);

    // a wrong password on the login form is not an expired session
    await api.post("/auth/login", {}, { auth: false }).catch(() => {});
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("explains a network failure in plain words", async () => {
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    const error = await api.get("/x").catch((err) => err);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/cannot reach the server/i);
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 502, json: () => Promise.reject(new Error("html")) }));
    const error = await api.get("/x").catch((err) => err);
    expect(error.message).toBe("Something went wrong");
  });
});

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";
import { useFetch } from "./useFetch";
import { usePage } from "./usePagination";

afterEach(() => vi.useRealTimers());

describe("useDebounce", () => {
  it("only updates after the value stops changing", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: "a" } });

    rerender({ value: "ab" });
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("abc");
  });
});

describe("usePage", () => {
  it("goes back to page 1 when a filter changes, but not otherwise", () => {
    const { result, rerender } = renderHook(({ keys }) => usePage(keys), { initialProps: { keys: ["", "All"] } });

    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);

    rerender({ keys: ["", "All"] }); // same filters
    expect(result.current[0]).toBe(3);

    rerender({ keys: ["pen", "All"] }); // search changed
    expect(result.current[0]).toBe(1);
  });
});

describe("useFetch", () => {
  it("loads data, then reloads on demand", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ n: 1 }).mockResolvedValueOnce({ n: 2 });
    const { result } = renderHook(() => useFetch(fetcher, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ n: 1 }));
    expect(result.current.loading).toBe(false);

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toEqual({ n: 2 }));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("refetches when its inputs change and keeps old data while loading", async () => {
    const fetcher = vi.fn((term) => Promise.resolve({ term }));
    const { result, rerender } = renderHook(({ term }) => useFetch(() => fetcher(term), [term]), {
      initialProps: { term: "a" },
    });
    await waitFor(() => expect(result.current.data).toEqual({ term: "a" }));

    rerender({ term: "b" });
    expect(result.current.data).toEqual({ term: "a" }); // no flicker to empty
    await waitFor(() => expect(result.current.data).toEqual({ term: "b" }));
  });

  it("exposes the error message and clears it on a successful retry", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("Server is down")).mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useFetch(fetcher, []));

    await waitFor(() => expect(result.current.error).toBe("Server is down"));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    expect(result.current.error).toBe("");
  });
});

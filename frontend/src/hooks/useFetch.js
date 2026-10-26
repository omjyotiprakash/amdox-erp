import { useCallback, useEffect, useState } from "react";

// Loads data with `fetcher` on mount and whenever `deps` change.
// Previous data stays visible while a refetch is running, so searching/filtering doesn't flicker.
export const useFetch = (fetcher, deps = []) => {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: "" }));

    fetcher()
      .then((data) => !cancelled && setState({ data, loading: false, error: "" }))
      .catch((err) => !cancelled && setState((previous) => ({ ...previous, loading: false, error: err.message })));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { ...state, reload };
};

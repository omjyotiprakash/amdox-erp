import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchNotifications } from "../services/notificationService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext({ items: [], count: 0, reload: () => {} });

const REFRESH_MS = 2 * 60 * 1000;

// Alerts are worked out on the server from live data. Refresh now and then so the bell stays current.
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setItems(data.items);
    } catch {
      // The bell is a convenience; keep the last known alerts if a refresh fails.
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return undefined;
    }
    reload();
    const timer = setInterval(reload, REFRESH_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, reload]);

  const value = useMemo(() => ({ items, count: items.length, reload }), [items, reload]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);

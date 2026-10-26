import { useEffect, useRef } from "react";

// Shared behaviour for every popup: stop the page scrolling behind it and close on Escape.
// Counts open popups so closing one of two stacked popups doesn't unlock the page too early.
let openCount = 0;

export const useModal = (onClose) => {
  // The latest onClose, without re-subscribing on every render (callers pass a new function each time).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    openCount += 1;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeRef.current?.();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openCount -= 1;
      if (openCount === 0) document.body.style.overflow = "";
    };
  }, []);
};

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Sheet from "../components/common/Sheet";

// Replaces the browser's plain confirm() box with a popup that matches the app (a bottom sheet on phones).
// Usage:  const confirm = useConfirm();
//         if (!(await confirm({ message: "Delete this?", confirmLabel: "Delete", danger: true }))) return;
//
// Outside a provider (for example in a unit test) it falls back to the browser's own confirm().
const ConfirmContext = createContext((options) => Promise.resolve(window.confirm(options.message)));

export const ConfirmProvider = ({ children }) => {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (next) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(next);
      }),
    []
  );

  const settle = useCallback((answer) => {
    resolver.current?.(answer);
    resolver.current = null;
    setOptions(null);
  }, []);

  const { title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false } = options ?? {};

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <Sheet label={title || "Please confirm"} onClose={() => settle(false)}>
          <div className="px-5 pb-2 pt-1 sm:pt-5">
            <h2 className="text-lg font-semibold text-slate-900">{title || "Are you sure?"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex sm:justify-end sm:pb-5">
            <button
              type="button"
              onClick={() => settle(false)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:rounded-lg sm:py-2"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => settle(true)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold text-white sm:rounded-lg sm:py-2 ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </Sheet>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);

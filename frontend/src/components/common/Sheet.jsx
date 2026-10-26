import { createPortal } from "react-dom";
import { useModal } from "../../hooks/useModal";

// The one popup shell used everywhere. On a phone it is a bottom sheet that slides up from the
// screen edge (thumb-friendly, with room for the home indicator); on larger screens it is a
// centred dialog. Tapping the dim background or pressing Escape closes it.
//
// It renders into <body> so no parent (a sticky header, the bottom tab bar) can ever sit on top of it.
const Sheet = ({ label, onClose, children, width = "sm:max-w-md" }) => {
  useModal(onClose);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`sheet-panel flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:max-h-[90dvh] sm:rounded-2xl ${width}`}
      >
        {/* grab handle: a visual hint that this is a sheet you can dismiss */}
        <div className="flex justify-center pb-1 pt-2 sm:hidden" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-slate-300" />
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Sheet;

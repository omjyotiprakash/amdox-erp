import { useEffect } from "react";

// Previous/Next controls for a paged list. Renders nothing when everything fits on one page.
const Pagination = ({ page, pages, matching, limit, onChange }) => {
  // If rows were deleted and the current page no longer exists, step back to the last one.
  useEffect(() => {
    if (pages && page > pages) onChange(pages);
  }, [page, pages, onChange]);

  if (!pages || pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, matching);
  const buttonClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 sm:flex-row"
    >
      <span>
        Rows {from}–{to} of {matching}
      </span>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={buttonClass}>
          Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} className={buttonClass}>
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

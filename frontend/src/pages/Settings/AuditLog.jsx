import { useState } from "react";
import ErrorBanner from "../../components/common/ErrorBanner";
import Pagination from "../../components/common/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import { useFetch } from "../../hooks/useFetch";
import { usePage } from "../../hooks/usePagination";
import { fetchAuditLog } from "../../services/settingsService";

const actionStyle = {
  create: "bg-emerald-50 text-emerald-700",
  update: "bg-blue-50 text-blue-700",
  delete: "bg-red-50 text-red-700",
};

const formatWhen = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const AuditLog = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePage([debouncedSearch, actionFilter]);
  const { data, loading, error, reload } = useFetch(
    () => fetchAuditLog({ search: debouncedSearch, action: actionFilter, page }),
    [debouncedSearch, actionFilter, page]
  );

  const entries = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="mt-1 text-sm text-slate-500">
            Who created, changed, or deleted records. Entries are kept for one year.
          </p>
        </div>

        <button
          type="button"
          onClick={reload}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by person or area, e.g. finance..."
              aria-label="Search audit log"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              aria-label="Filter by action"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Who</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Record</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatWhen(entry.createdAt)}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{entry.userName}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${actionStyle[entry.action]}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{entry.resource}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{entry.target || "—"}</td>
                </tr>
              ))}

              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading audit log..."
                      : data?.total
                        ? "No entries match your search."
                        : "Nothing has been recorded yet. Changes made from now on will appear here."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {entries.length} of {data?.matching ?? 0} entries. Only successful changes are recorded, never the
          data itself.
        </div>
        <Pagination page={data?.page} pages={data?.pages} matching={data?.matching} limit={data?.limit} onChange={setPage} />
      </section>
    </div>
  );
};

export default AuditLog;

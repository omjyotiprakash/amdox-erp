import React from "react";

const MetricsCard = ({ title, value, description, icon, color }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-semibold ${color}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
};

export default MetricsCard;
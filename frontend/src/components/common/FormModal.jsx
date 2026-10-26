import { useState } from "react";
import Sheet from "./Sheet";

// 16px text on phones stops iOS from zooming the page when a field is focused.
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:py-2 sm:text-sm";

// fields: [{ name, label, type?: "text"|"number"|"date"|"select", options?: (string|{value,label})[],
//            placeholder?, step?, optional?, min? }]
const optionValue = (option) => (typeof option === "string" ? option : option.value);
const optionLabel = (option) => (typeof option === "string" ? option : option.label);

// Generic "add / edit a record" popup (a bottom sheet on phones).
const FormModal = ({ title, fields, initialValues = {}, submitLabel = "Save", onSubmit, onClose }) => {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        initialValues[field.name] ?? (field.options?.length ? optionValue(field.options[0]) : ""),
      ])
    )
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Sheet label={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-5 pb-2 pt-1 sm:pt-5">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        {/* only the fields scroll; the title and the buttons stay in view */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={`field-${field.name}`} className="mb-1 block text-sm font-medium text-slate-700">
                {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  id={`field-${field.name}`}
                  name={field.name}
                  value={values[field.name]}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  {field.options.map((option) => (
                    <option key={optionValue(option)} value={optionValue(option)}>
                      {optionLabel(option)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`field-${field.name}`}
                  name={field.name}
                  type={field.type || "text"}
                  step={field.type === "number" ? field.step || "0.01" : undefined}
                  min={field.type === "number" ? (field.min ?? "0.01") : undefined}
                  inputMode={field.type === "number" ? "decimal" : undefined}
                  value={values[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={!field.optional}
                  className={inputClass}
                />
              )}
            </div>
          ))}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex sm:justify-end sm:pb-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:rounded-lg sm:py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-lg sm:py-2"
          >
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </Sheet>
  );
};

export default FormModal;

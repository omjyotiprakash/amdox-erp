import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Generic "add record" dialog.
// fields: [{ name, label, type?: "text"|"number"|"date"|"select", options?: (string|{value,label})[],
//            placeholder?, step?, optional?, min? }]
const optionValue = (option) => (typeof option === "string" ? option : option.value);
const optionLabel = (option) => (typeof option === "string" ? option : option.label);

const FormModal = ({ title, fields, initialValues = {}, submitLabel = "Save", onSubmit, onClose }) => {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, initialValues[field.name] ?? (field.options?.length ? optionValue(field.options[0]) : "")]))
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-full w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

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

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormModal;

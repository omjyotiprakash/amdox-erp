const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start font-semibold text-red-800 underline hover:text-red-900"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;

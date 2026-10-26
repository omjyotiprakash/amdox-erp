const pad = (value) => String(value).padStart(2, "0");

// Today's date in the browser's local time zone as YYYY-MM-DD
// (toISOString() would give the UTC date, which is "yesterday" just after local midnight).
export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Current month in local time as YYYY-MM
export const localMonth = () => localToday().slice(0, 7);

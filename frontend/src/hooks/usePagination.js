import { useState } from "react";

// Current page number that jumps back to 1 whenever any of `resetKeys` (search text, filters) changes.
// Resetting during render is React's recommended way to derive state from changing inputs.
export const usePage = (resetKeys = []) => {
  const [page, setPage] = useState(1);
  const signature = JSON.stringify(resetKeys);
  const [lastSignature, setLastSignature] = useState(signature);

  if (signature !== lastSignature) {
    setLastSignature(signature);
    setPage(1);
  }

  return [page, setPage];
};

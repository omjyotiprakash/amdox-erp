import { useEffect } from "react";

const ACTION_HEADERS = /^(action|actions|update status)$/i;

// Phones can't show a wide table, so index.css turns each table row into a card. Each cell
// needs to know its column heading to print it as a label; this copies the heading text onto the cells.
export const labelTableCells = (root) => {
  root.querySelectorAll("table").forEach((table) => {
    const headings = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());

    table.querySelectorAll("tbody tr").forEach((row) => {
      [...row.children].forEach((cell, index) => {
        if (cell.hasAttribute("colspan")) return; // "no results" rows span the whole table
        const label = headings[index];
        if (!label) return;
        if (cell.dataset.label !== label) cell.dataset.label = label;
        if (ACTION_HEADERS.test(label)) cell.dataset.kind = "actions";
      });
    });
  });
};

// Keeps the labels current as pages load and filter their data.
export const useStackedTables = (ref) => {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => labelTableCells(root));
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true }); // attribute changes are ignored, so no loop

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref]);
};

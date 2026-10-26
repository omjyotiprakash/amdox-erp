// Small outline icons for the mobile tab bar and menus.
const PATHS = {
  home: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0",
  finance: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v10M9.5 9.5C9.5 8.7 10.6 8 12 8s2.5.7 2.5 1.5S13.4 11 12 11s-2.5.7-2.5 1.5S10.6 14 12 14s2.5-.7 2.5-1.5",
  hr: "M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M10 11a3 3 0 100-6 3 3 0 000 6zM21 20v-1a3 3 0 00-2-2.8M16 5.2a3 3 0 010 5.6",
  supplyChain: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
  projects: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  menu: "M4 6h16M4 12h16M4 18h16",
  bell: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0",
};

const Icon = ({ name, className = "h-6 w-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={PATHS[name]} />
  </svg>
);

export default Icon;

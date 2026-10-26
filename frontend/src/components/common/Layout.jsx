import { useEffect, useRef, useState } from "react";
import { useStackedTables } from "../../hooks/useStackedTables";
import BottomNav from "./BottomNav";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);

  // Tables turn into cards on phones; this gives each cell its label.
  useStackedTables(mainRef);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-dvh bg-slate-50 md:flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* the bottom padding keeps the last row clear of the phone tab bar */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main ref={mainRef} className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
          <div className="flex-1">{children}</div>
        </main>

        <Footer />
      </div>

      <BottomNav onMenuClick={() => setSidebarOpen(true)} />
    </div>
  );
};

export default Layout;

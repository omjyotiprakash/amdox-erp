
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        
        <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
          <div className="flex-1">
            {children}
          </div>
        </main>

      <Footer />

      </div>
    </div>
  );
};

export default Layout;

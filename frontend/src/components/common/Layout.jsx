import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar/>

      <div className="min-w-0 flex-1">
        <Header />

        <div className="flex min-h-[calc(100vh-80px)] flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layout
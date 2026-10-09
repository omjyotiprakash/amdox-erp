
import RegisterForm from "../components/Auth/RegisterForm";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const Register = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;

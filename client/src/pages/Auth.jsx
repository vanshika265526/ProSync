import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import LoginForm from "../components/Login";
import SignupForm from "../components/Signup";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [successMsg, setSuccessMsg] = useState("");

  const handleToggle = (loginMode) => {
    setIsLogin(loginMode);
    setSuccessMsg("");
    navigate(loginMode ? "/login" : "/signup");
  };

  const onSignupSuccess = (msg) => {
    setSuccessMsg(msg);
    setIsLogin(true);
    navigate("/login");
  };

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    if (location.pathname === "/signup") {
      setSuccessMsg("");
    }
  }, [location]);

  return (
    <div className="flex min-h-screen font-['Outfit'] bg-white dark:bg-midnight text-slate-900 dark:text-white transition-colors duration-300">

      {/* LEFT HERO SECTION (UNCHANGED) */}
      <div
        className="hidden lg:flex w-1/2 relative flex-col justify-end p-12 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-[#6200EA]/80 dark:bg-midnight/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-electric-purple/80 to-neon-cyan/40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-midnight via-transparent to-transparent opacity-90" />

        <div className="relative z-10 max-w-lg mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-electric-purple rounded-lg flex items-center justify-center text-white font-bold text-lg">
              PS
            </div>
            <span className="text-xl font-bold text-white">ProSync</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6 text-white">
            Built for the next <br />
            <span className="text-neon-cyan">Generation.</span>
          </h1>

          <p className="text-lg text-slate-100 mb-8">
            Streamline your architectural workflows with high-performance team
            management and structural planning tools.
          </p>
        </div>
      </div>

      {/* RIGHT AUTH SECTION */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8 lg:p-24 relative border-l border-slate-100 dark:border-white/5">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {successMsg && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm mb-6 flex items-center justify-center font-semibold">
              {successMsg}
            </div>
          )}
          <h2 className="text-3xl font-bold mb-2">Welcome to ProSync</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Join the high-performance architectural teams.
          </p>

          {/* TOGGLE */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-8">
            <button
              onClick={() => handleToggle(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${isLogin
                ? "bg-white dark:bg-[#00F2EA] text-slate-900"
                : "text-slate-500"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleToggle(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${!isLogin
                ? "bg-white dark:bg-[#00F2EA] text-slate-900"
                : "text-slate-500"
                }`}
            >
              Create Account
            </button>
          </div>

          {/* CONDITIONAL FORM */}
          {isLogin ? (
            <LoginForm />
          ) : (
            <SignupForm onSuccess={onSignupSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;


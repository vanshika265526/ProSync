import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useDashboard } from "../context/DashboardContext";
import { useGoogleLogin } from "@react-oauth/google";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useDashboard();

  const { email, password } = formData;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        const data = await authService.googleLogin(null, tokenResponse.access_token);
        login(data);
        navigate("/dashboard");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Google Login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Login failed. Please try again.");
    },
  });

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await authService.login({ email, password });
      login(userData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Work Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            placeholder="name@company.com"
            className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:border-electric-purple dark:focus:border-neon-cyan
              focus:ring-1 focus:ring-electric-purple dark:focus:ring-neon-cyan
              outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50
                border border-slate-200 dark:border-slate-700
                text-slate-900 dark:text-white
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:border-electric-purple dark:focus:border-neon-cyan
                focus:ring-1 focus:ring-electric-purple dark:focus:ring-neon-cyan
                outline-none transition-all text-sm"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-slate-400 dark:text-slate-500
                hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 dark:bg-[#00F2EA]
            hover:bg-slate-800 dark:hover:bg-[#00d4cc]
            text-white dark:text-slate-900
            font-bold py-3.5 rounded-xl
            transition-all shadow-lg hover:shadow-xl
            hover:-translate-y-0.5 active:translate-y-0 text-sm disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In to Dashboard"}
        </button>
      </form>


      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-500 uppercase tracking-widest">
          <span className="bg-white dark:bg-midnight px-3">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Auth */}
      <button
        type="button"
        onClick={() => handleGoogleLogin()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3.5
          border border-slate-200 dark:border-slate-700
          bg-slate-50 dark:bg-slate-900/30
          rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800
          hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,242,234,0.1)]
          transition-all duration-300 group disabled:opacity-50">
        <FcGoogle size={22} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {loading ? "Authenticating..." : "Continue with Google"}
        </span>
      </button>
    </>
  );
};

export default LoginForm;

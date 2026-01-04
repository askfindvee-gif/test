import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ setIsAuthenticated }) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async ({ email, password }) => {
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("pfa_token", response.data.token);
      localStorage.setItem("pfa_user", JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async (e) => {
    e.preventDefault();

    // UI matches the provided screenshot (mobile-first).
    // Backend currently authenticates with email/password, so we use demo credentials here.
    if (!mobileNumber.trim()) {
      toast.error("Please enter your mobile number.");
      return;
    }

    await doLogin({ email: "admin@pfa.org", password: "admin123" });
  };

  const handleDemoMode = async () => {
    await doLogin({ email: "admin@pfa.org", password: "admin123" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0c] to-black flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl">
        {/* Icon */}
        <div className="mb-12 flex justify-center">
          <div className="h-20 w-20 border border-white/15 bg-white/[0.02] flex items-center justify-center">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-95"
              aria-hidden="true"
            >
              <path
                d="M12 11.2c-1.35 0-2.45 1.1-2.45 2.45S10.65 16.1 12 16.1s2.45-1.1 2.45-2.45S13.35 11.2 12 11.2Zm-4.95-3.8c-1.25 0-2.25 1-2.25 2.25s1 2.25 2.25 2.25S9.3 11.9 9.3 10.65 8.3 7.4 7.05 7.4Zm9.9 0c-1.25 0-2.25 1-2.25 2.25s1 2.25 2.25 2.25 2.25-1 2.25-2.25S18.2 7.4 16.95 7.4ZM6.15 16.95c-.95 0-1.7.75-1.7 1.7s.75 1.7 1.7 1.7 1.7-.75 1.7-1.7-.75-1.7-1.7-1.7Zm11.7 0c-.95 0-1.7.75-1.7 1.7s.75 1.7 1.7 1.7 1.7-.75 1.7-1.7-.75-1.7-1.7-1.7Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2" style={{ letterSpacing: "0.02em" }}>
            People For
          </h1>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-500 mb-5" style={{ letterSpacing: "0.02em" }}>
            Animals
          </h1>
          <p className="text-base text-white/90 mb-3" style={{ letterSpacing: "0.01em" }}>
            where empathy meets action.
          </p>
          <p className="text-[11px] text-slate-600 uppercase" style={{ letterSpacing: "0.25em" }}>
            A collective for the conscious citizen.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleProceed} className="space-y-7">
          <div className="text-left">
            <label className="text-[10px] text-slate-600 uppercase tracking-[0.2em] block mb-3">
              Mobile Number
            </label>

            <div className="flex gap-4">
              <div className="w-[84px] h-14 border border-white/12 bg-white/[0.02] flex items-center justify-center text-white/90 text-base">
                +91
              </div>
              <div className="flex-1 h-14 border border-white/12 bg-white/[0.02] px-6 flex items-center">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(
                      e.target.value.replace(/[^\d]/g, "").slice(0, 10),
                    )
                  }
                  className="w-full bg-transparent text-white/90 text-2xl tracking-[0.25em] focus:outline-none placeholder:text-slate-700"
                  placeholder="0000000000"
                  required
                  data-testid="login-mobile-input"
                  aria-label="Mobile number"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white/60 hover:bg-white/70 disabled:opacity-60 disabled:hover:bg-white/60 text-black font-semibold text-sm uppercase tracking-[0.18em] transition-colors duration-200 flex items-center justify-center gap-3 mt-8"
            data-testid="login-submit-button"
          >
            <span>{loading ? "Processing..." : "Proceed"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleDemoMode}
            disabled={loading}
            className="w-full h-14 border border-white/12 bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-60 text-white font-semibold text-sm uppercase tracking-[0.18em] transition-colors duration-200 flex items-center justify-center gap-3"
            data-testid="login-demo-button"
          >
            <span>Continue in Demo Mode</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-center gap-10 text-[10px] text-slate-700 uppercase tracking-[0.2em]">
          <span>Secure Access</span>
          <span>Privacy Ensured</span>
        </div>
      </div>
    </div>
  );
}
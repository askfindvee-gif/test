import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      localStorage.setItem('pfa_token', response.data.token);
      localStorage.setItem('pfa_user', JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Paw Icon */}
        <div className="mb-16 flex justify-start">
          <div className="border border-white/20 px-8 py-3">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="white"
              className="opacity-90"
            >
              <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.5 16c-.83 0-1.5.67-1.5 1.5S4.67 19 5.5 19 7 18.33 7 17.5 6.33 16 5.5 16zm13 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3" style={{ letterSpacing: '0.02em' }}>
            People For
          </h1>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-500 mb-6" style={{ letterSpacing: '0.02em' }}>
            Animals
          </h1>
          <p className="text-base text-white mb-3" style={{ letterSpacing: '0.01em' }}>
            where empathy meets action.
          </p>
          <p className="text-[11px] text-gray-600 uppercase" style={{ letterSpacing: '0.25em' }}>
            A collective for the conscious citizen.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="text-[10px] text-gray-600 uppercase tracking-[0.2em] block mb-3">
              Mobile Number
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 text-white text-lg py-3 focus:outline-none focus:border-white/30 transition-colors placeholder:text-gray-700"
              placeholder="admin@pfa.org"
              required
              data-testid="login-email-input"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-600 uppercase tracking-[0.2em] block mb-3">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 text-white text-lg py-3 focus:outline-none focus:border-white/30 transition-colors placeholder:text-gray-700"
              placeholder="Enter password"
              required
              data-testid="login-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-black font-semibold text-sm uppercase tracking-[0.15em] py-4 transition-colors duration-200 flex items-center justify-center gap-3 mt-12"
            data-testid="login-submit-button"
          >
            <span>{loading ? "Processing..." : "Proceed"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">
            Secure Access · Privacy Ensured
          </p>
          <p className="text-xs text-gray-600 mt-4">
            Default: admin@pfa.org / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
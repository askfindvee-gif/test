import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('pfa_token');
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('pfa_token');
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load stats");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pfa_token');
    localStorage.removeItem('pfa_user');
    localStorage.removeItem('pfa_demo');
    toast.success("Logged out successfully");
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="p-6 md:p-8 max-w-md mx-auto md:max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 border border-white/10 hover:border-white/20 transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white">
              Profile
            </h1>
            <p className="font-body text-xs text-gray-400 uppercase tracking-widest">
              Admin Account
            </p>
          </div>
        </div>

        {user && (
          <div className="space-y-6">
            <div className="bg-[#111111] border border-white/10  p-6" data-testid="profile-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16  bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="font-heading text-xl text-white uppercase tracking-wide">
                    {user.name}
                  </div>
                  <div className="font-body text-sm text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 uppercase tracking-wider">Role:</span>
                <span className="text-green-500 font-semibold uppercase">{user.role}</span>
              </div>
            </div>

            {stats && (
              <div className="bg-[#111111] border border-white/10  p-6" data-testid="stats-card">
                <div className="font-heading text-lg text-white uppercase tracking-wide mb-4">
                  Statistics
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-heading text-3xl text-white mb-1">
                      {stats.impact_score}
                    </div>
                    <div className="font-body text-xs text-gray-500 uppercase tracking-wider">
                      Impact Score
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-heading text-3xl text-white mb-1">
                      {stats.days_active}
                    </div>
                    <div className="font-body text-xs text-gray-500 uppercase tracking-wider">
                      Days Active
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-heading text-2xl text-white mb-1">
                      {stats.total_incidents}
                    </div>
                    <div className="font-body text-xs text-gray-500 uppercase tracking-wider">
                      Incidents
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-heading text-2xl text-white mb-1">
                      {stats.total_activities}
                    </div>
                    <div className="font-body text-xs text-gray-500 uppercase tracking-wider">
                      Activities
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-heading text-2xl text-white mb-1">
                      {stats.total_missing}
                    </div>
                    <div className="font-body text-xs text-gray-500 uppercase tracking-wider">
                      Missing Reports
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-heading text-2xl text-white mb-1">
                      {stats.total_sos}
                    </div>
                    <div className="font-body text-xs text-gray-500 uppercase tracking-wider">
                      SOS Alerts
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogout}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-body font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              data-testid="logout-button"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
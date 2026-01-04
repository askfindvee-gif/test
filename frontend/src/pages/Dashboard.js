import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bell, LayoutDashboard, Siren, Activity, MessageCircle, User, ShieldAlert, Utensils, Search, TrendingUp, Map } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('pfa_user') || '{}');
    if (user.name) {
      setUserName(user.name);
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        setStats({
          impact_score: 128,
          days_active: 42,
          total_incidents: 18,
          total_activities: 64,
          total_missing: 7,
          total_sos: 3,
          pending_volunteers: 5,
        });
        return;
      }
      const token = localStorage.getItem('pfa_token');
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    }
  };

  return (
    <div className="min-h-screen bg-app pb-24">
      <div className="p-6 md:p-8 max-w-md mx-auto md:max-w-4xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl tracking-wider text-primary mb-1">
              Welcome, {userName}!
            </h1>
            <p className="font-body text-sm md:text-base text-secondary tracking-widest">
              Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/notifications')}
              className="p-3 border border-primary hover:border-white/20 transition-colors relative"
              data-testid="notifications-button"
            >
              <Bell className="w-6 h-6 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 animate-pulse"></div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-green-500  animate-pulse" data-testid="system-status-indicator"></div>
          <span className="font-body text-xs font-bold uppercase tracking-wider text-gray-500">
            System Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 flex flex-col justify-between h-32 bg-white" data-testid="impact-score-card">
            <div className="p-3 bg-gray-200 w-fit">
              <Activity className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-heading text-4xl text-black mb-1">
                {stats?.impact_score || 0}
              </div>
              <div className="font-body text-xs uppercase tracking-wider text-gray-500">
                Impact Score
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between h-32 bg-[#111111] border border-white/10" data-testid="days-active-card">
            <div className="p-3 bg-white/10 w-fit">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-heading text-4xl text-white mb-1">
                {stats?.days_active || 0}
              </div>
              <div className="font-body text-xs uppercase tracking-wider text-gray-500">
                Days Active
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/incidents')}
            className="group relative overflow-hidden bg-orange-600 border border-orange-500/20 p-5 hover:bg-orange-700 transition-all duration-300 active:scale-95 text-left"
            data-testid="report-incident-button"
          >
            <div className="p-3 bg-orange-800/50 w-fit mb-3">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div className="font-heading text-lg tracking-wide text-white mb-1">
              Report Incident
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-orange-200">
              Cruelty - Emergency
            </div>
          </button>

          <button
            onClick={() => navigate('/activities')}
            className="group relative overflow-hidden bg-green-600 border border-green-500/20 p-5 hover:bg-green-700 transition-all duration-300 active:scale-95 text-left"
            data-testid="log-activity-button"
          >
            <div className="p-3 bg-green-800/50 w-fit mb-3">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div className="font-heading text-lg tracking-wide text-white mb-1">
              Log Activity
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-green-200">
              Feeding - Care
            </div>
          </button>

          <button
            onClick={() => navigate('/missing')}
            className="group relative overflow-hidden bg-yellow-500 border border-yellow-400/20 p-5 hover:bg-yellow-600 transition-all duration-300 active:scale-95 text-left"
            data-testid="report-missing-button"
          >
            <div className="p-3 bg-yellow-700/50 w-fit mb-3">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="font-heading text-lg tracking-wide text-white mb-1">
              Report Missing
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-yellow-100">
              Lost - Found
            </div>
          </button>

          <button
            onClick={() => navigate('/volunteers')}
            className="group relative overflow-hidden bg-blue-600 border border-blue-500/20 p-5 hover:bg-blue-700 transition-all duration-300 active:scale-95 text-left"
            data-testid="connect-button"
          >
            <div className="p-3 bg-blue-800/50 w-fit mb-3">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="font-heading text-lg tracking-wide text-white mb-1">
              Connect
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-blue-200">
              Chat - Sync
            </div>
          </button>

          <button
            onClick={() => navigate('/intelligence')}
            className="group relative overflow-hidden bg-purple-600 border border-purple-500/20 p-5 hover:bg-purple-700 transition-all duration-300 active:scale-95 text-left"
            data-testid="intelligence-button"
          >
            <div className="p-3 bg-purple-800/50 w-fit mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="font-heading text-lg tracking-wide text-white mb-1">
              Intelligence
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-purple-200">
              Analysis - Insights
            </div>
          </button>

          <button
            onClick={() => navigate('/geographic')}
            className="group relative overflow-hidden bg-cyan-600 border border-cyan-500/20 p-5 hover:bg-cyan-700 transition-all duration-300 active:scale-95 text-left"
            data-testid="geographic-button"
          >
            <div className="p-3 bg-cyan-800/50 w-fit mb-3">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div className="font-heading text-lg tracking-wide text-white mb-1">
              Geographic
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-cyan-200">
              Heatmap - Regions
            </div>
          </button>

          <button
            onClick={() => navigate('/sos')}
            className="col-span-2 bg-red-600 hover:bg-red-700 text-white p-5 flex items-center justify-between transition-all active:scale-95"
            data-testid="emergency-sos-button"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-800/50">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-heading text-xl tracking-wide text-white mb-1">
                  Emergency SOS
                </div>
                <div className="font-body text-xs uppercase tracking-wider text-red-200">
                  Alert - Help
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-600 uppercase tracking-widest">
          Powered by - PFA
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
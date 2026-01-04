import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SOS() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        const now = new Date();
        setAlerts([
          {
            id: "demo-sos-1",
            description: "Injured animal reported near metro entrance.",
            location: "Saket Metro",
            urgency: "high",
            status: "active",
            reported_by: "Citizen",
            created_at: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
            resolved_at: null,
          },
          {
            id: "demo-sos-2",
            description: "Dog trapped; rescue team dispatched.",
            location: "Rohini Sector 12",
            urgency: "medium",
            status: "active",
            reported_by: "Volunteer",
            created_at: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
            resolved_at: null,
          },
          {
            id: "demo-sos-3",
            description: "Emergency handled; case resolved.",
            location: "Mayur Vihar",
            urgency: "high",
            status: "resolved",
            reported_by: "Team",
            created_at: new Date(now.getTime() - 1000 * 60 * 60 * 10).toISOString(),
            resolved_at: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(),
          },
        ]);
        return;
      }
      const token = localStorage.getItem('pfa_token');
      const response = await axios.get(`${API}/sos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data);
    } catch (error) {
      toast.error("Failed to load SOS alerts");
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id) => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "resolved", resolved_at: new Date().toISOString() }
              : a,
          ),
        );
        toast.success("Alert resolved");
        return;
      }
      const token = localStorage.getItem('pfa_token');
      await axios.put(`${API}/sos/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Alert resolved");
      fetchAlerts();
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[urgency] || colors.high;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-red-500/20 text-red-400 border-red-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || colors.active;
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
              Emergency SOS
            </h1>
            <p className="font-body text-xs text-gray-400 uppercase tracking-widest">
              Alert - Help
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="font-body text-gray-400">Loading alerts...</div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="font-body text-gray-400">No SOS alerts</div>
          </div>
        ) : (
          <div className="space-y-4" data-testid="sos-list">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#111111] border border-white/10  p-5 hover:border-white/20 transition-colors"
                data-testid={`sos-${alert.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <Badge className={`${getUrgencyColor(alert.urgency)} uppercase text-xs`}>
                      {alert.urgency}
                    </Badge>
                    <Badge className={`${getStatusColor(alert.status)} uppercase text-xs`}>
                      {alert.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="font-body text-sm text-gray-400 mb-3">
                  {alert.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{alert.location}</span>
                  <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                </div>

                {alert.status === 'active' && (
                  <Button
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                    className="bg-green-600 hover:bg-green-700 text-xs uppercase"
                    data-testid={`resolve-${alert.id}`}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="report" />
    </div>
  );
}
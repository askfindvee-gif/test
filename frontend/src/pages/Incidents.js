import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { apiGet, apiPut } from "@/lib/api";

export default function Incidents() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('pfa_token');
      const response = await apiGet(`/incidents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(response.data);
    } catch (error) {
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('pfa_token');
      await apiPut(`/incidents/${id}?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Status updated");
      fetchIncidents();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[severity] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      investigating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || colors.pending;
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
              Incident Reports
            </h1>
            <p className="font-body text-xs text-gray-400 uppercase tracking-widest">
              Manage All Cases
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="font-body text-gray-400">Loading incidents...</div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="font-body text-gray-400">No incidents reported yet</div>
          </div>
        ) : (
          <div className="space-y-4" data-testid="incidents-list">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-[#111111] border border-white/10  p-5 hover:border-white/20 transition-colors"
                data-testid={`incident-${incident.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <Badge className={`${getSeverityColor(incident.severity)} uppercase text-xs`}>
                      {incident.severity}
                    </Badge>
                    <Badge className={`${getStatusColor(incident.status)} uppercase text-xs`}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="font-heading text-lg text-white mb-2 uppercase tracking-wide">
                  {incident.type}
                </div>
                
                <p className="font-body text-sm text-gray-400 mb-3">
                  {incident.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{incident.location}</span>
                  <span>{new Date(incident.created_at).toLocaleDateString()}</span>
                </div>

                {incident.status !== 'resolved' && (
                  <div className="flex gap-2">
                    {incident.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(incident.id, 'investigating')}
                        className="bg-blue-600 hover:bg-blue-700 text-xs uppercase"
                        data-testid={`investigate-${incident.id}`}
                      >
                        Start Investigation
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => updateStatus(incident.id, 'resolved')}
                      className="bg-green-600 hover:bg-green-700 text-xs uppercase"
                      data-testid={`resolve-${incident.id}`}
                    >
                      Mark Resolved
                    </Button>
                  </div>
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
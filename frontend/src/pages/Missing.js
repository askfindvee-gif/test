import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Missing() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        const now = new Date();
        setReports([
          {
            id: "demo-missing-1",
            animal_type: "Dog",
            description: "Brown indie dog missing since yesterday evening.",
            location: "Rohini, Delhi",
            status: "lost",
            contact: "demo.contact@example.com",
            reported_by: "Resident",
            created_at: new Date(now.getTime() - 1000 * 60 * 60 * 20).toISOString(),
            updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 20).toISOString(),
          },
          {
            id: "demo-missing-2",
            animal_type: "Cat",
            description: "White cat found near park; looking for owner.",
            location: "Saket, Delhi",
            status: "found",
            contact: "demo.finder@example.com",
            reported_by: "Volunteer",
            created_at: new Date(now.getTime() - 1000 * 60 * 60 * 44).toISOString(),
            updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
          },
          {
            id: "demo-missing-3",
            animal_type: "Dog",
            description: "Reunited with family after verification.",
            location: "Mayur Vihar, Delhi",
            status: "reunited",
            contact: "demo.owner@example.com",
            reported_by: "Team",
            created_at: new Date(now.getTime() - 1000 * 60 * 60 * 80).toISOString(),
            updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 60).toISOString(),
          },
        ]);
        return;
      }
      const token = localStorage.getItem('pfa_token');
      const response = await axios.get(`${API}/missing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      toast.error("Failed to load missing reports");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r,
          ),
        );
        toast.success("Status updated");
        return;
      }
      const token = localStorage.getItem('pfa_token');
      await axios.put(`${API}/missing/${id}?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Status updated");
      fetchReports();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      lost: 'bg-red-500/20 text-red-400 border-red-500/30',
      found: 'bg-green-500/20 text-green-400 border-green-500/30',
      reunited: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.lost;
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
              Missing Reports
            </h1>
            <p className="font-body text-xs text-gray-400 uppercase tracking-widest">
              Lost - Found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="font-body text-gray-400">Loading reports...</div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="font-body text-gray-400">No missing reports yet</div>
          </div>
        ) : (
          <div className="space-y-4" data-testid="missing-list">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-[#111111] border border-white/10  p-5 hover:border-white/20 transition-colors"
                data-testid={`missing-${report.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${getStatusColor(report.status)} uppercase text-xs`}>
                    {report.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="font-heading text-lg text-white mb-2 uppercase tracking-wide">
                  {report.animal_type}
                </div>
                
                <p className="font-body text-sm text-gray-400 mb-3">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{report.location}</span>
                  <span>{report.contact}</span>
                </div>

                {report.status === 'lost' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(report.id, 'found')}
                      className="bg-green-600 hover:bg-green-700 text-xs uppercase"
                      data-testid={`found-${report.id}`}
                    >
                      Mark Found
                    </Button>
                  </div>
                )}
                {report.status === 'found' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(report.id, 'reunited')}
                    className="bg-blue-600 hover:bg-blue-700 text-xs uppercase"
                    data-testid={`reunited-${report.id}`}
                  >
                    Mark Reunited
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
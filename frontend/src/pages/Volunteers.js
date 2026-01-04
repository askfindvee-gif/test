import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Users, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Volunteers() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        const now = new Date();
        setVolunteers([
          {
            id: "demo-vol-1",
            name: "Rajesh Kumar",
            email: "rajesh.kumar@example.com",
            phone: "+91 98765 43210",
            location: "South Delhi",
            status: "pending",
            joined_at: new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString(),
          },
          {
            id: "demo-vol-2",
            name: "Asha Singh",
            email: "asha.singh@example.com",
            phone: "+91 91234 56789",
            location: "Rohini, Delhi",
            status: "approved",
            joined_at: new Date(now.getTime() - 1000 * 60 * 60 * 96).toISOString(),
          },
          {
            id: "demo-vol-3",
            name: "Imran Khan",
            email: "imran.khan@example.com",
            phone: "+91 99887 77665",
            location: "Mayur Vihar, Delhi",
            status: "rejected",
            joined_at: new Date(now.getTime() - 1000 * 60 * 60 * 140).toISOString(),
          },
        ]);
        return;
      }
      const token = localStorage.getItem('pfa_token');
      const response = await axios.get(`${API}/volunteers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVolunteers(response.data);
    } catch (error) {
      toast.error("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        setVolunteers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status } : v)),
        );
        toast.success(`Volunteer ${status}`);
        return;
      }
      const token = localStorage.getItem('pfa_token');
      await axios.put(`${API}/volunteers/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Volunteer ${status}`);
      fetchVolunteers();
    } catch (error) {
      toast.error("Failed to update volunteer");
    }
  };

  const deleteVolunteer = async (id) => {
    try {
      const isDemo = localStorage.getItem("pfa_demo") === "true";
      if (isDemo) {
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        toast.success("Volunteer removed");
        return;
      }
      const token = localStorage.getItem('pfa_token');
      await axios.delete(`${API}/volunteers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Volunteer removed");
      fetchVolunteers();
    } catch (error) {
      toast.error("Failed to remove volunteer");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
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
              Volunteer Management
            </h1>
            <p className="font-body text-xs text-gray-400 uppercase tracking-widest">
              Approve - Manage
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="font-body text-gray-400">Loading volunteers...</div>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="font-body text-gray-400">No volunteers yet</div>
          </div>
        ) : (
          <div className="space-y-4" data-testid="volunteers-list">
            {volunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className="bg-[#111111] border border-white/10  p-5 hover:border-white/20 transition-colors"
                data-testid={`volunteer-${volunteer.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-heading text-lg text-white uppercase tracking-wide">
                    {volunteer.name}
                  </div>
                  <Badge className={`${getStatusColor(volunteer.status)} uppercase text-xs`}>
                    {volunteer.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 mb-4">
                  <p className="font-body text-sm text-gray-400">{volunteer.email}</p>
                  <p className="font-body text-sm text-gray-400">{volunteer.phone}</p>
                  <p className="font-body text-sm text-gray-500">{volunteer.location}</p>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  Joined: {new Date(volunteer.joined_at).toLocaleDateString()}
                </div>

                {volunteer.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(volunteer.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-xs uppercase flex items-center gap-1"
                      data-testid={`approve-${volunteer.id}`}
                    >
                      <UserCheck className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(volunteer.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-xs uppercase flex items-center gap-1"
                      data-testid={`reject-${volunteer.id}`}
                    >
                      <UserX className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {volunteer.status !== 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => deleteVolunteer(volunteer.id)}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs uppercase"
                    data-testid={`delete-${volunteer.id}`}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="connect" />
    </div>
  );
}
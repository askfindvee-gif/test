import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Activity, Calendar, MapPin, Utensils, Heart, ShieldAlert, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { states, getDistricts } from "@/data/statesDistricts";

import { API_BASE } from "@/lib/api";

export default function Activities() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_activities: 0,
    animals_helped: 0,
    active_volunteers: 0,
    by_type: { feed: 0, rescue: 0, welfare: 0, other: 0 },
    by_animal: { dog: 0, cat: 0, cattle: 0, bird: 0, other: 0 }
  });
  
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    state: "All States",
    district: "All Districts",
    city: "All Cities",
    activityType: "All Types",
    animalType: "All Animals"
  });

  const [showFilters, setShowFilters] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  useEffect(() => {
    if (filters.state !== "All States") {
      setAvailableDistricts(getDistricts(filters.state));
      setFilters(prev => ({ ...prev, district: "All Districts" }));
    } else {
      setAvailableDistricts([]);
    }
  }, [filters.state]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('pfa_token');
      const response = await axios.get(`${API_BASE}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(response.data);
    } catch (error) {
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = () => {
    // Mock data - replace with actual API call
    setStats({
      total_activities: 1847,
      animals_helped: 3284,
      active_volunteers: 156,
      by_type: { feed: 892, rescue: 234, welfare: 521, other: 200 },
      by_animal: { dog: 1245, cat: 892, cattle: 324, bird: 567, other: 256 }
    });
  };

  const activityTypeData = [
    { name: 'Feed', value: stats.by_type.feed, color: '#22c55e' },
    { name: 'Rescue', value: stats.by_type.rescue, color: '#ef4444' },
    { name: 'Welfare', value: stats.by_type.welfare, color: '#3b82f6' },
    { name: 'Other', value: stats.by_type.other, color: '#6b7280' }
  ];

  const animalTypeData = [
    { name: 'Dogs', value: stats.by_animal.dog },
    { name: 'Cats', value: stats.by_animal.cat },
    { name: 'Cattle', value: stats.by_animal.cattle },
    { name: 'Birds', value: stats.by_animal.bird },
    { name: 'Other', value: stats.by_animal.other }
  ];

  const trendData = [
    { month: 'Jan', activities: 145 },
    { month: 'Feb', activities: 178 },
    { month: 'Mar', activities: 165 },
    { month: 'Apr', activities: 198 },
    { month: 'May', activities: 234 },
    { month: 'Jun', activities: 256 }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      feed: Utensils,
      rescue: ShieldAlert,
      welfare: Heart,
      other: Activity
    };
    return icons[type.toLowerCase()] || Activity;
  };

  const applyFilters = () => {
    toast.success("Filters applied");
    setShowFilters(false);
    // Implement actual filtering logic here
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      state: "All States",
      district: "All Districts",
      city: "All Cities",
      activityType: "All Types",
      animalType: "All Animals"
    });
    toast.success("Filters reset");
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 border border-white/10 hover:border-white/20 transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-white">
                  Activity Analytics
                </h1>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 uppercase text-[10px]">
                  Live Data
                </Badge>
              </div>
              <p className="font-body text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">
                Document Daily Care
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 transition-colors"
          >
            <Filter className="w-4 h-4 text-white" />
            <span className="text-xs uppercase tracking-wider text-white">Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-[#0a0a0a] border border-white/10 p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  State
                </label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({...filters, state: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                >
                  <option>All States</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  District
                </label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters({...filters, district: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                  disabled={filters.state === "All States"}
                >
                  <option>All Districts</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  City/Area
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                >
                  <option>All Cities</option>
                  <option>Rohini</option>
                  <option>Saket</option>
                  <option>Mayur Vihar</option>
                </select>
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  Activity Type
                </label>
                <select
                  value={filters.activityType}
                  onChange={(e) => setFilters({...filters, activityType: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                >
                  <option>All Types</option>
                  <option>Feed</option>
                  <option>Rescue</option>
                  <option>Welfare</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  Animal Type
                </label>
                <select
                  value={filters.animalType}
                  onChange={(e) => setFilters({...filters, animalType: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                >
                  <option>All Animals</option>
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Cattle</option>
                  <option>Bird</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-white text-black text-xs uppercase tracking-wider font-semibold hover:bg-gray-200 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-2 border border-white/10 text-white text-xs uppercase tracking-wider hover:border-white/20 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-green-500/30 bg-green-500/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 uppercase text-[9px]">
                +12%
              </Badge>
            </div>
            <div className="font-heading text-5xl text-white mb-2">
              {stats.total_activities.toLocaleString()}
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-gray-400">
              Total Activities Logged
            </div>
            <div className="font-body text-[10px] text-gray-600 mt-2">
              Last 30 Days
            </div>
          </div>

          <div className="border border-blue-500/30 bg-blue-500/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <Heart className="w-6 h-6 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[9px]">
                +8%
              </Badge>
            </div>
            <div className="font-heading text-5xl text-white mb-2">
              {stats.animals_helped.toLocaleString()}
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-gray-400">
              Animals Helped
            </div>
            <div className="font-body text-[10px] text-gray-600 mt-2">
              Cumulative Count
            </div>
          </div>

          <div className="border border-purple-500/30 bg-purple-500/10 p-6">
            <div className="flex items-start justify-between mb-4">
              <Activity className="w-6 h-6 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 uppercase text-[9px]">
                +5%
              </Badge>
            </div>
            <div className="font-heading text-5xl text-white mb-2">
              {stats.active_volunteers}
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-gray-400">
              Active Volunteers
            </div>
            <div className="font-body text-[10px] text-gray-600 mt-2">
              This Month
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Type Breakdown */}
          <div className="bg-[#0a0a0a] border border-white/10 p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                Activity Type Breakdown
              </div>
              <div className="font-body text-xs text-gray-500">
                Distribution by Category
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {activityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-8 space-y-3">
                {activityTypeData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-4 h-4" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.value} activities</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Animal Type Distribution */}
          <div className="bg-[#0a0a0a] border border-white/10 p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                Animal Type Distribution
              </div>
              <div className="font-body text-xs text-gray-500">
                Animals Helped by Species
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={animalTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="name" stroke="#666" style={{ fontSize: '11px' }} />
                <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 mb-8">
          <div className="mb-6">
            <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
              Monthly Activity Trend
            </div>
            <div className="font-body text-xs text-gray-500">
              6-Month Activity Volume
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="month" stroke="#666" style={{ fontSize: '11px' }} />
              <YAxis stroke="#666" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
              />
              <Line type="monotone" dataKey="activities" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activities List */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6">
          <div className="mb-6">
            <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
              Recent Activities
            </div>
            <div className="font-body text-xs text-gray-500">
              Latest Volunteer Actions
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="font-body text-gray-400">Loading activities...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <div className="font-body text-gray-400">No activities logged yet</div>
            </div>
          ) : (
            <div className="space-y-3" data-testid="activities-list">
              {activities.slice(0, 10).map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="bg-black border border-white/10 p-4 hover:border-white/20 transition-colors"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-500/10 border border-green-500/30">
                        <Icon className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-heading text-base uppercase tracking-wide text-white">
                            {activity.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="font-body text-sm text-gray-400 mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </div>
                          <div className="text-green-500 font-semibold">
                            {activity.volunteer_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-gray-700 uppercase tracking-[0.15em]">
          Powered by — PFA India
        </div>
      </div>

      <BottomNav active="activity" />
    </div>
  );
}
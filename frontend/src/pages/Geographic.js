import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, AlertCircle, Activity, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { states, getDistricts } from "@/data/statesDistricts";

import { apiGet } from "@/lib/api";

export default function Geographic() {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState({ locations: [], stats: {} });
  const [clusters, setClusters] = useState({ clusters: {}, districts: [] });
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    state: "All States",
    district: "All Districts",
    city: "All Cities",
    jurisdiction: "All Jurisdictions",
    clusterType: "urban"
  });

  useEffect(() => {
    fetchGeographic();
  }, []);

  const fetchGeographic = async () => {
    try {
      const token = localStorage.getItem('pfa_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [geoRes, clusterRes, patternRes] = await Promise.all([
        apiGet(`/analytics/geographic`, { headers }),
        apiGet(`/analytics/clusters`, { headers }),
        apiGet(`/analytics/patterns`, { headers })
      ]);

      setGeoData(geoRes.data);
      setClusters(clusterRes.data);
      setPatterns(patternRes.data);
    } catch (error) {
      toast.error("Failed to load geographic data");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: '#ef4444',
      medium: '#f97316',
      low: '#22c55e'
    };
    return colors[severity] || '#6b7280';
  };

  const getAlertColor = (severity) => {
    const colors = {
      critical: 'border-red-600/30 bg-red-600/10 text-red-500',
      warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
      positive: 'border-green-500/30 bg-green-500/10 text-green-400',
      info: 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    };
    return colors[severity] || colors.info;
  };

  const clusterData = [
    { name: 'Urban', value: clusters.clusters?.urban || 0, color: '#eab308' },
    { name: 'Semi-Urban', value: clusters.clusters?.semi_urban || 0, color: '#f97316' },
    { name: 'Rural', value: clusters.clusters?.rural || 0, color: '#6b7280' }
  ];

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
                  Geographic View
                </h1>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 uppercase text-[10px]">
                  Live Data
                </Badge>
              </div>
              <p className="font-body text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">
                Platform Status
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Map data exported successfully")}
            className="border-white/10 text-white hover:bg-white/5 text-xs uppercase tracking-wider"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Map Data
          </Button>
        </div>

        <div className="text-xs text-gray-600 uppercase tracking-[0.15em] mb-6 flex items-center justify-between">
          <span>Geographic Jurisdiction Oversight View</span>
          <span>Region Data Synced: Oct 24, 2023 — 09:42:15 AM</span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
              State
            </label>
            <select
              className="w-full bg-[#0a0a0a] border border-white/10  px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
              value={filter.state}
              onChange={(e) => setFilter({...filter, state: e.target.value})}
            >
              <option>All States</option>
              <option>Delhi</option>
              <option>Maharashtra</option>
              <option>Karnataka</option>
            </select>
          </div>
          <div>
            <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
              District
            </label>
            <select
              className="w-full bg-[#0a0a0a] border border-white/10  px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
              value={filter.district}
              onChange={(e) => setFilter({...filter, district: e.target.value})}
            >
              <option>All Districts</option>
              <option>North Delhi</option>
              <option>South Delhi</option>
              <option>East Delhi</option>
            </select>
          </div>
          <div>
            <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
              City/Town
            </label>
            <select
              className="w-full bg-[#0a0a0a] border border-white/10  px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
              value={filter.city}
              onChange={(e) => setFilter({...filter, city: e.target.value})}
            >
              <option>All Cities</option>
              <option>Rohini</option>
              <option>Saket</option>
              <option>Mayur Vihar</option>
            </select>
          </div>
          <div>
            <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
              Police Station
            </label>
            <select
              className="w-full bg-[#0a0a0a] border border-white/10  px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
              value={filter.jurisdiction}
              onChange={(e) => setFilter({...filter, jurisdiction: e.target.value})}
            >
              <option>All Jurisdictions</option>
            </select>
          </div>
          <div>
            <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
              Cluster Type
            </label>
            <div className="flex gap-2">
              {['urban', 'semi', 'rural'].map((type) => (
                <button
                  key={type}
                  className={`flex-1 px-3 py-2 text-xs uppercase tracking-wider  border transition-colors ${
                    filter.clusterType === type
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setFilter({...filter, clusterType: type})}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className=" border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <Activity className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 uppercase text-[9px] px-2 py-0.5">
                Stable
              </Badge>
            </div>
            <div className="font-heading text-3xl text-white mb-1">
              {geoData.stats?.high_feeding_zones || 0}
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-gray-400">
              High Feeding Zones
            </div>
            <div className="font-body text-[10px] text-gray-500 mt-2">
              Low conflict - High compliance
            </div>
          </div>

          <div className=" border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 uppercase text-[9px] px-2 py-0.5">
                -12%
              </Badge>
            </div>
            <div className="font-heading text-3xl text-white mb-1">
              {geoData.stats?.recurring_cruelty_areas || 0}
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-gray-400">
              Recurring Cruelty Areas
            </div>
            <div className="font-body text-[10px] text-gray-500 mt-2">
              Requires immediate patrol
            </div>
          </div>

          <div className=" border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 uppercase text-[9px] px-2 py-0.5">
                Alert
              </Badge>
            </div>
            <div className="font-heading text-3xl text-white mb-1">
              {geoData.stats?.repeated_complaints || 0}
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-gray-400">
              Repeated Complaints
            </div>
            <div className="font-body text-[10px] text-gray-500 mt-2">
              Top 3 districts within 7d
            </div>
          </div>

          <div className=" border border-gray-500/30 bg-gray-500/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <Activity className="w-5 h-5 text-gray-400" />
              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 uppercase text-[9px] px-2 py-0.5">
                Urgent
              </Badge>
            </div>
            <div className="font-heading text-3xl text-white mb-1">
              {geoData.stats?.intervention_regions || 0}
            </div>
            <div className="font-body text-xs uppercase tracking-wider text-gray-400">
              Intervention Regions
            </div>
            <div className="font-body text-[10px] text-gray-500 mt-2">
              Sterilization & vaccination gap
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Map Heatmap */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-heading text-lg uppercase tracking-wide text-white">
                  Jurisdictional Heatmap
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 uppercase text-[9px]">
                    Conflict
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 uppercase text-[9px]">
                    Safe
                  </Badge>
                  <button className="text-xs uppercase tracking-wider text-gray-400 hover:text-white border border-white/10 px-3 py-1  hover:border-white/20 transition-colors">
                    Show Boundaries
                  </button>
                </div>
              </div>
              <div className="font-body text-xs uppercase tracking-wider text-gray-500">
                Live Cluster View: Urban / Semi-Urban
              </div>
            </div>

            <div className="relative bg-black/50  overflow-hidden h-[400px] border border-white/5">
              {geoData.locations && geoData.locations.length > 0 ? (
                <MapContainer
                  center={[28.6139, 77.2090]}
                  zoom={11}
                  style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                  className="z-0"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {geoData.locations.map((location, idx) => (
                    <CircleMarker
                      key={idx}
                      center={[location.latitude, location.longitude]}
                      radius={location.incident_count / 2}
                      pathOptions={{
                        fillColor: getSeverityColor(location.severity),
                        color: getSeverityColor(location.severity),
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.4
                      }}
                    >
                      <Popup>
                        <div className="text-xs">
                          <div className="font-bold mb-1">{location.city}</div>
                          <div>Incidents: {location.incident_count}</div>
                          <div>Status: {location.status}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Loading map data...
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10  p-3 text-xs">
                <div className="font-semibold text-white mb-2">Vasant Kunj North</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400">
                  <div>Incidents: <span className="text-white">42</span></div>
                  <div>Status: <span className="text-yellow-500">Monitor</span></div>
                  <div>Cluster: <span className="text-white">Urban</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Alerts */}
          <div className="bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                Regional Alerts
              </div>
              <div className="font-body text-xs uppercase tracking-wider text-gray-500">
                Priority Notifications
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {patterns.slice(0, 4).map((pattern, idx) => (
                <div
                  key={pattern.id}
                  className={`border  p-4 ${getAlertColor(pattern.severity)}`}
                  data-testid={`alert-${pattern.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getAlertColor(pattern.severity)} uppercase text-[9px] px-2 py-0.5`}>
                      {pattern.type}
                    </Badge>
                    <span className="text-[10px] text-gray-500">
                      {idx === 0 ? '10m ago' : idx === 1 ? '32m ago' : idx === 2 ? '1h ago' : '2h ago'}
                    </span>
                  </div>
                  <div className="font-body text-sm font-semibold mb-1">
                    {pattern.pattern_name}
                  </div>
                  <div className="font-body text-xs text-gray-400">
                    {pattern.description}
                  </div>
                </div>
              ))}

              <button className="w-full mt-4 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors border border-white/10  hover:border-white/20" onClick={() => navigate('/geographic')}>
                View All Jurisdictions
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Incidents by Cluster */}
          <div className="bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                Incidents by Cluster
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={clusterData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {clusterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-8 space-y-3">
                {clusterData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-4 h-4 " style={{ backgroundColor: item.color }}></div>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">{((item.value / (clusterData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0))}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* District-wise Intervention */}
          <div className="bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                District-wise Intervention
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clusters.districts || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="district" stroke="#666" style={{ fontSize: '11px' }} />
                <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-700 uppercase tracking-[0.15em]">
          Powered by — PFA India
        </div>
      </div>

      <BottomNav active="activity" />
    </div>
  );
}
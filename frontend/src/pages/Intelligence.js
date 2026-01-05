import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, TrendingUp, AlertTriangle, Activity, Check, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { states, getDistricts } from "@/data/statesDistricts";
import ThemeToggle from "@/components/ThemeToggle";
import { shouldUseDemoData } from "@/lib/demoMode";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Intelligence() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [trends, setTrends] = useState({ trends: {}, impact: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [allInsights, setAllInsights] = useState([]);
  const [allPatterns, setAllPatterns] = useState([]);
  
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    state: "All States",
    district: "All Districts",
    city: "All Cities",
    patternType: "All Types",
    severityLevel: "All Severity",
    confidenceMin: 0,
    confidenceMax: 100
  });

  const [availableDistricts, setAvailableDistricts] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (filters.state !== "All States") {
      setAvailableDistricts(getDistricts(filters.state));
      setFilters(prev => ({ ...prev, district: "All Districts" }));
    } else {
      setAvailableDistricts([]);
    }
  }, [filters.state]);

  const fetchAnalytics = async () => {
    try {
      if (shouldUseDemoData()) {
        const demoInsights = [
          {
            id: "demo-i-1",
            severity: "critical",
            type: "Critical",
            trend: "+18%",
            title: "Cruelty Hotspot Spike",
            description: "Clustered reports detected over 72h in North Delhi.",
            confidence: 92
          },
          {
            id: "demo-i-2",
            severity: "medium",
            type: "Seasonal",
            trend: "+7%",
            title: "Festival Displacement",
            description: "Post-festival movement causing increased sightings.",
            confidence: 84
          },
          {
            id: "demo-i-3",
            severity: "positive",
            type: "Stable",
            trend: "-9%",
            title: "Feeding Zone Stability",
            description: "High compliance correlates with fewer incidents.",
            confidence: 78
          },
          {
            id: "demo-i-4",
            severity: "warning",
            type: "Detected",
            trend: "+4%",
            title: "Construction Impact",
            description: "Incidents rising near new construction corridors.",
            confidence: 71
          }
        ];

        const demoPatterns = [
          {
            id: "demo-p-1",
            severity: "critical",
            type: "Critical",
            pattern_name: "Recurring cruelty cluster",
            description: "Repeated reports within a tight radius."
          },
          {
            id: "demo-p-2",
            severity: "warning",
            type: "Correlation",
            pattern_name: "Low feeding → higher conflict",
            description: "Inverse correlation with feeding frequency."
          }
        ];

        const demoTrends = {
          trends: {
            accident: [
              { month: "May", count: 18 },
              { month: "Jun", count: 22 },
              { month: "Jul", count: 19 },
              { month: "Aug", count: 26 },
              { month: "Sep", count: 24 },
              { month: "Oct", count: 29 }
            ]
          },
          impact: [
            { frequency: "Low", incidents: 34 },
            { frequency: "Medium", incidents: 22 },
            { frequency: "High", incidents: 14 }
          ]
        };

        setAllInsights(demoInsights);
        setInsights(demoInsights);
        setAllPatterns(demoPatterns);
        setPatterns(demoPatterns);
        setTrends(demoTrends);
        return;
      }

      const token = localStorage.getItem('pfa_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [insightsRes, patternsRes, trendsRes] = await Promise.all([
        axios.get(`${API}/analytics/insights`, { headers }),
        axios.get(`${API}/analytics/patterns`, { headers }),
        axios.get(`${API}/analytics/trends`, { headers })
      ]);

      setAllInsights(insightsRes.data);
      setInsights(insightsRes.data);
      setAllPatterns(patternsRes.data);
      setPatterns(patternsRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredInsights = [...allInsights];
    let filteredPatterns = [...allPatterns];

    // Filter by severity
    if (filters.severityLevel !== "All Severity") {
      filteredInsights = filteredInsights.filter(
        insight => insight.severity.toLowerCase() === filters.severityLevel.toLowerCase()
      );
      filteredPatterns = filteredPatterns.filter(
        pattern => pattern.severity.toLowerCase() === filters.severityLevel.toLowerCase()
      );
    }

    // Filter by pattern type
    if (filters.patternType !== "All Types") {
      filteredPatterns = filteredPatterns.filter(
        pattern => pattern.type.toLowerCase() === filters.patternType.toLowerCase()
      );
      filteredInsights = filteredInsights.filter(
        insight => insight.type.toLowerCase() === filters.patternType.toLowerCase()
      );
    }

    // Filter by confidence level
    filteredInsights = filteredInsights.filter(
      insight => insight.confidence >= filters.confidenceMin && insight.confidence <= filters.confidenceMax
    );

    setInsights(filteredInsights);
    setPatterns(filteredPatterns);
    setShowFilters(false);
    toast.success("Filters applied successfully");
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      state: "All States",
      district: "All Districts",
      city: "All Cities",
      patternType: "All Types",
      severityLevel: "All Severity",
      confidenceMin: 0,
      confidenceMax: 100
    });
    setInsights(allInsights);
    setPatterns(allPatterns);
    toast.success("Filters reset");
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'border-red-500/30 bg-red-500/10 text-red-400',
      medium: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
      stable: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
      positive: 'border-green-500/30 bg-green-500/10 text-green-400',
      warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
      critical: 'border-red-600/30 bg-red-600/10 text-red-500'
    };
    return colors[severity] || colors.medium;
  };

  const getIcon = (severity) => {
    const icons = {
      critical: AlertTriangle,
      high: AlertTriangle,
      medium: TrendingUp,
      positive: Check,
      stable: Activity
    };
    const Icon = icons[severity] || Activity;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-app pb-24">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 border border-primary hover:border-white/20 transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-primary">
                  Intelligence Unit
                </h1>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 uppercase text-[10px]">
                  Analysis Mode
                </Badge>
              </div>
              <p className="font-body text-xs text-secondary uppercase tracking-[0.2em] mt-1">
                Predictive Insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-primary hover:border-white/20 transition-colors"
            >
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-wider text-primary">Filters</span>
            </button>
          </div>
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
                  Pattern Type
                </label>
                <select
                  value={filters.patternType}
                  onChange={(e) => setFilters({...filters, patternType: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                >
                  <option>All Types</option>
                  <option>Critical</option>
                  <option>Seasonal</option>
                  <option>Stable</option>
                  <option>Strong</option>
                  <option>New_Cluster</option>
                  <option>Correlation</option>
                  <option>Detected</option>
                </select>
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  Severity Level
                </label>
                <select
                  value={filters.severityLevel}
                  onChange={(e) => setFilters({...filters, severityLevel: e.target.value})}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                >
                  <option>All Severity</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Warning</option>
                  <option>Positive</option>
                  <option>Stable</option>
                </select>
              </div>
              <div>
                <label className="font-body text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
                  Confidence Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.confidenceMin}
                    onChange={(e) => setFilters({...filters, confidenceMin: parseInt(e.target.value) || 0})}
                    className="w-1/2 bg-black border border-white/10 px-2 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.confidenceMax}
                    onChange={(e) => setFilters({...filters, confidenceMax: parseInt(e.target.value) || 100})}
                    className="w-1/2 bg-black border border-white/10 px-2 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                    placeholder="Max"
                  />
                </div>
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

        <div className="text-xs text-gray-600 uppercase tracking-[0.15em] mb-6 flex items-center justify-between">
          <span>Incident Pattern Analysis & Trends</span>
          <span>Data Cycle: Oct 01 — Oct 24, 2023</span>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={` border p-4 ${getSeverityColor(insight.severity)}`}
              data-testid={`insight-${insight.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                {getIcon(insight.severity)}
                <Badge className={`${getSeverityColor(insight.severity)} uppercase text-[9px] px-2 py-0.5`}>
                  {insight.type}
                </Badge>
              </div>
              <div className="font-heading text-3xl text-white mb-1">
                {insight.trend}
              </div>
              <div className="font-body text-xs uppercase tracking-wider text-gray-400">
                {insight.title}
              </div>
              <div className="font-body text-[10px] text-gray-500 mt-2">
                {insight.description}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Spatio-Temporal Analysis */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-heading text-lg uppercase tracking-wide text-white">
                  Spatio-Temporal Analysis
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3  bg-yellow-500"></div>
                    <span className="text-gray-400">Festivals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3  bg-blue-500"></div>
                    <span className="text-gray-400">Weather</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3  bg-orange-500"></div>
                    <span className="text-gray-400">Construction</span>
                  </div>
                </div>
              </div>
              <div className="font-body text-xs uppercase tracking-wider text-gray-500">
                Visualizing Cluster Formations & Spikes
              </div>
            </div>

            <div className="relative bg-black/50  p-8 h-[300px] mb-4 border border-white/5">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
              
              {/* Hotspot Markers */}
              <div className="absolute top-[40%] left-[30%] w-20 h-20  bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <div className="w-12 h-12  bg-red-500/40 border border-red-500/50 flex items-center justify-center">
                  <div className="w-6 h-6  bg-red-500"></div>
                </div>
              </div>

              <div className="absolute top-[25%] left-[60%] w-16 h-16  bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <div className="w-10 h-10  bg-blue-500/40 border border-blue-500/50 flex items-center justify-center">
                  <div className="w-5 h-5  bg-blue-500"></div>
                </div>
              </div>

              <div className="absolute bottom-[20%] right-[25%] w-24 h-24  bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                <div className="w-16 h-16  bg-yellow-500/40 border border-yellow-500/50 flex items-center justify-center">
                  <div className="w-8 h-8  bg-yellow-500"></div>
                </div>
              </div>

              <div className="absolute bottom-[35%] left-[15%] text-xs text-gray-500 font-mono">
                Sector 12, Noida
              </div>
            </div>

            <div className="bg-black/30 border border-yellow-500/20  p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-heading text-sm uppercase tracking-wide text-yellow-500 mb-1">
                    Pattern Detected
                  </div>
                  <div className="font-body text-sm text-gray-300 italic mb-1">
                    Post-festival displacement surge
                  </div>
                  <div className="font-body text-xs text-gray-500">
                    Confidence Level: 92% • Expected Duration: 48h
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Patterns */}
          <div className="bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                Detected Patterns
              </div>
              <div className="font-body text-xs uppercase tracking-wider text-gray-500">
                Automated System Alerts
              </div>
            </div>

            <div className="space-y-4">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="border-l-2 border-l-red-500 pl-4 py-2"
                  data-testid={`pattern-${pattern.id}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Badge className={`${getSeverityColor(pattern.severity)} uppercase text-[9px] px-2 py-0.5`}>
                      {pattern.type}
                    </Badge>
                  </div>
                  <div className="font-body text-sm font-semibold text-white mb-1">
                    {pattern.pattern_name}
                  </div>
                  <div className="font-body text-xs text-gray-400">
                    {pattern.description}
                  </div>
                </div>
              ))}

              <button className="w-full mt-4 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors border border-white/10  hover:border-white/20" onClick={() => navigate('/incidents')}>
                View All Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trend Evolution */}
          <div className="bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                Trend Evolution by Type
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3  bg-gray-400"></div>
                  <span className="text-gray-400">Accident</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3  bg-red-500"></div>
                  <span className="text-gray-400">Cruelty</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends.trends?.accident || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '11px' }} />
                <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6b7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Intervention Impact */}
          <div className="bg-[#0a0a0a] border border-white/10  p-6">
            <div className="mb-6">
              <div className="font-heading text-lg uppercase tracking-wide text-white mb-2">
                Intervention Impact Analysis
              </div>
              <div className="font-body text-xs text-gray-500">
                r = -0.76 (Strong Inverse Correlation)
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends.impact || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis
                  dataKey="frequency"
                  label={{ value: 'Feeding Frequency', position: 'insideBottom', offset: -5, style: { fill: '#666', fontSize: '10px' } }}
                  stroke="#666"
                  style={{ fontSize: '11px' }}
                />
                <YAxis
                  label={{ value: 'Incidents', angle: -90, position: 'insideLeft', style: { fill: '#666', fontSize: '10px' } }}
                  stroke="#666"
                  style={{ fontSize: '11px' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>

            <button className="w-full mt-4 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors" onClick={() => toast.success("Data source information available in documentation")}>
              View Data Source
            </button>
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
import { useState, useEffect } from "react";
import { ArrowLeft, Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "critical",
      title: "Emergency SOS Alert",
      message: "New emergency SOS reported in Rohini Sector 12",
      location: "Rohini, Delhi",
      time: "5 mins ago",
      read: false
    },
    {
      id: "2",
      type: "success",
      title: "Volunteer Approved",
      message: "Volunteer Rajesh Kumar has been approved successfully",
      location: "South Delhi",
      time: "1 hour ago",
      read: false
    },
    {
      id: "3",
      type: "warning",
      title: "Pattern Detected",
      message: "Recurring incidents in Mayur Vihar - requires attention",
      location: "East Delhi",
      time: "2 hours ago",
      read: true
    },
    {
      id: "4",
      type: "info",
      title: "Activity Logged",
      message: "142 feeding activities logged today",
      location: "All Regions",
      time: "3 hours ago",
      read: true
    },
    {
      id: "5",
      type: "critical",
      title: "High Priority Incident",
      message: "Cruelty case reported - immediate intervention required",
      location: "Saket, Delhi",
      time: "5 hours ago",
      read: true
    }
  ]);

  const getNotificationIcon = (type) => {
    const icons = {
      critical: AlertCircle,
      warning: AlertTriangle,
      success: CheckCircle,
      info: Info
    };
    return icons[type] || Info;
  };

  const getNotificationColor = (type) => {
    const colors = {
      critical: 'border-red-500/30 bg-red-500/10 text-red-400',
      warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
      success: 'border-green-500/30 bg-green-500/10 text-green-400',
      info: 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    };
    return colors[type] || colors.info;
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
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
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 uppercase text-[10px]">
                    {unreadCount} New
                  </Badge>
                )}
              </div>
              <p className="font-body text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">
                System Alerts
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors border border-white/10 px-4 py-2 hover:border-white/20"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`border p-5 transition-all cursor-pointer ${
                  notification.read 
                    ? 'bg-black border-white/10 hover:border-white/20' 
                    : `${colorClass} border-2`
                }`}
                onClick={() => markAsRead(notification.id)}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 ${colorClass} border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-heading text-base uppercase tracking-wide text-white mb-1">
                          {notification.title}
                        </div>
                        <Badge className={`${colorClass} uppercase text-[9px] px-2 py-0.5`}>
                          {notification.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {notification.time}
                      </div>
                    </div>
                    <p className="font-body text-sm text-gray-300 mb-2">
                      {notification.message}
                    </p>
                    <div className="text-xs text-gray-500">
                      📍 {notification.location}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-red-500"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="font-body text-gray-400 text-lg">No notifications</div>
            <div className="font-body text-gray-600 text-sm mt-2">
              You're all caught up!
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-700 uppercase tracking-[0.15em]">
          Powered by — PFA India
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
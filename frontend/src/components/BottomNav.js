import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Siren, Activity, MessageCircle, User } from "lucide-react";

export default function BottomNav({ active }) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'HOME', icon: LayoutDashboard, path: '/' },
    { id: 'report', label: 'REPORT', icon: Siren, path: '/incidents' },
    { id: 'activity', label: 'ACTIVITY', icon: Activity, path: '/activities' },
    { id: 'connect', label: 'CONNECT', icon: MessageCircle, path: '/volunteers' },
    { id: 'profile', label: 'PROFILE', icon: User, path: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/10 h-20 flex items-center justify-around px-6 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 transition-colors"
            data-testid={`nav-${item.id}`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
            <span className={`font-body text-[10px] font-bold uppercase tracking-wider ${
              isActive ? 'text-white' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
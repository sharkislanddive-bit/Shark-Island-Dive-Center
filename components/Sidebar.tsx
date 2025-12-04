
import React from 'react';
import { ViewState, SystemUser } from '../types';
import { LayoutDashboard, Users, Anchor, CalendarDays, Settings, LogOut, PlusCircle } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  currentUser: SystemUser | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, currentUser, onLogout }) => {
  const menuItems = [
    { id: ViewState.HOME, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.GUESTS, label: 'Guests & CRM', icon: Users },
    { id: ViewState.OPERATIONS, label: 'Operations', icon: CalendarDays },
    { id: ViewState.BOOKING, label: 'New Booking', icon: PlusCircle },
    { id: ViewState.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-shark-950 text-white flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl">
      {/* Brand */}
      <div className="p-6 border-b border-shark-800 flex items-center gap-3">
         <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-shark-950">S</div>
         <div>
             <h1 className="font-bold tracking-tight text-sm">SHARK ISLAND</h1>
             <p className="text-xs text-shark-400">Operations System</p>
         </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${currentView === item.id 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50 translate-x-1' 
                : 'text-shark-300 hover:bg-shark-900 hover:text-white'
              }
            `}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User / Footer */}
      <div className="p-4 border-t border-shark-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-shark-900">
            <img 
              src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=0d9488&color=fff`} 
              className="w-8 h-8 rounded-full" 
            />
            <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold truncate">{currentUser?.name || 'User'}</div>
                <div className="text-xs text-teal-400 capitalize">{currentUser?.role?.toLowerCase() || 'Staff'}</div>
            </div>
            <button 
              onClick={onLogout}
              className="text-shark-500 hover:text-white cursor-pointer transition-colors" 
              title="Logout"
            >
              <LogOut size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

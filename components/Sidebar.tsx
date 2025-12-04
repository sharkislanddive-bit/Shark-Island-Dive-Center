import React from 'react';
import { ViewState, SystemUser } from '../types';
import { LayoutDashboard, Users, Anchor, CalendarDays, Settings, LogOut, PlusCircle, X, LifeBuoy } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  currentUser: SystemUser | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, currentUser, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: ViewState.HOME, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.GUESTS, label: 'Guests & CRM', icon: Users },
    { id: ViewState.OPERATIONS, label: 'Operations', icon: CalendarDays },
    { id: ViewState.BOOKING, label: 'New Booking', icon: PlusCircle },
    { id: ViewState.SETTINGS, label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (id: ViewState) => {
    onNavigate(id);
    onClose(); // Close sidebar on mobile when item selected
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-shark-950 text-white flex flex-col h-screen shadow-2xl 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand / Header */}
        <div className="p-6 border-b border-shark-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-shark-950">S</div>
             <div>
                 <h1 className="font-bold tracking-tight text-sm">SHARK ISLAND</h1>
                 <p className="text-xs text-shark-400">Operations System</p>
             </div>
           </div>
           {/* Close Button (Mobile Only) */}
           <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
  
        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
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
        <div className="p-4 border-t border-shark-800 mt-auto bg-shark-900/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-shark-900 mb-4">
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

          <div className="px-2 pb-2 text-center">
             <div className="text-[10px] text-shark-500 mb-1">System Support & Feedback</div>
             <a 
               href="https://www.intouranex.com/" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="flex items-center justify-center gap-1.5 text-xs text-teal-500 hover:text-white font-bold transition-colors"
             >
               <LifeBuoy size={12}/> IntouraNex
             </a>
          </div>
        </div>
      </div>
    </>
  );
};
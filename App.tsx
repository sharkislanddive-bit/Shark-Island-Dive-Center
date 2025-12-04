import React, { useState, useEffect } from 'react';
import { ViewState, SystemUser } from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { GuestDirectory } from './components/GuestDirectory';
import { OperationsView } from './components/OperationsView';
import { BookingEngine } from './components/BookingEngine';
import { AdminPanel } from './components/AdminPanel';
import { LoginScreen } from './components/LoginScreen';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Optional: Check local storage for persisted session
  useEffect(() => {
    const savedUser = localStorage.getItem('sidc_session_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sidc_session_user');
      }
    }
  }, []);

  const handleLogin = (loggedInUser: SystemUser) => {
    setUser(loggedInUser);
    localStorage.setItem('sidc_session_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sidc_session_user');
    setCurrentView(ViewState.HOME); // Reset view on logout
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <DashboardHome />;
      case ViewState.GUESTS:
        return <GuestDirectory />;
      case ViewState.OPERATIONS:
        return <OperationsView />;
      case ViewState.BOOKING:
        return (
            <div className="p-8 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-shark-900 text-white p-4 font-bold">New Booking Wizard</div>
                    <BookingEngine onBookingComplete={() => setCurrentView(ViewState.HOME)} />
                </div>
            </div>
        );
      case ViewState.SETTINGS:
        return <AdminPanel onClose={() => setCurrentView(ViewState.HOME)} />;
      default:
        return <DashboardHome />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        currentUser={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
             <div className="font-bold text-shark-900">SHARK ISLAND</div>
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Menu size={24} />
             </button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { ViewState } from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { GuestDirectory } from './components/GuestDirectory';
import { OperationsView } from './components/OperationsView';
import { BookingEngine } from './components/BookingEngine';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  // Default to Home (Dashboard) instead of Booking
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        {renderContent()}
      </main>

      {/* Footer is hidden in Dashboard mode or can be a small copyright at bottom */}
    </div>
  );
};

export default App;
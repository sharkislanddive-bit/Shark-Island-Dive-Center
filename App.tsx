import React, { useState } from 'react';
import { ViewState } from './types';
import { BookingEngine } from './components/BookingEngine';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.BOOKING);

  const handleAdminEntry = () => {
    // Simple mock auth
    const pass = prompt("Enter Admin Password (hint: 'shark')");
    if (pass === 'shark') {
      setView(ViewState.ADMIN);
    } else {
      alert("Access Denied");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-shark-50">
      {/* Navbar */}
      <nav className="bg-shark-950 text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div 
            className="font-bold text-2xl tracking-tighter flex items-center gap-2 cursor-pointer"
            onClick={() => setView(ViewState.BOOKING)}
          >
            <span className="text-teal-400">SHARK</span> ISLAND
          </div>
          <div className="flex gap-6 text-sm font-medium">
             {/* Navigation items removed as requested for single-purpose booking page */}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow flex flex-col">
        {view === ViewState.BOOKING && (
          <BookingEngine onBookingComplete={() => window.location.reload()} />
        )}
        
        {view === ViewState.ADMIN && (
          <AdminPanel onClose={() => setView(ViewState.BOOKING)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-shark-950 text-shark-400 py-12 px-6 mt-auto">
        <div className="container mx-auto grid md:grid-cols-3 gap-8 text-sm">
            <div>
                <h4 className="text-white font-bold mb-4 text-lg">Shark Island Dive Center</h4>
                <p>Fuvahmulah City, Maldives</p>
                <p>dive@sharkisland.com</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Links</h4>
                <ul className="space-y-2">
                    <li>Terms & Conditions</li>
                    <li>Diver Medical Form</li>
                    <li>PADI Courses</li>
                </ul>
            </div>
             <div className="text-right pt-10">
                <button onClick={handleAdminEntry} className="text-shark-800 hover:text-shark-700 text-xs">Admin Login</button>
                <p className="mt-2">&copy; 2024 Shark Island DC</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
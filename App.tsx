import React, { useState } from 'react';
import { ViewState } from './types';
import { Hero } from './components/Hero';
import { BookingEngine } from './components/BookingEngine';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [adminPass, setAdminPass] = useState('');

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
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-shark-950 text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div 
            className="font-bold text-2xl tracking-tighter flex items-center gap-2 cursor-pointer"
            onClick={() => setView(ViewState.HOME)}
          >
            <span className="text-teal-400">SHARK</span> ISLAND
          </div>
          <div className="flex gap-6 text-sm font-medium">
             <button onClick={() => setView(ViewState.HOME)} className="hover:text-teal-400 transition-colors">Expeditions</button>
             <button onClick={() => setView(ViewState.HOME)} className="hover:text-teal-400 transition-colors">About Fuvahmulah</button>
             <button onClick={() => setView(ViewState.BOOKING)} className="bg-teal-500 text-shark-900 px-4 py-2 rounded-full hover:bg-teal-400 transition-colors font-bold">Book Now</button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow">
        {view === ViewState.HOME && (
          <>
            <Hero onBookNow={() => setView(ViewState.BOOKING)} />
            <div className="bg-white py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">Why Dive With Us?</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="p-6">
                            <div className="text-4xl mb-4">🦈</div>
                            <h3 className="font-bold text-xl mb-2">Guaranteed Encounters</h3>
                            <p className="text-gray-600">Home to the world's healthiest Tiger Shark population.</p>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl mb-4">🚤</div>
                            <h3 className="font-bold text-xl mb-2">Premium Fleet</h3>
                            <p className="text-gray-600">Fast, comfortable dhonis designed for photographers.</p>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl mb-4">🏝️</div>
                            <h3 className="font-bold text-xl mb-2">Local Luxury</h3>
                            <p className="text-gray-600">Partnered with the best hotels on the island.</p>
                        </div>
                    </div>
                </div>
            </div>
          </>
        )}

        {view === ViewState.BOOKING && <BookingEngine />}
        
        {view === ViewState.ADMIN && <AdminPanel onClose={() => setView(ViewState.HOME)} />}
      </main>

      {/* Footer */}
      <footer className="bg-shark-950 text-shark-400 py-12 px-6">
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
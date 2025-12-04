import React, { useEffect, useState } from 'react';
import { Users, Droplets, Calendar, Anchor, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { getEventsForDate } from '../services/mockDb';
import { getBookings } from '../services/bookingService';
import { DailyEvent, Booking } from '../types';

export const DashboardHome: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyEvents, setDailyEvents] = useState<DailyEvent[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [inHouseCount, setInHouseCount] = useState(0);

  // Format date for storage keys YYYY-MM-DD
  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const dateKey = formatDateKey(currentDate);
    setDailyEvents(getEventsForDate(dateKey));
    
    const allBookings = getBookings();
    setRecentBookings(allBookings.slice(-5).reverse());
    
    // In-house logic based on the SELECTED Dashboard Date
    const active = allBookings.filter(b => b.checkIn <= dateKey && b.checkOut >= dateKey).length;
    // Assume 2 pax per booking roughly for the stat
    setInHouseCount(active * 2); 
  }, [currentDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const isToday = formatDateKey(currentDate) === formatDateKey(new Date());

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-shark-900">Morning, Team! 🦈</h1>
            <p className="text-gray-500 mt-1">Here's what's happening at Shark Island.</p>
        </div>
        
        {/* Date Navigator / Clock */}
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <ChevronLeft size={20}/>
            </button>
            
            <div className="flex flex-col items-center px-2 min-w-[140px]">
                <div className="text-xs font-bold text-teal-600 uppercase tracking-wide flex items-center gap-1">
                    {isToday && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>}
                    {isToday ? 'Today' : 'Viewing'}
                </div>
                <div className="text-lg font-bold text-shark-900">
                    {currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
            </div>

            <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <ChevronRight size={20}/>
            </button>
            <div className="border-l border-gray-200 pl-3 pr-2">
                 <Clock size={20} className="text-shark-400"/>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><Users size={24}/></div>
            <div>
                <div className="text-2xl font-bold text-shark-900">{inHouseCount}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">In-House Guests</div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Anchor size={24}/></div>
            <div>
                <div className="text-2xl font-bold text-shark-900">{dailyEvents.length}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Trips Scheduled</div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Droplets size={24}/></div>
            <div>
                <div className="text-2xl font-bold text-shark-900">28°C</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Water Temp</div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Calendar size={24}/></div>
            <div>
                <div className="text-2xl font-bold text-shark-900">{recentBookings.length}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">New Bookings</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-shark-900">Schedule: {currentDate.toLocaleDateString('en-GB', {weekday:'long'})}</h3>
                <button className="text-teal-600 text-sm font-bold">View Ops</button>
            </div>
            <div className="divide-y divide-gray-50">
                {dailyEvents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No events scheduled for this date.</div>
                ) : (
                    dailyEvents.sort((a,b) => a.time.localeCompare(b.time)).map(evt => (
                        <div key={evt.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                            <div className="w-16 text-center">
                                <div className="text-sm font-bold text-shark-900">{evt.time}</div>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-shark-800">{evt.title}</div>
                                <div className="text-xs text-gray-500 flex gap-2">
                                    <span>{evt.boat}</span> • <span>{evt.guestCount} Pax</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${evt.type === 'Tiger Harbour' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {evt.type}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Latest Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-shark-900">Latest Booking Requests</h3>
            </div>
             <div className="divide-y divide-gray-50">
                {recentBookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No bookings yet.</div>
                ) : (
                    recentBookings.map(b => (
                        <div key={b.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                {b.nationality.slice(0,2).toUpperCase()}
                             </div>
                             <div className="flex-1">
                                <div className="font-bold text-shark-800">{b.guestName}</div>
                                <div className="text-xs text-gray-500">{b.divers} Divers • {b.checkIn}</div>
                             </div>
                             <div className="text-right">
                                <div className="font-bold text-teal-600">${b.grandTotal.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">{b.status}</div>
                             </div>
                        </div>
                    ))
                )}
             </div>
        </div>

      </div>
    </div>
  );
};
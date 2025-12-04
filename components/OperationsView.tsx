import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Anchor, Plus, ChevronLeft, ChevronRight, MapPin, Users, ClipboardList, X, Save, Edit3, AlertTriangle } from 'lucide-react';
import { getEventsForDate, saveEvent } from '../services/mockDb';
import { getBookings, isDateInBooking } from '../services/bookingService';
import { DailyEvent, Booking } from '../types';

export const OperationsView: React.FC = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Constants
  const MAX_BOAT_CAPACITY = 12;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DailyEvent | null>(null);

  useEffect(() => {
    // When date changes, we ensure slots exist and fetch them
    setEvents(getEventsForDate(selectedDate));
    setBookings(getBookings());
  }, [selectedDate]);

  const handleEditEvent = (event: DailyEvent) => {
    setEditingEvent({ ...event });
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (editingEvent) {
        saveEvent(editingEvent);
        setEvents(getEventsForDate(selectedDate)); // Refresh
        setIsModalOpen(false);
        setEditingEvent(null);
    }
  };

  // --- CALENDAR LOGIC ---
  const getMonthsToRender = () => {
    const start = new Date();
    start.setDate(1); // 1st of current month
    
    // Determine the range based on bookings
    let maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6); // Minimum 6 months
    
    bookings.forEach(b => {
      const d = new Date(b.checkOut);
      if (d > maxDate) maxDate = d;
    });

    const months: Date[] = [];
    const current = new Date(start);
    while (current <= maxDate) {
        months.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const renderMonthlyCalendar = () => {
    const months = getMonthsToRender();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className="space-y-8 pb-12">
        {months.map((monthDate) => {
          const year = monthDate.getFullYear();
          const monthIndex = monthDate.getMonth();
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div key={`${year}-${monthIndex}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               {/* Month Header */}
               <div className="bg-shark-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-shark-900">
                   {monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </h3>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dive Schedule</span>
               </div>
               
               <div className="overflow-x-auto no-scrollbar">
                 <div 
                    className="inline-grid gap-x-0" 
                    style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(110px, 1fr))` }}
                 >
                    {/* Row 1: Dates (1-Dec) */}
                    {daysArray.map(day => {
                         const monthAbbr = monthNames[monthIndex];
                         const dateStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                         const isToday = dateStr === new Date().toISOString().split('T')[0];
                         
                         return (
                            <button 
                                key={`date-${day}`} 
                                onClick={() => { setSelectedDate(dateStr); setViewMode('daily'); }}
                                className={`h-10 flex items-center justify-center text-sm font-bold border-r border-b border-gray-100 hover:bg-teal-50 transition-colors ${isToday ? 'bg-teal-50 text-teal-700' : 'bg-white text-shark-900'}`}
                            >
                                {day}-{monthAbbr}
                            </button>
                         );
                    })}

                    {/* Row 2: Weekdays (Mon) */}
                    {daysArray.map(day => {
                         const dateObj = new Date(year, monthIndex, day);
                         const dayOfWeek = weekdays[dateObj.getDay()];
                         const dateStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                         const isToday = dateStr === new Date().toISOString().split('T')[0];

                         return (
                            <div key={`day-${day}`} className={`h-8 flex items-center justify-center text-xs font-bold uppercase border-r border-b border-gray-100 ${isToday ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400'}`}>
                                {dayOfWeek}
                            </div>
                         );
                    })}

                    {/* Row 3: Event & Demand Content */}
                    {daysArray.map(day => {
                         const dateStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                         // We don't fetch individual events here for performance in big views, 
                         // but we calculate demand.
                        
                        // Demand Calculation: Sum of divers from bookings active on this date
                        const activeBookings = bookings.filter(b => isDateInBooking(dateStr, b));
                        const bookedDivers = activeBookings.reduce((sum, b) => sum + b.divers, 0);

                        return (
                            <div 
                                key={`content-${day}`} 
                                className="min-h-[120px] border-r border-gray-100 p-2 space-y-2 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col group relative"
                                onClick={() => {
                                    setSelectedDate(dateStr);
                                    setViewMode('daily');
                                }}
                            >
                                {/* Demand Bar */}
                                {bookedDivers > 0 && (
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded flex justify-between items-center mb-1 ${bookedDivers > MAX_BOAT_CAPACITY ? 'bg-red-100 text-red-700' : 'bg-teal-50 text-teal-700'}`}>
                                        <span className="flex items-center gap-1"><Users size={10}/> Pax</span>
                                        <span>{bookedDivers}</span>
                                    </div>
                                )}
                                
                                {/* Static Indicator of Standard Schedule */}
                                <div className="space-y-1 opacity-60">
                                    <div className="h-1.5 w-full bg-orange-200 rounded-full"></div>
                                    <div className="h-1.5 w-2/3 bg-blue-200 rounded-full"></div>
                                    <div className="h-1.5 w-2/3 bg-blue-200 rounded-full"></div>
                                </div>
                                <div className="mt-auto text-[10px] text-center text-gray-400 group-hover:text-teal-600 font-bold">
                                    View Schedule
                                </div>
                            </div>
                        );
                    })}
                 </div>
               </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDailyView = () => {
    // Sort events by time
    const sortedEvents = [...events].sort((a, b) => a.time.localeCompare(b.time));
    const activeBookings = bookings.filter(b => isDateInBooking(selectedDate, b));
    const totalBookedPax = activeBookings.reduce((sum, b) => sum + b.divers, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            
            {/* LEFT: Daily Master Schedule */}
            <div className="lg:col-span-2 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="bg-shark-50 p-6 border-b border-gray-100 flex items-center justify-between">
                         <div>
                            <h3 className="font-bold text-shark-900 text-lg flex items-center gap-2">
                                <Anchor size={20} className="text-teal-600"/> Daily Dive Plan
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                1 Guaranteed Tiger Zoo + 2 Reef Dives. Click to update site & time.
                            </p>
                         </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {sortedEvents.map((evt) => (
                            <div 
                                key={evt.id} 
                                onClick={() => handleEditEvent(evt)}
                                className={`
                                    relative border rounded-xl p-6 transition-all cursor-pointer group hover:shadow-md
                                    ${evt.type === 'Tiger Zoo' ? 'bg-orange-50/30 border-orange-100 hover:border-orange-300' : 'bg-white border-gray-100 hover:border-blue-300'}
                                    ${evt.guestCount > MAX_BOAT_CAPACITY ? 'border-red-300 bg-red-50/50' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-sm shrink-0
                                            ${evt.type === 'Tiger Zoo' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            <Clock size={18} className="mb-1"/>
                                            {evt.time}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-bold text-shark-900">{evt.title}</h4>
                                                <Edit3 size={14} className="text-gray-300 group-hover:text-teal-500 transition-colors"/>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Anchor size={14}/> {evt.boat}</span>
                                                <span className={`flex items-center gap-1 ${evt.guestCount > MAX_BOAT_CAPACITY ? 'text-red-600 font-bold' : ''}`}>
                                                    <Users size={14}/> {evt.guestCount} Pax Assigned
                                                </span>
                                            </div>
                                            
                                            {evt.guestCount > MAX_BOAT_CAPACITY && (
                                                <div className="bg-red-100 text-red-700 text-xs p-2 rounded mt-2 font-bold flex items-center gap-2">
                                                    <AlertTriangle size={14}/>
                                                    Over Capacity ({evt.guestCount}/12)! Hire 2nd Boat.
                                                </div>
                                            )}

                                            {evt.type === 'Reef Dive' && evt.title.includes('TBD') && (
                                                <div className="text-xs text-red-500 font-bold mt-2 animate-pulse">
                                                    ⚠ Update Dive Site Name
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${evt.type === 'Tiger Zoo' ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-600'}`}>
                                        {evt.type}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Daily Manifest Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
                <div className="p-4 border-b border-gray-100 bg-shark-50">
                    <h3 className="font-bold text-shark-900 flex items-center gap-2">
                        <ClipboardList size={18} className="text-teal-600"/> Daily Manifest
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                        {activeBookings.length} Bookings · {totalBookedPax} Divers In-House
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeBookings.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 text-sm">No bookings for this date.</div>
                    ) : (
                        activeBookings.map(b => (
                            <div key={b.id} className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow bg-white">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-sm text-shark-900">{b.guestName}</div>
                                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">{b.id.split('-')[1]}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Users size={12}/> {b.divers} Divers
                                    {b.nonDivers > 0 && <span>(+{b.nonDivers} Non)</span>}
                                </div>
                                <div className="text-xs text-teal-600 mt-1 flex gap-2">
                                    <span>{b.nationality}</span>
                                    {b.includeGearRental && <span className="text-orange-600">• Gear Rented</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="p-8 animate-fade-in h-full flex flex-col relative">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-shark-900">Operations Calendar</h1>
                <p className="text-gray-500 text-sm">Daily Schedule & Boat Planning</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex">
                    <button 
                        onClick={() => setViewMode('daily')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-shark-900 text-white shadow' : 'text-gray-500 hover:text-shark-900'}`}
                    >
                        Day Plan
                    </button>
                    <button 
                        onClick={() => setViewMode('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-shark-900 text-white shadow' : 'text-gray-500 hover:text-shark-900'}`}
                    >
                        Month View
                    </button>
                </div>
            </div>
        </div>

        {viewMode === 'daily' && (
             <div className="mb-6 flex items-center gap-4">
                <button 
                    onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={20}/>
                </button>
                <div className="text-xl font-bold text-shark-900">
                    {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                 <button 
                    onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronRight size={20}/>
                </button>
                <button 
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="ml-auto text-sm font-bold text-teal-600 hover:underline"
                >
                    Jump to Today
                </button>
             </div>
        )}

        {viewMode === 'daily' ? renderDailyView() : renderMonthlyCalendar()}

        {/* Edit Event Modal */}
        {isModalOpen && editingEvent && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-shark-900">Update Dive Slot</h2>
                            <p className="text-xs text-gray-500">{editingEvent.type} • {editingEvent.date}</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-shark-900"><X size={24}/></button>
                    </div>

                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                                <input 
                                    type="time"
                                    className="w-full border rounded p-3 mt-1 bg-gray-50 font-bold"
                                    value={editingEvent.time}
                                    onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Boat</label>
                                <select 
                                    className="w-full border rounded p-3 mt-1 bg-white"
                                    value={editingEvent.boat}
                                    onChange={(e) => setEditingEvent({...editingEvent, boat: e.target.value as any})}
                                >
                                    <option>Shark One</option>
                                    <option>Shark Two</option>
                                    <option>Classroom</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Dive Site Name</label>
                            <input 
                                className="w-full border rounded p-3 mt-1 font-bold text-shark-900"
                                placeholder={editingEvent.type === 'Tiger Zoo' ? 'Tiger Zoo' : 'Enter Dive Site Name'}
                                value={editingEvent.title}
                                onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Assigned Guests</label>
                            <input 
                                type="number"
                                className={`w-full border rounded p-3 mt-1 ${editingEvent.guestCount > MAX_BOAT_CAPACITY ? 'border-red-300 bg-red-50 text-red-900' : ''}`}
                                value={editingEvent.guestCount}
                                onChange={(e) => setEditingEvent({...editingEvent, guestCount: parseInt(e.target.value)})}
                            />
                            {editingEvent.guestCount > MAX_BOAT_CAPACITY && (
                                <div className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                                    <AlertTriangle size={12} />
                                    Warning: Exceeds 12 Pax capacity. Please assign remaining guests to 'Shark Two' or a rental boat.
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleSaveEvent}
                            className="w-full bg-shark-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-shark-800 mt-4"
                        >
                            <Save size={18} /> Update Schedule
                        </button>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};
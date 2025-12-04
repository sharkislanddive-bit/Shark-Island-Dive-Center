
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Anchor, Plus, ChevronLeft, ChevronRight, MapPin, Users, ClipboardList, X, Save } from 'lucide-react';
import { getEvents, saveEvent } from '../services/mockDb';
import { getBookings, isDateInBooking } from '../services/bookingService';
import { DailyEvent, Booking } from '../types';

interface EventDraft {
  date: string;
  time: string;
  title: string;
  type: DailyEvent['type'];
  boat: DailyEvent['boat'];
  guestCount: number;
}

export const OperationsView: React.FC = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState<EventDraft>({
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    title: 'Tiger Zoo',
    type: 'Tiger Zoo',
    boat: 'Shark One',
    guestCount: 0
  });

  useEffect(() => {
    setEvents(getEvents());
    setBookings(getBookings());
  }, []);

  const handleOpenModal = (date?: string, boat?: DailyEvent['boat']) => {
    setEventDraft({
      ...eventDraft,
      date: date || selectedDate,
      boat: boat || 'Shark One',
      guestCount: 0
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    const newEvent: DailyEvent = {
        id: `evt-${Date.now()}`,
        ...eventDraft,
        staffIds: [], // To be assigned later
        notes: ''
    };
    saveEvent(newEvent);
    setEvents(getEvents()); // Refresh
    setIsModalOpen(false);
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
                        const dayEvents = events.filter(e => e.date === dateStr);
                        
                        // Demand Calculation: Sum of divers from bookings active on this date
                        const activeBookings = bookings.filter(b => isDateInBooking(dateStr, b));
                        const bookedDivers = activeBookings.reduce((sum, b) => sum + b.divers, 0);
                        const scheduledSeats = dayEvents.reduce((sum, e) => sum + e.guestCount, 0);

                        // Capacity Status
                        const isOverbooked = bookedDivers > scheduledSeats; 
                        
                        return (
                            <div 
                                key={`content-${day}`} 
                                className="min-h-[180px] border-r border-gray-100 p-2 space-y-2 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col group relative"
                                onClick={() => {
                                    setSelectedDate(dateStr);
                                    setViewMode('daily');
                                }}
                            >
                                {/* Quick Add Button (Hidden by default, visible on hover) */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(dateStr); }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 z-10 bg-shark-900 text-white p-1 rounded-full hover:scale-110 transition-all shadow-md"
                                    title="Add Trip"
                                >
                                    <Plus size={12} />
                                </button>

                                {/* Demand Bar */}
                                {bookedDivers > 0 && (
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded flex justify-between items-center mb-1 ${isOverbooked ? 'bg-red-100 text-red-700' : 'bg-teal-50 text-teal-700'}`}>
                                        <span className="flex items-center gap-1"><Users size={10}/> Demand</span>
                                        <span>{bookedDivers}</span>
                                    </div>
                                )}

                                {/* Events */}
                                {dayEvents.length === 0 ? (
                                    bookedDivers > 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-red-300 text-xs text-center p-2 border border-dashed border-red-200 rounded">
                                            <Anchor size={16} className="mb-1"/>
                                            <span>Needs Trip</span>
                                        </div>
                                    ) : (
                                        <div className="flex-1"></div>
                                    )
                                ) : (
                                    dayEvents.map(evt => (
                                        <div 
                                            key={evt.id} 
                                            className={`p-1.5 rounded text-xs border shadow-sm ${
                                                evt.type === 'Tiger Zoo' ? 'bg-orange-50 border-orange-200 text-orange-800' : 
                                                evt.type.includes('Night') ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
                                                'bg-blue-50 border-blue-200 text-blue-800'
                                            }`}
                                        >
                                            <div className="font-bold truncate leading-tight">{evt.time} {evt.title}</div>
                                            <div className="flex justify-between mt-1 opacity-75 text-[10px]">
                                                <span>{evt.boat === 'Shark One' ? 'S1' : 'S2'}</span>
                                                <span>{evt.guestCount}pax</span>
                                            </div>
                                        </div>
                                    ))
                                )}
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
    const dayEvents = events.filter(e => e.date === selectedDate);
    const boats: DailyEvent['boat'][] = ['Shark One', 'Shark Two'];
    const activeBookings = bookings.filter(b => isDateInBooking(selectedDate, b));
    const totalBookedPax = activeBookings.reduce((sum, b) => sum + b.divers, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            {/* Daily Manifest Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
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

            {/* Boat Schedule */}
            <div className="lg:col-span-2 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {boats.map(boat => (
                        <div key={boat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="bg-shark-50 p-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-shark-900">
                                    <Anchor size={18} className="text-teal-600"/> {boat}
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Operational</span>
                            </div>
                            <div className="p-4 space-y-4 flex-1">
                                {dayEvents.filter(e => e.boat === boat).length === 0 ? (
                                    <div className="text-center text-gray-400 py-8 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                        No trips planned yet.
                                    </div>
                                ) : (
                                    dayEvents.filter(e => e.boat === boat).map(evt => (
                                        <div key={evt.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${evt.type === 'Tiger Zoo' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                            <div className="flex justify-between items-start mb-2 pl-2">
                                                <h4 className="font-bold text-shark-900">{evt.title}</h4>
                                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-shark-600">{evt.time}</span>
                                            </div>
                                            <div className="pl-2 space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14}/> {evt.guestCount} / 12 Capacity
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {evt.staffIds.map((sid, i) => (
                                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-600">
                                                                {sid.charAt(0).toUpperCase()}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs">Crew</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <button 
                                    onClick={() => handleOpenModal(selectedDate, boat)}
                                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:text-teal-600 hover:border-teal-500 flex items-center justify-center gap-2 transition-all mt-auto"
                                >
                                    <Plus size={16}/> Plan Trip
                                </button>
                            </div>
                        </div>
                    ))}
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
                <p className="text-gray-500 text-sm">Manage boat schedules and view booking demand.</p>
            </div>
            
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => handleOpenModal()}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-teal-500 flex items-center gap-2"
                >
                    <Plus size={18} /> New Event
                </button>

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

        {/* Add Event Modal */}
        {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-shark-900">Schedule Trip</h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-shark-900"><X size={24}/></button>
                    </div>

                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                <input 
                                    type="date"
                                    className="w-full border rounded p-3 mt-1 bg-gray-50"
                                    value={eventDraft.date}
                                    onChange={(e) => setEventDraft({...eventDraft, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                                <input 
                                    type="time"
                                    className="w-full border rounded p-3 mt-1 bg-gray-50"
                                    value={eventDraft.time}
                                    onChange={(e) => setEventDraft({...eventDraft, time: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Trip Title</label>
                            <input 
                                className="w-full border rounded p-3 mt-1"
                                placeholder="e.g. Tiger Zoo Deep"
                                value={eventDraft.title}
                                onChange={(e) => setEventDraft({...eventDraft, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Dive Type</label>
                                <select 
                                    className="w-full border rounded p-3 mt-1 bg-white"
                                    value={eventDraft.type}
                                    onChange={(e) => setEventDraft({...eventDraft, type: e.target.value as any})}
                                >
                                    <option>Tiger Zoo</option>
                                    <option>Morning Dive</option>
                                    <option>Afternoon Dive</option>
                                    <option>Night Dive</option>
                                    <option>Theory</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Boat</label>
                                <select 
                                    className="w-full border rounded p-3 mt-1 bg-white"
                                    value={eventDraft.boat}
                                    onChange={(e) => setEventDraft({...eventDraft, boat: e.target.value as any})}
                                >
                                    <option>Shark One</option>
                                    <option>Shark Two</option>
                                    <option>Classroom</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Initial Guest Count</label>
                            <input 
                                type="number"
                                className="w-full border rounded p-3 mt-1"
                                value={eventDraft.guestCount}
                                onChange={(e) => setEventDraft({...eventDraft, guestCount: parseInt(e.target.value)})}
                            />
                        </div>

                        <button 
                            onClick={handleSaveEvent}
                            className="w-full bg-shark-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-shark-800 mt-4"
                        >
                            <Save size={18} /> Save Event
                        </button>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

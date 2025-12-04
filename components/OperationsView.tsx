
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Anchor, Plus, ChevronLeft, ChevronRight, MapPin, Users, ClipboardList, X, Save, Edit3, AlertTriangle, FileText } from 'lucide-react';
import { getEventsForDate, saveEvent } from '../services/mockDb';
import { getBookings, isDateInBooking, getDetailedStayBreakdown } from '../services/bookingService';
import { DailyEvent, Booking, StayBreakdown } from '../types';

export const OperationsView: React.FC = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Constants
  const MAX_BOAT_CAPACITY = 12;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DailyEvent | null>(null);
  
  const [manifestModalOpen, setManifestModalOpen] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<StayBreakdown | null>(null);

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

  const handleOpenManifest = (booking: Booking) => {
      const breakdown = getDetailedStayBreakdown(booking);
      setSelectedManifest(breakdown);
      setManifestModalOpen(true);
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
      <div className="space-y-12 pb-12">
        {months.map((monthDate) => {
          const year = monthDate.getFullYear();
          const monthIndex = monthDate.getMonth();
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          
          // Get bookings active in this month
          const monthStartStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-01`;
          const monthEndStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-${daysInMonth}`;
          
          const monthBookings = bookings.filter(b => 
              (b.checkIn <= monthEndStr && b.checkOut >= monthStartStr)
          );

          return (
            <div key={`${year}-${monthIndex}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               {/* Month Header - Exact requested format logic begins inside grid */}
               <div className="bg-shark-900 text-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg tracking-widest uppercase">
                   === {monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })} CALENDAR – SHARK ISLAND DIVE CENTER ===
                 </h3>
               </div>
               
               <div className="overflow-x-auto no-scrollbar pb-6">
                 <div 
                    className="inline-grid gap-x-0" 
                    style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))` }} // Tighter columns for clean timeline look
                 >
                    {/* Row 1: Dates (1-Jan format) */}
                    {daysArray.map(day => {
                         const monthAbbr = monthNames[monthIndex];
                         const dateStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                         return (
                            <div 
                                key={`date-${day}`} 
                                className="h-10 flex items-center justify-center text-[10px] md:text-xs font-bold border-r border-b border-gray-200 bg-gray-50 text-gray-700 whitespace-nowrap px-1"
                            >
                                {day}-{monthAbbr}
                            </div>
                         );
                    })}

                    {/* Row 2: Weekdays (Mon format) */}
                    {daysArray.map(day => {
                         const dateObj = new Date(year, monthIndex, day);
                         const dayOfWeek = weekdays[dateObj.getDay()];
                         return (
                            <div key={`day-${day}`} className="h-8 flex items-center justify-center text-[10px] md:text-xs font-bold uppercase border-r border-b border-gray-200 bg-white text-gray-500">
                                {dayOfWeek}
                            </div>
                         );
                    })}

                    {/* RESERVATION ENTRIES / GANTT TIMELINE */}
                    {/* We render a spacer row, then rows for bookings */}
                    <div className={`col-span-${daysInMonth} h-4 bg-gray-50 border-b border-gray-200`}></div>

                    {monthBookings.map((booking, bIdx) => {
                        // Calculate start/end column for this booking relative to this month
                        // Grid columns are 1-based
                        
                        // Parse dates
                        const bStart = new Date(booking.checkIn);
                        const bEnd = new Date(booking.checkOut);
                        
                        // Clamp to current month view
                        const viewStart = new Date(year, monthIndex, 1);
                        const viewEnd = new Date(year, monthIndex, daysInMonth);
                        
                        // Determine visual range in this month
                        const effectiveStart = bStart < viewStart ? viewStart : bStart;
                        const effectiveEnd = bEnd > viewEnd ? viewEnd : bEnd;
                        
                        const startDay = effectiveStart.getDate(); // 1..31
                        let span = (effectiveEnd.getDate() - startDay) + 1;
                        
                        // If trip ends this month, the bar shouldn't extend past checkout usually, but usually checkout day is shown as end of bar
                        // Gantt logic: usually checkout day is half day, but let's just span full dates
                        
                        // Determine grid placement
                        // If booking starts before this month, gridColumnStart is 1. Else it's startDay.
                        const colStart = startDay; 
                        
                        return (
                            <div key={booking.id} className="contents group">
                                {/* Spacer if it doesn't start at 1 (Not using real grid packing for simplicity, just one row per booking for now to ensure no overlap issues) */}
                                {colStart > 1 && <div style={{ gridColumn: `1 / span ${colStart - 1}` }} className="border-b border-gray-100 h-10"></div>}
                                
                                <div 
                                    style={{ gridColumn: `${colStart} / span ${span}` }}
                                    onClick={() => handleOpenManifest(booking)}
                                    className="h-10 mt-1 mb-1 bg-yellow-300 hover:bg-yellow-400 border border-yellow-400 rounded-md cursor-pointer flex items-center px-2 shadow-sm whitespace-nowrap overflow-hidden transition-all relative z-10"
                                >
                                    <div className="text-xs font-bold text-shark-900 truncate flex items-center gap-2">
                                        <Users size={12}/> 
                                        {booking.guestName} 
                                        <span className="opacity-70 font-normal">({booking.divers + booking.nonDivers} PAX)</span>
                                    </div>
                                </div>
                                
                                {colStart + span <= daysInMonth && (
                                     <div style={{ gridColumn: `${colStart + span} / -1` }} className="border-b border-gray-100 h-10"></div>
                                )}
                            </div>
                        );
                    })}

                    {monthBookings.length === 0 && (
                         <div className={`col-span-${daysInMonth} h-20 flex items-center justify-center text-gray-400 text-xs italic`}>
                             No reservations in this period.
                         </div>
                    )}

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
            <div className="lg:col-span-2 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="bg-shark-50 p-6 border-b border-gray-100 flex items-center justify-between">
                         <div>
                            <h3 className="font-bold text-shark-900 text-lg flex items-center gap-2">
                                <Anchor size={20} className="text-teal-600"/> Daily Dive Plan
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                1 Guaranteed Tiger Harbour + 2 Reef Dives. Click to update site & time.
                            </p>
                         </div>
                         <button 
                            className="bg-shark-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-shark-800"
                            onClick={() => {
                                setEditingEvent({
                                    id: `evt-ex-${Date.now()}`,
                                    date: selectedDate,
                                    time: '16:00',
                                    title: 'Sunset Fishing',
                                    type: 'Excursion',
                                    boat: 'Shark Two',
                                    staffIds: [],
                                    guestCount: 0,
                                    notes: ''
                                });
                                setIsModalOpen(true);
                            }}
                         >
                            <Plus size={14}/> Add Event
                         </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {sortedEvents.map((evt) => (
                            <div 
                                key={evt.id} 
                                onClick={() => handleEditEvent(evt)}
                                className={`
                                    relative border rounded-xl p-6 transition-all cursor-pointer group hover:shadow-md
                                    ${evt.type === 'Tiger Harbour' ? 'bg-orange-50/30 border-orange-100 hover:border-orange-300' : 
                                      evt.type === 'Excursion' ? 'bg-purple-50/30 border-purple-100 hover:border-purple-300' :
                                      'bg-white border-gray-100 hover:border-blue-300'}
                                    ${evt.guestCount > MAX_BOAT_CAPACITY ? 'border-red-300 bg-red-50/50' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-sm shrink-0
                                            ${evt.type === 'Tiger Harbour' ? 'bg-orange-100 text-orange-700' : 
                                              evt.type === 'Excursion' ? 'bg-purple-100 text-purple-700' :
                                              'bg-blue-100 text-blue-700'}
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
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${evt.type === 'Tiger Harbour' ? 'bg-orange-100 text-orange-800' : evt.type === 'Excursion' ? 'bg-purple-100 text-purple-800' : 'bg-blue-50 text-blue-600'}`}>
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
                                <button 
                                    onClick={() => handleOpenManifest(b)}
                                    className="w-full mt-2 text-[10px] font-bold text-shark-500 hover:text-shark-900 bg-gray-50 py-1 rounded border border-gray-200"
                                >
                                    View Stay Details
                                </button>
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
                             <label className="text-xs font-bold text-gray-500 uppercase">Event Type</label>
                             <select 
                                className="w-full border rounded p-3 mt-1 bg-white"
                                value={editingEvent.type}
                                onChange={(e) => setEditingEvent({...editingEvent, type: e.target.value as any})}
                            >
                                <option>Morning Dive</option>
                                <option>Tiger Harbour</option>
                                <option>Reef Dive</option>
                                <option>Afternoon Dive</option>
                                <option>Night Dive</option>
                                <option>Theory</option>
                                <option>Excursion</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Title / Site Name</label>
                            <input 
                                className="w-full border rounded p-3 mt-1 font-bold text-shark-900"
                                placeholder={editingEvent.type === 'Tiger Harbour' ? 'Tiger Harbour' : 'Enter Site Name'}
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
                                    Warning: Exceeds 12 Pax capacity. Hire 2nd Boat.
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

        {/* MANIFEST MODAL (STRICT FORMAT) */}
        {manifestModalOpen && selectedManifest && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                 <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-fade-in-up">
                      <div className="bg-shark-900 text-white p-4 flex justify-between items-center">
                          <h2 className="font-bold text-lg flex items-center gap-2">
                             <FileText size={20} className="text-teal-400"/> Stay Manifest
                          </h2>
                          <button onClick={() => setManifestModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                      </div>
                      
                      <div className="p-8 font-mono text-sm leading-relaxed text-shark-900 bg-gray-50 max-h-[70vh] overflow-y-auto">
                          <div className="font-bold text-lg border-b border-gray-300 pb-2 mb-4">
                              {selectedManifest.guestName} – {selectedManifest.pax} PAX
                          </div>
                          
                          <div className="mb-4 space-y-1">
                              <div>Arrival: <span className="font-bold">{selectedManifest.arrival}</span></div>
                              <div>Departure: <span className="font-bold">{selectedManifest.departure}</span></div>
                          </div>
                          
                          <div className="mb-6">
                               <div className="text-gray-500 font-bold mb-2">--- NIGHTS ({selectedManifest.nightCount}) ---</div>
                               {selectedManifest.nights.map((date, idx) => (
                                   <div key={`n-${idx}`}>NIGHT {idx + 1}: {date}</div>
                               ))}
                          </div>
                          
                          <div>
                               <div className="text-gray-500 font-bold mb-2">--- DAYS ({selectedManifest.dayCount}) ---</div>
                               {selectedManifest.days.map((date, idx) => (
                                   <div key={`d-${idx}`}>DAY {idx + 1}: {date}</div>
                               ))}
                          </div>
                      </div>
                      
                      <div className="p-4 border-t border-gray-200 flex justify-end bg-white">
                          <button 
                             onClick={() => setManifestModalOpen(false)} 
                             className="bg-gray-200 text-shark-900 font-bold px-6 py-2 rounded hover:bg-gray-300"
                          >
                              Close
                          </button>
                      </div>
                 </div>
             </div>
        )}
    </div>
  );
};

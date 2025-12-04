
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Anchor, Plus } from 'lucide-react';
import { getEvents, saveEvent } from '../services/mockDb';
import { DailyEvent } from '../types';

export const OperationsView: React.FC = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const dayEvents = events.filter(e => e.date === selectedDate);
  const boats = ['Shark One', 'Shark Two'];

  return (
    <div className="p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-shark-900">Operations & Logistics</h1>
            <div className="flex items-center gap-4">
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 font-bold text-shark-700"
                />
                <button className="bg-shark-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-shark-800">
                    <Plus size={18} /> New Event
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {boats.map(boat => (
                <div key={boat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-shark-50 p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-shark-900">
                            <Anchor size={18} className="text-teal-600"/> {boat}
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Operational</span>
                    </div>
                    <div className="p-4 min-h-[300px] space-y-4">
                        {dayEvents.filter(e => e.boat === boat).length === 0 ? (
                            <div className="text-center text-gray-400 py-10 text-sm">No trips planned for this boat today.</div>
                        ) : (
                            dayEvents.filter(e => e.boat === boat).map(evt => (
                                <div key={evt.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${evt.type === 'Tiger Zoo' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex justify-between items-start mb-2 pl-2">
                                        <h4 className="font-bold text-shark-900">{evt.title}</h4>
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{evt.time}</span>
                                    </div>
                                    <div className="pl-2 space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon size={14}/> {evt.guestCount} Guests
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
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

const UsersIcon = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

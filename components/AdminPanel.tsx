
import React, { useState, useEffect } from 'react';
import { PricingSettings, DiveTier, Accommodation, Season, Instructor, Booking } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';
import { getBookings, isDateInBooking, saveBooking } from '../services/bookingService';
import { Save, Plus, Trash2, DollarSign, Hotel, Plane, CalendarRange, Car, UserCheck, Calendar, X, ChevronLeft, ChevronRight, User, Leaf, Info } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'diving' | 'accommodation' | 'transfers' | 'seasons' | 'instructors'>('diving');
  const [message, setMessage] = useState('');
  
  // Instructor Calendar State
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Bookings State (for calendar visualization)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setSettings(getSettings());
    setBookings(getBookings());
  }, []);

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  // Helper to assign an instructor to a booking (mock functionality for demo)
  const assignInstructorToBooking = (bookingId: string, instructorId: string | null) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
          const updated = { ...booking, assignedInstructorId: instructorId };
          saveBooking(updated);
          setBookings(getBookings()); // Refresh
          if (selectedBooking && selectedBooking.id === bookingId) {
              setSelectedBooking(updated);
          }
      }
  };

  if (!settings) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  // --- Handlers ---

  // Diving Tier
  const updateTier = (index: number, field: keyof DiveTier, value: number) => {
    const newTiers = [...settings.diveTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setSettings({ ...settings, diveTiers: newTiers });
  };
  const addTier = () => {
    setSettings({
      ...settings,
      diveTiers: [...settings.diveTiers, { minDives: 0, maxDives: 0, pricePerDive: 0 }]
    });
  };
  const removeTier = (index: number) => {
    const newTiers = settings.diveTiers.filter((_, i) => i !== index);
    setSettings({ ...settings, diveTiers: newTiers });
  };

  // Accommodation
  const updateAccom = (index: number, field: keyof Accommodation, value: any) => {
    const newAcc = [...settings.accommodations];
    newAcc[index] = { ...newAcc[index], [field]: value };
    setSettings({ ...settings, accommodations: newAcc });
  };
  const addAccom = () => {
    setSettings({
        ...settings,
        accommodations: [...settings.accommodations, {
            id: Date.now().toString(),
            name: 'New Room',
            type: 'Hotel',
            pricePerNight: 100,
            description: '',
            imageUrl: 'https://picsum.photos/400/300'
        }]
    });
  };
  const removeAccom = (index: number) => {
      const newAcc = settings.accommodations.filter((_, i) => i !== index);
      setSettings({ ...settings, accommodations: newAcc });
  };

  // Seasons
  const updateSeason = (index: number, field: keyof Season, value: any) => {
    const newSeasons = [...(settings.seasons || [])];
    newSeasons[index] = { ...newSeasons[index], [field]: value };
    setSettings({ ...settings, seasons: newSeasons });
  };
  const addSeason = () => {
    setSettings({
      ...settings,
      seasons: [...(settings.seasons || []), { 
          id: Date.now().toString(), 
          name: 'New Season', 
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          percentageAdjustment: 0 
      }]
    });
  };
  const removeSeason = (index: number) => {
    const newSeasons = (settings.seasons || []).filter((_, i) => i !== index);
    setSettings({ ...settings, seasons: newSeasons });
  };

  // Instructors
  const addInstructor = () => {
    setSettings({
      ...settings,
      instructors: [...(settings.instructors || []), {
        id: Date.now().toString(),
        name: 'New Instructor',
        role: 'Instructor',
        unavailableDates: [],
        imageUrl: `https://ui-avatars.com/api/?name=New+Instr&background=random`
      }]
    });
  };

  const removeInstructor = (id: string) => {
    const newInstructors = settings.instructors.filter(i => i.id !== id);
    setSettings({ ...settings, instructors: newInstructors });
    if (selectedInstructorId === id) setSelectedInstructorId(null);
  };

  const updateInstructor = (id: string, field: keyof Instructor, value: any) => {
    const newInstructors = settings.instructors.map(i => i.id === id ? { ...i, [field]: value } : i);
    setSettings({ ...settings, instructors: newInstructors });
  };

  const toggleAvailability = (instructorId: string, dateStr: string) => {
    const instructor = settings.instructors.find(i => i.id === instructorId);
    if (!instructor) return;

    let newDates = [...instructor.unavailableDates];
    if (newDates.includes(dateStr)) {
      newDates = newDates.filter(d => d !== dateStr);
    } else {
      newDates.push(dateStr);
    }
    updateInstructor(instructorId, 'unavailableDates', newDates);
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const renderCalendar = () => {
    if (!selectedInstructorId) return <div className="text-gray-400 text-center py-10">Select an instructor to manage availability</div>;

    const instructor = settings.instructors.find(i => i.id === selectedInstructorId);
    if (!instructor) return null;

    const { days, firstDay } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const emptySlots = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-bold text-lg text-shark-900">{monthName}</h3>
          <button 
             onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
             className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {emptySlots.map(i => <div key={`empty-${i}`} />)}
          {daysArray.map(day => {
            // Safe date string construction to avoid timezone issues
            const year = currentMonth.getFullYear();
            const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            const dateStr = `${year}-${month}-${d}`;
            
            const isUnavailable = instructor.unavailableDates.includes(dateStr);
            
            // Check for bookings for this instructor on this date
            const activeBooking = bookings.find(b => 
                (b.assignedInstructorId === instructor.id || (!b.assignedInstructorId && instructor.role === 'Course Director')) && // Demo logic: Course Director sees unassigned too? No, keep it strict or demo-able.
                // Strict: Only assigned bookings
                b.assignedInstructorId === instructor.id && 
                isDateInBooking(dateStr, b)
            );

            // Special Case for Demo: If no instructor is assigned, show them on everyone's calendar as "Potential" or just ignore?
            // User request: "dates that are booked for a specific dive package". 
            // We will render Blue if assigned.

            return (
              <div 
                key={day}
                onClick={() => {
                    if (activeBooking) {
                        setSelectedBooking(activeBooking);
                    } else {
                        toggleAvailability(instructor.id, dateStr);
                    }
                }}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all border relative group
                  ${activeBooking
                    ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                    : isUnavailable 
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                        : 'bg-white border-gray-100 text-gray-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600'
                  }
                `}
              >
                {day}
                
                {/* Tooltip for Booked Date */}
                {activeBooking && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-shark-900 text-white text-xs p-2 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 text-center">
                        <div className="font-bold truncate">{activeBooking.guestName}</div>
                        <div className="text-gray-300">{activeBooking.divers} Divers</div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex gap-4 text-xs justify-center">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-200 bg-white rounded"></div>
                <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                <span>Unavailable</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                <span>Booked</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-64 bg-shark-900 text-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-shark-800 flex-shrink-0">
            <h2 className="text-xl font-bold tracking-tight">Admin Console</h2>
            <p className="text-xs text-shark-400 mt-1">System Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {[
                { id: 'diving', icon: DollarSign, label: 'Dive Pricing' },
                { id: 'accommodation', icon: Hotel, label: 'Accommodation' },
                { id: 'transfers', icon: Car, label: 'Transfers & Tax' },
                { id: 'seasons', icon: CalendarRange, label: 'Seasonal Rates' },
                { id: 'instructors', icon: UserCheck, label: 'Instructor Roster' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-teal-600 text-white shadow-lg' : 'text-shark-300 hover:bg-shark-800 hover:text-white'}`}
                >
                    <item.icon size={18} />
                    {item.label}
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-shark-800 flex-shrink-0">
            <button onClick={onClose} className="w-full py-2 text-shark-400 hover:text-white text-sm">Exit Admin</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center z-10 flex-shrink-0">
            <h1 className="text-2xl font-bold text-shark-900 capitalize">{activeTab.replace('-', ' ')} Settings</h1>
            <div className="flex items-center gap-4">
                {message && <span className="text-green-600 text-sm font-medium animate-fade-in">{message}</span>}
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-shark-900 text-white px-6 py-2 rounded-lg hover:bg-shark-800 transition-colors shadow-lg hover:shadow-xl"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
                
                {/* DIVING TAB */}
                {activeTab === 'diving' && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Tiered Pricing Structure</h3>
                            <button onClick={addTier} className="text-teal-600 hover:text-teal-700 text-sm font-bold flex items-center gap-1"><Plus size={16}/> Add Tier</button>
                        </div>
                        <div className="space-y-4">
                            {settings.diveTiers.map((tier, idx) => (
                                <div key={idx} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Min Dives</label>
                                        <input type="number" value={tier.minDives} onChange={(e) => updateTier(idx, 'minDives', parseInt(e.target.value))} className="w-full border rounded p-2 mt-1" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Max Dives</label>
                                        <input type="number" value={tier.maxDives} onChange={(e) => updateTier(idx, 'maxDives', parseInt(e.target.value))} className="w-full border rounded p-2 mt-1" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Price / Dive ($)</label>
                                        <input type="number" value={tier.pricePerDive} onChange={(e) => updateTier(idx, 'pricePerDive', parseInt(e.target.value))} className="w-full border rounded p-2 mt-1 font-bold text-teal-700" />
                                    </div>
                                    <button onClick={() => removeTier(idx)} className="p-2 text-red-400 hover:text-red-600 mb-1"><Trash2 size={20} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACCOMMODATION TAB */}
                {activeTab === 'accommodation' && (
                    <div className="space-y-6">
                        {settings.accommodations.map((acc, idx) => (
                            <div key={acc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                                <button onClick={() => removeAccom(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 size={20} /></button>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-1">
                                        <img src={acc.imageUrl} className="w-full h-32 object-cover rounded-lg bg-gray-100" />
                                        <input 
                                            value={acc.imageUrl} 
                                            onChange={(e) => updateAccom(idx, 'imageUrl', e.target.value)}
                                            className="w-full text-xs mt-2 border rounded p-1 text-gray-500" 
                                            placeholder="Image URL"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Property Name</label>
                                                <input type="text" value={acc.name} onChange={(e) => updateAccom(idx, 'name', e.target.value)} className="w-full border rounded p-2 mt-1 font-bold" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                                                <select value={acc.type} onChange={(e) => updateAccom(idx, 'type', e.target.value)} className="w-full border rounded p-2 mt-1 bg-white">
                                                    <option>Hotel</option>
                                                    <option>Guesthouse</option>
                                                    <option>Resort</option>
                                                    <option>Liveaboard</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Rate per Night ($)</label>
                                                <input type="number" value={acc.pricePerNight} onChange={(e) => updateAccom(idx, 'pricePerNight', parseInt(e.target.value))} className="w-full border rounded p-2 mt-1 font-bold text-teal-700" />
                                            </div>
                                            <div>
                                                 <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                                 <input type="text" value={acc.description} onChange={(e) => updateAccom(idx, 'description', e.target.value)} className="w-full border rounded p-2 mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addAccom} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-500 hover:text-teal-600 font-bold transition-all flex items-center justify-center gap-2">
                            <Plus size={20} /> Add Accommodation
                        </button>
                    </div>
                )}

                {/* TRANSFERS TAB */}
                {activeTab === 'transfers' && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
                        <div>
                             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plane size={20}/> Domestic Flight</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Return Price Per Person ($)</label>
                                    <input 
                                        type="number" 
                                        value={settings.domesticFlightPrice} 
                                        onChange={(e) => setSettings({...settings, domesticFlightPrice: parseInt(e.target.value)})} 
                                        className="w-full border rounded p-3 mt-1 font-bold text-lg" 
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Male (MLE) ↔ Fuvahmulah (FVM)</p>
                                </div>
                             </div>
                        </div>

                        <div>
                             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Car size={20}/> Ground Transfer</h3>
                             <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Cost ($)</label>
                                        <input 
                                            type="number" 
                                            value={settings.groundTransferPrice} 
                                            onChange={(e) => setSettings({...settings, groundTransferPrice: parseInt(e.target.value)})} 
                                            className="w-full border rounded p-3 mt-1 font-bold text-lg" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Pricing Model</label>
                                        <select 
                                            value={settings.groundTransferType} 
                                            onChange={(e) => setSettings({...settings, groundTransferType: e.target.value as any})} 
                                            className="w-full border rounded p-3 mt-1 bg-white"
                                        >
                                            <option value="PER_PERSON">Per Person</option>
                                            <option value="PER_VEHICLE">Per Vehicle</option>
                                        </select>
                                    </div>
                                </div>
                                {settings.groundTransferType === 'PER_VEHICLE' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Vehicle Capacity (Pax)</label>
                                        <input 
                                            type="number" 
                                            value={settings.groundTransferCapacity || 4} 
                                            onChange={(e) => setSettings({...settings, groundTransferCapacity: parseInt(e.target.value)})} 
                                            className="w-full md:w-1/2 border rounded p-3 mt-1" 
                                        />
                                    </div>
                                )}
                             </div>
                        </div>

                        <div>
                             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Leaf size={20}/> Green Tax</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-green-50/50 p-6 rounded-xl border border-green-100">
                                <div>
                                    <label className="text-xs font-bold text-green-700 uppercase">Tax Per Person / Night ($)</label>
                                    <input 
                                        type="number" 
                                        value={settings.greenTaxPerNight} 
                                        onChange={(e) => setSettings({...settings, greenTaxPerNight: parseInt(e.target.value)})} 
                                        className="w-full border border-green-200 rounded p-3 mt-1 font-bold text-lg text-green-800 bg-white" 
                                    />
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* SEASONS TAB */}
                {activeTab === 'seasons' && (
                     <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Seasonal Adjustments</h3>
                            <button onClick={addSeason} className="text-teal-600 hover:text-teal-700 text-sm font-bold flex items-center gap-1"><Plus size={16}/> Add Season</button>
                        </div>
                        <div className="space-y-4">
                            {(settings.seasons || []).map((season, idx) => (
                                <div key={season.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 p-4 rounded-lg items-end relative">
                                    <div className="md:col-span-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                        <input type="text" value={season.name} onChange={(e) => updateSeason(idx, 'name', e.target.value)} className="w-full border rounded p-2 mt-1" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                                        <input type="date" value={season.startDate} onChange={(e) => updateSeason(idx, 'startDate', e.target.value)} className="w-full border rounded p-2 mt-1" />
                                    </div>
                                     <div className="md:col-span-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                                        <input type="date" value={season.endDate} onChange={(e) => updateSeason(idx, 'endDate', e.target.value)} className="w-full border rounded p-2 mt-1" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Adjustment %</label>
                                        <input 
                                            type="number" 
                                            value={season.percentageAdjustment} 
                                            onChange={(e) => updateSeason(idx, 'percentageAdjustment', parseFloat(e.target.value))} 
                                            className={`w-full border rounded p-2 mt-1 font-bold ${season.percentageAdjustment > 0 ? 'text-red-500' : 'text-green-600'}`} 
                                        />
                                    </div>
                                    <button onClick={() => removeSeason(idx)} className="md:col-span-1 p-2 text-red-400 hover:text-red-600 mb-1"><Trash2 size={20} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INSTRUCTOR ROSTER TAB */}
                {activeTab === 'instructors' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                        {/* Instructor List */}
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-shark-900">Staff List</h3>
                                <button onClick={addInstructor} className="p-2 bg-shark-50 text-shark-600 rounded-full hover:bg-shark-100"><Plus size={18}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {(settings.instructors || []).map((inst) => (
                                    <div 
                                        key={inst.id}
                                        onClick={() => setSelectedInstructorId(inst.id)}
                                        className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${selectedInstructorId === inst.id ? 'bg-teal-50 border border-teal-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                                    >
                                        <img src={inst.imageUrl} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-shark-900">{inst.name}</div>
                                            <div className="text-xs text-gray-500">{inst.role}</div>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeInstructor(inst.id); }} 
                                            className="text-gray-300 hover:text-red-400 p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability Calendar */}
                        <div className="lg:col-span-2">
                            {selectedInstructorId ? (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-6 items-start">
                                        {/* Editor for Name/Role */}
                                        {(() => {
                                            const inst = settings.instructors.find(i => i.id === selectedInstructorId);
                                            if (!inst) return null;
                                            return (
                                                <div className="w-full grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                                        <input 
                                                            className="w-full border rounded p-2 mt-1" 
                                                            value={inst.name} 
                                                            onChange={(e) => updateInstructor(inst.id, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                                                        <select 
                                                            className="w-full border rounded p-2 mt-1 bg-white"
                                                            value={inst.role}
                                                            onChange={(e) => updateInstructor(inst.id, 'role', e.target.value)}
                                                        >
                                                            <option>Course Director</option>
                                                            <option>Instructor</option>
                                                            <option>Dive Master</option>
                                                            <option>Boat Captain</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        
                                        <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                                            <div className="font-bold mb-1 flex items-center gap-1"><Info size={12}/> Booking Integration</div>
                                            When a booking is assigned to this instructor, dates will appear <span className="text-blue-600 font-bold">Blue</span>. Click them to view details.
                                        </div>
                                    </div>
                                    
                                    {renderCalendar()}
                                </div>
                            ) : (
                                <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                                    <User size={48} className="mb-4 opacity-20" />
                                    <p>Select an instructor to view schedule</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
      
      {/* Booking Detail Modal */}
      {selectedBooking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="bg-shark-900 text-white p-6 flex justify-between items-start">
                      <div>
                          <div className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-1">Booking Details</div>
                          <h2 className="text-2xl font-bold">{selectedBooking.guestName}</h2>
                          <div className="text-shark-300 text-sm mt-1">{selectedBooking.id}</div>
                      </div>
                      <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <div className="text-gray-400 text-xs uppercase">Check In</div>
                              <div className="font-bold text-gray-800">{selectedBooking.checkIn}</div>
                          </div>
                           <div>
                              <div className="text-gray-400 text-xs uppercase">Check Out</div>
                              <div className="font-bold text-gray-800">{selectedBooking.checkOut}</div>
                          </div>
                          <div>
                              <div className="text-gray-400 text-xs uppercase">Guests</div>
                              <div className="font-bold text-gray-800">{selectedBooking.divers} Divers, {selectedBooking.nonDivers} Non</div>
                          </div>
                           <div>
                              <div className="text-gray-400 text-xs uppercase">Total Cost</div>
                              <div className="font-bold text-teal-600">${selectedBooking.grandTotal.toLocaleString()}</div>
                          </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4">
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Assigned Instructor</label>
                          <div className="flex gap-2 flex-wrap">
                                <button 
                                    onClick={() => assignInstructorToBooking(selectedBooking.id, null)}
                                    className={`px-3 py-2 rounded text-xs border ${!selectedBooking.assignedInstructorId ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    Unassigned
                                </button>
                              {settings.instructors.map(inst => (
                                  <button
                                    key={inst.id}
                                    onClick={() => assignInstructorToBooking(selectedBooking.id, inst.id)}
                                    className={`px-3 py-2 rounded text-xs border ${selectedBooking.assignedInstructorId === inst.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'}`}
                                  >
                                      {inst.name}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500 space-y-1">
                          <div><strong>Email:</strong> {selectedBooking.email}</div>
                          <div><strong>WhatsApp:</strong> {selectedBooking.whatsapp}</div>
                          <div><strong>Payment:</strong> {selectedBooking.paymentMethod}</div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { PricingSettings, DiveTier, Accommodation, Season, Instructor, Booking, DivePackage, SystemUser, SystemRole } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';
import { getBookings, isDateInBooking, saveBooking } from '../services/bookingService';
import { getUsers, saveUser, deleteUser } from '../services/mockDb';
import { Save, Plus, Trash2, DollarSign, Hotel, Plane, CalendarRange, Car, UserCheck, Calendar, X, ChevronLeft, ChevronRight, User, Leaf, Info, Package, Shield, Mail, Phone, Check } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'diving' | 'packages' | 'accommodation' | 'transfers' | 'seasons' | 'instructors' | 'users'>('diving');
  const [message, setMessage] = useState('');
  
  // Instructor Calendar State
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  
  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // User Management State
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<SystemUser>>({});

  useEffect(() => {
    setSettings(getSettings());
    setBookings(getBookings());
    setUsers(getUsers());
  }, []);

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  // --- USER MANAGEMENT HANDLERS ---
  const handleEditUser = (user?: SystemUser) => {
    if (user) {
      setEditingUser({ ...user }); 
    } else {
      setEditingUser({
        name: '',
        email: '',
        phone: '',
        role: 'STAFF',
        status: 'ACTIVE'
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser.name || !editingUser.email) return;
    
    const userToSave: SystemUser = {
      id: editingUser.id || `u-${Date.now()}`,
      name: editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone || '',
      role: editingUser.role || 'STAFF',
      status: editingUser.status || 'ACTIVE',
      lastLogin: editingUser.lastLogin
    };

    saveUser(userToSave);
    setUsers(getUsers()); // Refresh list
    setIsUserModalOpen(false);
    setMessage(editingUser.id ? 'User updated successfully' : 'User created successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      deleteUser(userId);
      setUsers(getUsers());
    }
  };

  const assignInstructorToBooking = (bookingId: string, instructorId: string | null) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
          const updated = { ...booking, assignedInstructorId: instructorId };
          saveBooking(updated);
          setBookings(getBookings());
          if (selectedBooking && selectedBooking.id === bookingId) {
              setSelectedBooking(updated);
          }
      }
  };

  if (!settings) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  // --- Handlers (Existing) ---
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

  const addPackage = () => {
    setSettings({
      ...settings,
      packages: [...(settings.packages || []), {
        id: Date.now().toString(),
        name: 'New Package',
        dives: 10,
        price: 700,
        description: '',
        features: ['Feature 1', 'Feature 2']
      }]
    });
  };
  const removePackage = (index: number) => {
    const newPkgs = (settings.packages || []).filter((_, i) => i !== index);
    setSettings({ ...settings, packages: newPkgs });
  };
  const updatePackage = (index: number, field: keyof DivePackage, value: any) => {
    const newPkgs = [...(settings.packages || [])];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setSettings({ ...settings, packages: newPkgs });
  };

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

  // --- CALENDAR RENDERER ---
  
  const getMonthsToRender = () => {
    const start = new Date();
    start.setDate(1); // 1st of current month
    
    // Find furthest booking date
    let maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6); // Default min 6 months
    
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

  const renderCalendar = () => {
    if (!selectedInstructorId) return <div className="text-gray-400 text-center py-10">Select an instructor to manage availability</div>;

    const instructor = settings.instructors.find(i => i.id === selectedInstructorId);
    if (!instructor) return null;

    const months = getMonthsToRender();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className="space-y-8">
        {months.map((monthDate) => {
          const year = monthDate.getFullYear();
          const monthIndex = monthDate.getMonth();
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div key={`${year}-${monthIndex}`} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-lg text-shark-900 mb-4 sticky left-0">
                 {monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
               </h3>
               
               <div className="overflow-x-auto pb-4 no-scrollbar">
                 <div className="inline-grid grid-rows-2 grid-flow-col gap-x-2 gap-y-1">
                    {/* Render Days */}
                    {daysArray.map(day => {
                        const dateObj = new Date(year, monthIndex, day);
                        const dateStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const monthAbbr = monthNames[monthIndex];
                        const dayOfWeek = weekdays[dateObj.getDay()];
                        
                        // Check if unavailable (manually set)
                        const isUnavailable = instructor.unavailableDates.includes(dateStr);
                        
                        // Check if booked (assigned to this instructor)
                        const activeBooking = bookings.find(b => 
                            b.assignedInstructorId === instructor.id && 
                            isDateInBooking(dateStr, b)
                        );
                        
                        return (
                          <React.Fragment key={dateStr}>
                             {/* ROW 1 CELL: DATE */}
                             <div 
                                className={`
                                  row-start-1 w-16 h-12 flex items-center justify-center text-sm font-bold border rounded-lg cursor-pointer transition-all relative group
                                  ${activeBooking
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 shadow-sm'
                                    : isUnavailable 
                                        ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-600'
                                  }
                                `}
                                onClick={() => {
                                    if (activeBooking) {
                                        setSelectedBooking(activeBooking);
                                    } else {
                                        toggleAvailability(instructor.id, dateStr);
                                    }
                                }}
                             >
                                {day}-{monthAbbr}

                                {/* Tooltip for Bookings */}
                                {activeBooking && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-shark-900 text-white text-xs p-3 rounded shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 text-center">
                                        <div className="font-bold text-teal-300 truncate mb-1">{activeBooking.guestName}</div>
                                        <div className="text-gray-300">{activeBooking.divers} Divers</div>
                                        <div className="text-gray-400 mt-1 pt-1 border-t border-gray-700">{activeBooking.totalDives} Dives Pkg</div>
                                    </div>
                                )}
                             </div>

                             {/* ROW 2 CELL: WEEKDAY */}
                             <div className="row-start-2 w-16 text-center text-xs font-bold text-gray-400 uppercase pt-1">
                                {dayOfWeek}
                             </div>
                          </React.Fragment>
                        );
                    })}
                 </div>
               </div>
            </div>
          );
        })}
        
        <div className="flex gap-4 text-xs justify-center sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-100 rounded-b-xl">
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
                { id: 'packages', icon: Package, label: 'Dive Packages' },
                { id: 'accommodation', icon: Hotel, label: 'Accommodation' },
                { id: 'transfers', icon: Car, label: 'Transfers & Tax' },
                { id: 'seasons', icon: CalendarRange, label: 'Seasonal Rates' },
                { id: 'instructors', icon: UserCheck, label: 'Instructor Roster' },
                { id: 'users', icon: Shield, label: 'User Access' },
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
                {activeTab !== 'users' && (
                  <button 
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-shark-900 text-white px-6 py-2 rounded-lg hover:bg-shark-800 transition-colors shadow-lg hover:shadow-xl"
                  >
                      <Save size={18} /> Save Changes
                  </button>
                )}
            </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
                
                {/* DIVING PRICING TAB */}
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

                {/* USERS TAB */}
                {activeTab === 'users' && (
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">System Users</h3>
                          <p className="text-xs text-gray-500">Manage access rights for your team.</p>
                        </div>
                        <button onClick={() => handleEditUser()} className="bg-shark-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-shark-800">
                          <Plus size={16}/> Add User
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">Role / Rights</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-shark-900">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-shark-100 flex items-center justify-center text-shark-700 font-bold">
                                    {user.name.charAt(0)}
                                  </div>
                                  {user.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                <div className="flex items-center gap-2 text-xs"><Mail size={12}/> {user.email}</div>
                                <div className="flex items-center gap-2 text-xs"><Phone size={12}/> {user.phone}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                  ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                                    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`flex items-center gap-1 text-xs font-bold ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                                  <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:underline">Edit</button>
                                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:underline">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PACKAGES TAB */}
                {activeTab === 'packages' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                      <Info className="text-blue-600 shrink-0 mt-1" size={18} />
                      <p className="text-sm text-blue-800">
                        Define marketing packages here. These presets allow you to showcase recommended itineraries.
                        The price set here is the <strong>displayed package price</strong> and can be independent of the tiered calculation logic.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {(settings.packages || []).map((pkg, idx) => (
                        <div key={pkg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                          <button onClick={() => removePackage(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 size={20} /></button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Basic Info */}
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Package Name</label>
                                <input 
                                  type="text" 
                                  value={pkg.name} 
                                  onChange={(e) => updatePackage(idx, 'name', e.target.value)} 
                                  className="w-full border rounded p-2 mt-1 font-bold text-lg text-shark-900" 
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase">Total Dives</label>
                                  <input 
                                    type="number" 
                                    value={pkg.dives} 
                                    onChange={(e) => updatePackage(idx, 'dives', parseInt(e.target.value))} 
                                    className="w-full border rounded p-2 mt-1" 
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase">Total Price ($)</label>
                                  <input 
                                    type="number" 
                                    value={pkg.price} 
                                    onChange={(e) => updatePackage(idx, 'price', parseInt(e.target.value))} 
                                    className="w-full border rounded p-2 mt-1 font-bold text-teal-600" 
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea 
                                  value={pkg.description} 
                                  onChange={(e) => updatePackage(idx, 'description', e.target.value)} 
                                  className="w-full border rounded p-2 mt-1 text-sm h-20" 
                                />
                              </div>
                            </div>
                            
                            {/* Right: Features */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Features (one per line)</label>
                              <textarea
                                value={pkg.features.join('\n')}
                                onChange={(e) => updatePackage(idx, 'features', e.target.value.split('\n'))}
                                className="w-full h-40 border rounded p-2 text-sm font-mono leading-relaxed"
                                placeholder="Free Nitrox&#10;Equipment Included&#10;Guide"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button onClick={addPackage} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-500 hover:text-teal-600 font-bold transition-all flex items-center justify-center gap-2">
                        <Plus size={20} /> Add New Package
                    </button>
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

                        {/* Availability Calendar (HORIZONTAL) */}
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
                                            Dates with active bookings are <span className="text-blue-600 font-bold">Blue</span>. Click to view guest details.
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
      
      {/* User Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-shark-900 mb-6">{editingUser.id ? 'Edit User' : 'Add New User'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input 
                  className="w-full border rounded p-3 mt-1" 
                  value={editingUser.name || ''} 
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  placeholder="e.g. Sarah Smith"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                <input 
                  className="w-full border rounded p-3 mt-1" 
                  value={editingUser.email || ''} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  placeholder="e.g. sarah@sharkisland.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                <input 
                  className="w-full border rounded p-3 mt-1" 
                  value={editingUser.phone || ''} 
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  placeholder="e.g. +960 777 0000"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                   <select 
                      className="w-full border rounded p-3 mt-1 bg-white"
                      value={editingUser.role || 'STAFF'}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                   >
                      <option value="STAFF">Staff - View Only</option>
                      <option value="MANAGER">Manager - Operations & Guests</option>
                      <option value="ADMIN">Admin - Full Access</option>
                   </select>
                </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                   <select 
                      className="w-full border rounded p-3 mt-1 bg-white"
                      value={editingUser.status || 'ACTIVE'}
                      onChange={(e) => setEditingUser({...editingUser, status: e.target.value as any})}
                   >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                   </select>
                </div>
              </div>

              {/* Explicit Rights Visualization */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Shield size={14}/> Assigned Rights
                </h4>
                <div className="space-y-2">
                    {editingUser.role === 'ADMIN' && (
                        <>
                            <div className="flex items-start gap-2 text-sm text-shark-900"><Check size={16} className="text-teal-600 shrink-0 mt-0.5"/> <span>Full System Configuration</span></div>
                            <div className="flex items-start gap-2 text-sm text-shark-900"><Check size={16} className="text-teal-600 shrink-0 mt-0.5"/> <span>User Management & Roles</span></div>
                            <div className="flex items-start gap-2 text-sm text-shark-900"><Check size={16} className="text-teal-600 shrink-0 mt-0.5"/> <span>Financial Access</span></div>
                        </>
                    )}
                    {editingUser.role === 'MANAGER' && (
                        <>
                            <div className="flex items-start gap-2 text-sm text-shark-900"><Check size={16} className="text-teal-600 shrink-0 mt-0.5"/> <span>Manage Operations & Staff</span></div>
                            <div className="flex items-start gap-2 text-sm text-shark-900"><Check size={16} className="text-teal-600 shrink-0 mt-0.5"/> <span>Guest CRM Access</span></div>
                             <div className="flex items-start gap-2 text-sm text-gray-400"><X size={16} className="shrink-0 mt-0.5"/> <span>System Settings Restricted</span></div>
                        </>
                    )}
                    {(editingUser.role === 'STAFF' || !editingUser.role) && (
                        <>
                            <div className="flex items-start gap-2 text-sm text-shark-900"><Check size={16} className="text-teal-600 shrink-0 mt-0.5"/> <span>View Schedule & Rosters</span></div>
                            <div className="flex items-start gap-2 text-sm text-gray-400"><X size={16} className="shrink-0 mt-0.5"/> <span>No Edit Access</span></div>
                        </>
                    )}
                </div>
              </div>

            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveUser} className="flex-1 bg-shark-900 text-white py-2 rounded font-bold hover:bg-shark-800">Save User</button>
            </div>
          </div>
        </div>
      )}

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

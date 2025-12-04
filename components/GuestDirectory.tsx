import React, { useState, useEffect } from 'react';
import { Search, Plus, Star, MessageCircle, Mail, Users } from 'lucide-react';
import { getGuests, saveGuest } from '../services/mockDb';
import { GuestProfile } from '../types';

export const GuestDirectory: React.FC = () => {
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);

  useEffect(() => {
    setGuests(getGuests());
  }, []);

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNote = (note: string) => {
    if (selectedGuest) {
        const updated = { ...selectedGuest, notes: note };
        saveGuest(updated);
        setGuests(getGuests());
        setSelectedGuest(updated);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-shark-900">Guest Directory</h1>
            <button className="bg-shark-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-shark-800">
                <Plus size={18} /> Add Guest
            </button>
        </div>

        <div className="flex gap-6 h-[calc(100vh-180px)]">
            {/* List */}
            <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Search guests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredGuests.map(g => (
                        <div 
                            key={g.id}
                            onClick={() => setSelectedGuest(g)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedGuest?.id === g.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-shark-900">{g.name}</h3>
                                {g.vipLevel !== 'V1' && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.vipLevel === 'V3' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {g.vipLevel}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{g.country}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-y-auto">
                {selectedGuest ? (
                    <div className="space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-full bg-shark-100 flex items-center justify-center text-2xl font-bold text-shark-500">
                                {selectedGuest.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-bold text-shark-900">{selectedGuest.name}</h2>
                                        <div className="flex items-center gap-2 mt-2 text-gray-500">
                                            <span>{selectedGuest.country}</span> • <span>Joined {selectedGuest.joinedDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-green-600"><MessageCircle size={20}/></button>
                                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600"><Mail size={20}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">VIP Level</div>
                                <div className="text-xl font-bold text-shark-900 flex items-center gap-2">
                                    {selectedGuest.vipLevel} 
                                    {[...Array(parseInt(selectedGuest.vipLevel.replace('V','')))].map((_,i) => <Star key={i} size={14} className="fill-orange-400 text-orange-400"/>)}
                                </div>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Bookings</div>
                                <div className="text-xl font-bold text-shark-900">{selectedGuest.bookings.length}</div>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Lifetime Value</div>
                                <div className="text-xl font-bold text-teal-600">$4,250</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-shark-900 mb-2">Staff Notes</h3>
                            <textarea 
                                className="w-full h-32 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                value={selectedGuest.notes}
                                onChange={(e) => handleSaveNote(e.target.value)}
                            />
                        </div>

                        <div>
                            <h3 className="font-bold text-shark-900 mb-4">Contact Info</h3>
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Email</span> <span className="font-medium">{selectedGuest.email}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">WhatsApp</span> <span className="font-medium">{selectedGuest.whatsapp}</span></div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Users size={48} className="mb-4 opacity-20"/>
                        <p>Select a guest to view details</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
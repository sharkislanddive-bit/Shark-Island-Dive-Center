import React, { useState, useEffect } from 'react';
import { PricingSettings, DiveTier, Accommodation, Season } from '../types';
import { getSettings, saveSettings } from '../services/settingsService';
import { Save, Plus, Trash2, DollarSign, Hotel, Plane, CalendarRange, Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'diving' | 'accommodation' | 'transfers' | 'seasons'>('diving');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!settings) return <div>Loading...</div>;

  // Diving Tier Handlers
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

  // Accommodation Handlers
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

  // Season Handlers
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

  // Data for Chart
  const chartData = settings.diveTiers.map(tier => ({
    name: `${tier.minDives}-${tier.maxDives}`,
    price: tier.pricePerDive
  }));

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-shark-900">Backend Pricing Engine</h2>
        <div className="flex gap-4">
          <button onClick={onClose} className="text-shark-600 hover:underline">Exit to Site</button>
          <button 
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-teal-600/20"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-6 text-center font-semibold animate-fade-in">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('diving')}
            className={`p-4 text-left rounded-lg flex items-center gap-3 font-medium transition-colors ${activeTab === 'diving' ? 'bg-shark-100 text-shark-800' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <DollarSign size={20} /> Diving Rates
          </button>
          <button 
            onClick={() => setActiveTab('accommodation')}
            className={`p-4 text-left rounded-lg flex items-center gap-3 font-medium transition-colors ${activeTab === 'accommodation' ? 'bg-shark-100 text-shark-800' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Hotel size={20} /> Accommodation
          </button>
          <button 
            onClick={() => setActiveTab('seasons')}
            className={`p-4 text-left rounded-lg flex items-center gap-3 font-medium transition-colors ${activeTab === 'seasons' ? 'bg-shark-100 text-shark-800' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <CalendarRange size={20} /> Seasonal Pricing
          </button>
          <button 
            onClick={() => setActiveTab('transfers')}
            className={`p-4 text-left rounded-lg flex items-center gap-3 font-medium transition-colors ${activeTab === 'transfers' ? 'bg-shark-100 text-shark-800' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Plane size={20} /> Transfers & Tax
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-gray-50 p-8 rounded-xl border border-gray-200 min-h-[600px]">
          {activeTab === 'diving' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-shark-800 mb-4">Tiered Pricing Structure</h3>
                <p className="text-sm text-gray-500 mb-6">Define price per dive based on total number of dives booked.</p>
                
                <div className="space-y-4">
                  {settings.diveTiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white p-4 rounded shadow-sm">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 uppercase">Min Dives</label>
                        <input 
                          type="number" 
                          value={tier.minDives} 
                          onChange={(e) => updateTier(index, 'minDives', parseInt(e.target.value))}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 uppercase">Max Dives</label>
                        <input 
                          type="number" 
                          value={tier.maxDives} 
                          onChange={(e) => updateTier(index, 'maxDives', parseInt(e.target.value))}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 uppercase">Price ($)</label>
                        <input 
                          type="number" 
                          value={tier.pricePerDive} 
                          onChange={(e) => updateTier(index, 'pricePerDive', parseInt(e.target.value))}
                          className="w-full border rounded p-2 font-bold text-teal-700"
                        />
                      </div>
                      <button onClick={() => removeTier(index)} className="text-red-400 hover:text-red-600 mt-4">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addTier} className="text-teal-600 font-medium flex items-center gap-2 hover:bg-teal-50 px-4 py-2 rounded">
                    <Plus size={18} /> Add Tier
                  </button>
                </div>
              </div>

              <div className="h-64 w-full bg-white p-4 rounded-lg shadow-sm">
                 <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase">Price Curve Visualization</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" label={{ value: 'Dive Quantity', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="price" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'accommodation' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-shark-800">Property & Room Rates</h3>
                    <button onClick={addAccom} className="text-teal-600 flex items-center gap-1 text-sm font-bold hover:bg-teal-50 px-3 py-1 rounded">
                        <Plus size={16} /> Add Room Type
                    </button>
                </div>
                
                {settings.accommodations.map((acc, index) => (
                  <div key={acc.id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-teal-500 relative">
                    <button onClick={() => removeAccom(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name / Room Type</label>
                        <input 
                          value={acc.name}
                          onChange={(e) => updateAccom(index, 'name', e.target.value)}
                          placeholder="e.g. Tiger Residence - Deluxe"
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                         <select 
                           value={acc.type}
                           onChange={(e) => updateAccom(index, 'type', e.target.value)}
                           className="w-full border rounded p-2"
                         >
                             <option value="Hotel">Hotel</option>
                             <option value="Guesthouse">Guesthouse</option>
                             <option value="Resort">Resort</option>
                             <option value="Liveaboard">Liveaboard</option>
                         </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price Per Night ($)</label>
                        <input 
                          type="number"
                          value={acc.pricePerNight}
                          onChange={(e) => updateAccom(index, 'pricePerNight', parseInt(e.target.value))}
                          className="w-full border rounded p-2 font-semibold"
                        />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                          <input 
                             value={acc.imageUrl}
                             onChange={(e) => updateAccom(index, 'imageUrl', e.target.value)}
                             className="w-full border rounded p-2 text-xs text-gray-500"
                           />
                      </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                          value={acc.description}
                          onChange={(e) => updateAccom(index, 'description', e.target.value)}
                          className="w-full border rounded p-2 text-sm"
                          rows={2}
                        />
                      </div>
                  </div>
                ))}
             </div>
          )}

          {activeTab === 'seasons' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-shark-800">Seasonal Adjustments</h3>
                        <p className="text-sm text-gray-500">Define date ranges where prices increase or decrease.</p>
                    </div>
                    <button onClick={addSeason} className="text-teal-600 flex items-center gap-1 text-sm font-bold hover:bg-teal-50 px-3 py-1 rounded">
                        <Plus size={16} /> Add Season
                    </button>
                </div>

                <div className="space-y-4">
                    {(!settings.seasons || settings.seasons.length === 0) && (
                        <div className="text-center py-10 text-gray-400 italic bg-white rounded-lg border border-dashed">
                            No seasons defined. Base rates will apply year-round.
                        </div>
                    )}
                    
                    {settings.seasons?.map((season, index) => (
                        <div key={season.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center">
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                                <div className="md:col-span-1">
                                    <label className="block text-xs text-gray-500 uppercase mb-1">Season Name</label>
                                    <input 
                                        value={season.name}
                                        onChange={(e) => updateSeason(index, 'name', e.target.value)}
                                        className="w-full border rounded p-2"
                                        placeholder="e.g. High Season"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-1">Start Date</label>
                                    <input 
                                        type="date"
                                        value={season.startDate}
                                        onChange={(e) => updateSeason(index, 'startDate', e.target.value)}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-1">End Date</label>
                                    <input 
                                        type="date"
                                        value={season.endDate}
                                        onChange={(e) => updateSeason(index, 'endDate', e.target.value)}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-1">Adjustment (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={season.percentageAdjustment}
                                            onChange={(e) => updateSeason(index, 'percentageAdjustment', parseFloat(e.target.value))}
                                            className={`w-full border rounded p-2 font-bold ${season.percentageAdjustment > 0 ? 'text-red-500' : 'text-green-500'}`}
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400">%</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => removeSeason(index)} className="text-gray-400 hover:text-red-500 p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-6 animate-fade-in">
               <h3 className="text-xl font-bold text-shark-800 mb-4">Logistics & Green Tax</h3>
               
               <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                  <div className="border-b pb-6">
                      <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Plane size={18} /> Domestic Flight</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Return Flight Price (Per Person)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input 
                                type="number"
                                value={settings.domesticFlightPrice}
                                onChange={(e) => setSettings({...settings, domesticFlightPrice: parseInt(e.target.value)})}
                                className="w-full border rounded pl-8 p-2"
                                />
                            </div>
                        </div>
                      </div>
                  </div>

                  <div className="border-b pb-6">
                      <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Car size={18} /> Ground Transfer (Local)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input 
                                    type="number"
                                    value={settings.groundTransferPrice}
                                    onChange={(e) => setSettings({...settings, groundTransferPrice: parseInt(e.target.value)})}
                                    className="w-full border rounded pl-8 p-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Strategy</label>
                            <select 
                                value={settings.groundTransferType || 'PER_PERSON'}
                                onChange={(e) => setSettings({...settings, groundTransferType: e.target.value as any})}
                                className="w-full border rounded p-2"
                            >
                                <option value="PER_PERSON">Price Per Person</option>
                                <option value="PER_VEHICLE">Price Per Vehicle</option>
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${settings.groundTransferType === 'PER_VEHICLE' ? 'text-gray-700' : 'text-gray-300'}`}>Vehicle Capacity</label>
                            <input 
                                type="number"
                                disabled={settings.groundTransferType !== 'PER_VEHICLE'}
                                value={settings.groundTransferCapacity || 4}
                                onChange={(e) => setSettings({...settings, groundTransferCapacity: parseInt(e.target.value)})}
                                className="w-full border rounded p-2"
                            />
                        </div>
                      </div>
                  </div>

                  <div>
                      <h4 className="font-bold text-teal-700 mb-4 flex items-center gap-2">🌿 Green Tax</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (Per Person / Per Night)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input 
                                type="number"
                                value={settings.greenTaxPerNight}
                                onChange={(e) => setSettings({...settings, greenTaxPerNight: parseInt(e.target.value)})}
                                className="w-full border rounded pl-8 p-2 font-bold text-teal-700"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Automatically added to all bookings based on government regulations.</p>
                        </div>
                      </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
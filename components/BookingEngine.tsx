import React, { useState, useEffect, useMemo } from 'react';
import { PricingSettings, BookingDraft, BookingTotals } from '../types';
import { getSettings, calculateTotals } from '../services/settingsService';
import { Calendar, Users, Anchor, Hotel, CheckCircle, Info, Leaf, User, CreditCard } from 'lucide-react';
import { askSharkExpert } from '../services/geminiService';

interface BookingEngineProps {
  onBookingComplete: () => void;
}

export const BookingEngine: React.FC<BookingEngineProps> = ({ onBookingComplete }) => {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [draft, setDraft] = useState<BookingDraft>({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    divers: 2,
    nonDivers: 0,
    totalDives: 10,
    selectedAccommodationId: null,
    includeDomesticFlight: true,
    includeGearRental: false,
    guestName: '',
    email: '',
    whatsapp: '',
    nationality: '',
    paymentMethod: 'BANK_TRANSFER',
  });

  useEffect(() => {
    const data = getSettings();
    setSettings(data);
    if (data.accommodations.length > 0) {
      setDraft(d => ({ ...d, selectedAccommodationId: data.accommodations[0].id }));
    }
  }, []);

  const totals: BookingTotals | null = useMemo(() => {
    if (!settings) return null;
    return calculateTotals(draft, settings);
  }, [draft, settings]);

  const handleAiAsk = async () => {
    if (!aiQuery.trim() || !settings) return;
    setIsThinking(true);
    const context = JSON.stringify(settings);
    const answer = await askSharkExpert(aiQuery, context);
    setAiResponse(answer);
    setIsThinking(false);
  };
  
  const handleConfirmBooking = () => {
      console.log("=== BOOKING CONFIRMED ===");
      console.log("Guest:", draft.guestName, draft.email, draft.whatsapp);
      console.log("Draft Details:", draft);
      console.log("Financial Totals:", totals);
      console.log("=========================");
      
      setShowConfirmModal(false);
      onBookingComplete();
  };
  
  const getAverageNightlyPrice = (basePrice: number) => {
      if (!totals || totals.nights === 0) return basePrice;
      let totalRate = 0;
      const start = new Date(draft.checkIn);
      const date = new Date(start);
      for(let i=0; i<totals.nights; i++) {
         let rate = basePrice;
         const dStr = date.toISOString().split('T')[0];
         const s = settings?.seasons?.find(s => dStr >= s.startDate && dStr <= s.endDate);
         if (s) rate = rate * (1 + s.percentageAdjustment / 100);
         totalRate += rate;
         date.setDate(date.getDate() + 1);
      }
      return Math.round(totalRate / totals.nights);
  };

  const isStep4Valid = () => {
    return draft.guestName.length > 2 && draft.email.includes('@') && draft.whatsapp.length > 5 && draft.nationality.length > 2;
  };

  if (!settings || !totals) return <div className="text-teal-900 p-10 text-center">Loading configuration...</div>;

  return (
    <div className="min-h-screen bg-shark-50 pb-20">
      {/* Progress Bar - Hidden on Step 1 for clean entry */}
      {step > 1 && (
        <div className="bg-white shadow-sm sticky top-0 z-30 animate-fade-in-down">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    {[
                        { id: 1, icon: Calendar, label: 'Dates' },
                        { id: 2, icon: Anchor, label: 'Diving' },
                        { id: 3, icon: Hotel, label: 'Stay' },
                        { id: 4, icon: User, label: 'Details' },
                        { id: 5, icon: CheckCircle, label: 'Review' }
                    ].map((s) => (
                        <div 
                            key={s.id} 
                            onClick={() => {
                                if (step > s.id) setStep(s.id); // Can always go back
                                // Can only go forward if we are already past it (simple logic for now)
                            }}
                            className={`flex flex-col items-center cursor-pointer transition-all ${step === s.id ? 'text-teal-600 scale-110' : 'text-gray-400'} ${step > s.id ? 'text-teal-600 hover:text-teal-500' : ''}`}
                        >
                            <s.icon size={24} className="mb-1" />
                            <span className="text-xs font-bold uppercase hidden md:block">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Form Area */}
            <div className={step === 1 ? "lg:col-span-3 flex justify-center" : "lg:col-span-2 space-y-6"}>
                
                {/* Step 1: Dates & Pax - Centered View */}
                {step === 1 && (
                    <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-2xl shadow-xl animate-fade-in border-t-4 border-teal-500 mt-10">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-shark-900 mb-2">Start Your Expedition</h1>
                            <p className="text-gray-500">Select your travel dates to view availability and pricing.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Check In</label>
                                <input 
                                    type="date" 
                                    value={draft.checkIn}
                                    onChange={(e) => setDraft({...draft, checkIn: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-shark-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Check Out</label>
                                <input 
                                    type="date" 
                                    value={draft.checkOut}
                                    onChange={(e) => setDraft({...draft, checkOut: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-shark-900"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Divers</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={draft.divers}
                                        onChange={(e) => setDraft({...draft, divers: parseInt(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 pl-10 font-semibold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Non-Divers</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={draft.nonDivers}
                                        onChange={(e) => setDraft({...draft, nonDivers: parseInt(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 pl-10 font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            className="w-full bg-shark-900 text-white text-lg py-5 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg hover:shadow-teal-500/20 flex items-center justify-center gap-2"
                        >
                            Check Availability & Rates
                            <Calendar size={20} />
                        </button>
                    </div>
                )}

                {/* Step 2: Diving */}
                {step === 2 && (
                    <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
                         <h2 className="text-2xl font-bold text-shark-900 mb-6 flex items-center gap-2">
                            <Anchor className="text-teal-500" /> Dive Package
                        </h2>
                        
                        <div className="mb-8">
                            <label className="block text-lg font-bold text-gray-700 mb-2">
                                How many dives per diver?
                            </label>
                            <input 
                                type="range" 
                                min="1" 
                                max="30" 
                                value={draft.totalDives}
                                onChange={(e) => setDraft({...draft, totalDives: parseInt(e.target.value)})}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                            <div className="flex justify-between mt-2 text-gray-500 font-medium">
                                <span>1 Dive</span>
                                <span className="text-teal-600 font-bold text-xl">{draft.totalDives} Dives</span>
                                <span>30 Dives</span>
                            </div>
                        </div>

                        <div className="bg-shark-50 p-4 rounded-lg mb-6 border border-shark-100">
                            <h3 className="text-sm font-bold text-shark-800 uppercase mb-3">Current Tier Rates</h3>
                            <div className="flex justify-between gap-2 text-sm">
                                {settings.diveTiers.map((t, i) => (
                                    <div key={i} className={`flex-1 p-2 rounded text-center ${draft.totalDives >= t.minDives && draft.totalDives <= t.maxDives ? 'bg-teal-100 border-teal-500 border text-teal-900 font-bold' : 'bg-white text-gray-400'}`}>
                                        <div className="text-xs">{t.minDives}-{t.maxDives} Dives</div>
                                        <div>${t.pricePerDive}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setDraft({...draft, includeGearRental: !draft.includeGearRental})}>
                            <div className={`w-6 h-6 rounded border flex items-center justify-center ${draft.includeGearRental ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                                {draft.includeGearRental && <CheckCircle size={16} className="text-white" />}
                            </div>
                            <div>
                                <span className="font-bold text-gray-800">Include Full Gear Rental</span>
                                <p className="text-sm text-gray-500">BCD, Reg, Wetsuit, Fins, Mask ($30/day)</p>
                            </div>
                        </div>

                         <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Back</button>
                            <button onClick={() => setStep(3)} className="flex-1 bg-shark-900 text-white py-4 rounded-lg font-bold hover:bg-shark-800 transition-colors">Next: Accommodation</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Accommodation */}
                {step === 3 && (
                    <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
                         <h2 className="text-2xl font-bold text-shark-900 mb-6 flex items-center gap-2">
                            <Hotel className="text-teal-500" /> Select Accommodation
                        </h2>
                        
                        {totals.seasonalAdjustmentApplied && (
                            <div className="bg-orange-50 text-orange-800 p-3 mb-4 rounded-lg text-sm font-medium border border-orange-100 flex items-center gap-2">
                                <Info size={16} /> Seasonal rates apply for your selected dates. Prices below reflect the average nightly rate.
                            </div>
                        )}

                        <div className="space-y-4">
                            {settings.accommodations.map((acc) => {
                                const avgPrice = getAverageNightlyPrice(acc.pricePerNight);
                                return (
                                    <div 
                                        key={acc.id}
                                        onClick={() => setDraft({...draft, selectedAccommodationId: acc.id})}
                                        className={`relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${draft.selectedAccommodationId === acc.id ? 'border-teal-500 bg-teal-50/30' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <img src={acc.imageUrl} className="w-full md:w-32 h-32 object-cover rounded-lg bg-gray-200" alt={acc.name} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-shark-900">{acc.name}</h3>
                                                    <span className="text-xs bg-shark-200 text-shark-800 px-2 py-1 rounded-full">{acc.type}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-teal-600">${avgPrice}</div>
                                                    <div className="text-xs text-gray-400">avg / night</div>
                                                    {avgPrice !== acc.pricePerNight && (
                                                        <div className="text-xs text-orange-400 line-through">${acc.pricePerNight}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">{acc.description}</p>
                                        </div>
                                        {draft.selectedAccommodationId === acc.id && (
                                            <div className="absolute top-2 right-2 text-teal-500"><CheckCircle /></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                         <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(2)} className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Back</button>
                            <button onClick={() => setStep(4)} className="flex-1 bg-shark-900 text-white py-4 rounded-lg font-bold hover:bg-shark-800 transition-colors">Next: Guest Details</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Guest Details (NEW) */}
                {step === 4 && (
                    <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
                        <h2 className="text-2xl font-bold text-shark-900 mb-6 flex items-center gap-2">
                            <User className="text-teal-500" /> Guest Information
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Lead Guest Name"
                                    value={draft.guestName}
                                    onChange={(e) => setDraft({...draft, guestName: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="you@example.com"
                                        value={draft.email}
                                        onChange={(e) => setDraft({...draft, email: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
                                    <input 
                                        type="tel" 
                                        placeholder="+1 234 567 890"
                                        value={draft.whatsapp}
                                        onChange={(e) => setDraft({...draft, whatsapp: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Country of Nationality</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. France, USA, Singapore"
                                    value={draft.nationality}
                                    onChange={(e) => setDraft({...draft, nationality: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Manual Payment Method</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { id: 'BANK_TRANSFER', label: 'Bank Transfer (USD)' },
                                        { id: 'WISE', label: 'Wise / Revolut' },
                                        { id: 'CASH_USD', label: 'Cash on Arrival (USD)' },
                                        { id: 'CASH_MVR', label: 'Cash on Arrival (MVR)' },
                                    ].map((pm) => (
                                        <div 
                                            key={pm.id}
                                            onClick={() => setDraft({...draft, paymentMethod: pm.id as any})}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-2 ${draft.paymentMethod === pm.id ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border ${draft.paymentMethod === pm.id ? 'bg-teal-500 border-teal-500' : 'border-gray-400'}`}></div>
                                            <span className="text-sm font-medium">{pm.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Info size={12}/> We will send payment instructions to your Email/WhatsApp.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(3)} className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Back</button>
                            <button 
                                onClick={() => setStep(5)} 
                                disabled={!isStep4Valid()}
                                className={`flex-1 text-white py-4 rounded-lg font-bold transition-colors ${isStep4Valid() ? 'bg-shark-900 hover:bg-shark-800' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Next: Final Review
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Review & Transfers (Formerly Step 4) */}
                {step === 5 && (
                    <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
                         <h2 className="text-2xl font-bold text-shark-900 mb-6 flex items-center gap-2">
                            <CheckCircle className="text-teal-500" /> Final Review
                        </h2>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={draft.includeDomesticFlight}
                                    onChange={(e) => setDraft({...draft,includeDomesticFlight: e.target.checked})}
                                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <div>
                                    <span className="font-bold text-gray-800">Include Return Domestic Flights</span>
                                    <p className="text-xs text-gray-500">Male (MLE) to Fuvahmulah (FVM) - 1h 15m. We handle the booking.</p>
                                </div>
                                <div className="ml-auto font-bold text-shark-900">
                                    ${settings.domesticFlightPrice}/pax
                                </div>
                            </label>
                        </div>

                        <div className="space-y-4 text-sm border-t pt-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/50 p-4 rounded-lg mb-4 border border-teal-100">
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase">Guest</span>
                                    <span className="font-bold text-shark-900">{draft.guestName}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase">Contact</span>
                                    <span className="font-bold text-shark-900">{draft.whatsapp}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase">Email</span>
                                    <span className="font-bold text-shark-900">{draft.email}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-xs uppercase">Payment</span>
                                    <span className="font-bold text-shark-900">{draft.paymentMethod.replace('_', ' ')}</span>
                                </div>
                             </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Dates</span>
                                <span className="font-medium">{draft.checkIn} to {draft.checkOut} ({totals.nights} nights)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Guests</span>
                                <span className="font-medium">{draft.divers} Divers, {draft.nonDivers} Non-Divers</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">Total Dives</span>
                                <span className="font-medium">{draft.totalDives * draft.divers} Dives Total</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-gray-500">Transfers</span>
                                <span className="font-medium">
                                    {settings.groundTransferType === 'PER_VEHICLE' 
                                        ? `${Math.ceil((draft.divers + draft.nonDivers) / settings.groundTransferCapacity)} Vehicle(s)` 
                                        : 'Per Person'
                                    }
                                </span>
                            </div>
                        </div>

                         <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(4)} className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Back</button>
                            <button 
                                onClick={() => setShowConfirmModal(true)}
                                className="flex-1 bg-teal-500 text-white py-4 rounded-lg font-bold hover:bg-teal-400 shadow-lg shadow-teal-500/30 transition-all"
                            >
                                Confirm Booking Request
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Sidebar Summary - Hidden on Step 1 to simplify entry */}
            {step > 1 && (
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-shark-900 text-white rounded-2xl p-6 shadow-xl animate-fade-in">
                        <h3 className="text-xl font-bold mb-6 border-b border-shark-700 pb-4">Booking Summary</h3>
                        
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between">
                                <span className="text-shark-300">Diving ({draft.totalDives * draft.divers})</span>
                                <span>${totals.diveCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-shark-300">Accommodation ({totals.nights}n)</span>
                                <span>${totals.accommodationCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-shark-300">Gear Rental</span>
                                <span>${totals.gearCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-shark-300">Transfers & Flight</span>
                                <span>${totals.transferCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-teal-200">
                                <span className="flex items-center gap-1"><Leaf size={12} /> Green Tax</span>
                                <span>${totals.taxCost.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="border-t border-shark-700 pt-4 flex justify-between items-center mb-6">
                            <span className="font-bold text-lg">Total Est.</span>
                            <span className="font-bold text-3xl text-teal-400">${totals.grandTotal.toLocaleString()}</span>
                        </div>
                        
                        <div className="bg-shark-800 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info size={16} className="text-teal-400 mt-1 flex-shrink-0" />
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Includes Green Tax. We will coordinate payment manually via {draft.paymentMethod ? draft.paymentMethod.replace('_', ' ') : 'Email'}.
                                    {totals.seasonalAdjustmentApplied && ' Seasonal rates are included.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI Helper Float */}
                    <div className="mt-6 bg-white rounded-2xl shadow-lg p-4 border border-teal-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-2xl">🦈</div>
                            <div>
                                <h4 className="font-bold text-sm text-shark-900">Ask Fin, the Shark Expert</h4>
                                <p className="text-xs text-gray-500">Powered by Gemini</p>
                            </div>
                        </div>
                        <div className="relative">
                            <input 
                                className="w-full bg-gray-50 border rounded-lg p-2 text-sm pr-8"
                                placeholder="Best time for Tiger Sharks?"
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                            />
                            <button 
                                onClick={handleAiAsk}
                                className="absolute right-2 top-2 text-teal-600 hover:text-teal-800"
                            >
                                ➤
                            </button>
                        </div>
                        {isThinking && <p className="text-xs text-gray-400 mt-2 animate-pulse">Consulting the ocean...</p>}
                        {aiResponse && (
                            <div className="mt-3 text-xs bg-teal-50 p-3 rounded text-shark-800 leading-relaxed">
                                {aiResponse}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 relative animate-fade-in-up">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto text-teal-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-shark-900 text-center mb-2">Request Received!</h3>
                <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed">
                    Thank you <strong>{draft.guestName}</strong>. We have received your booking request.
                    <br/><br/>
                    Since we process payments manually, our team will contact you via <strong>{draft.whatsapp ? 'WhatsApp' : 'Email'}</strong> shortly to arrange the <strong>{draft.paymentMethod.replace('_', ' ')}</strong>.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={handleConfirmBooking}
                        className="w-full bg-shark-900 text-white py-4 rounded-xl font-bold hover:bg-shark-800 transition-all flex items-center justify-center gap-2"
                    >
                        Okay, Got It
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
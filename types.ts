export enum ViewState {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  ADMIN = 'ADMIN',
}

export interface DiveTier {
  minDives: number;
  maxDives: number;
  pricePerDive: number;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'Hotel' | 'Guesthouse' | 'Resort' | 'Liveaboard';
  pricePerNight: number; // Base Rate
  description: string;
  imageUrl: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  percentageAdjustment: number; // e.g. 20 for +20%, -10 for -10%
}

export interface PricingSettings {
  diveTiers: DiveTier[];
  accommodations: Accommodation[];
  seasons: Season[];
  domesticFlightPrice: number; // Return trip Male-Fuvahmulah per person
  
  // Ground Transfer Configuration
  groundTransferPrice: number; 
  groundTransferType: 'PER_PERSON' | 'PER_VEHICLE';
  groundTransferCapacity: number; // Used only if PER_VEHICLE
  
  greenTaxPerNight: number; // Per person
}

export interface BookingDraft {
  checkIn: string;
  checkOut: string;
  divers: number;
  nonDivers: number;
  totalDives: number; // Total dives per person
  selectedAccommodationId: string | null;
  includeDomesticFlight: boolean;
  includeGearRental: boolean; // $30 per day flat
  
  // Guest Details
  guestName: string;
  email: string;
  whatsapp: string;
  nationality: string;
  paymentMethod: 'BANK_TRANSFER' | 'WISE' | 'CASH_USD' | 'CASH_MVR';
}

export interface BookingTotals {
  accommodationCost: number;
  diveCost: number;
  transferCost: number;
  taxCost: number;
  gearCost: number;
  grandTotal: number;
  nights: number;
  seasonalAdjustmentApplied: boolean;
}
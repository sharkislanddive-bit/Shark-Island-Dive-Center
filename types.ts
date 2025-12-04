
export enum ViewState {
  HOME = 'HOME', // Now maps to Dashboard
  BOOKING = 'BOOKING',
  ADMIN = 'ADMIN',
  GUESTS = 'GUESTS',
  OPERATIONS = 'OPERATIONS',
  SETTINGS = 'SETTINGS'
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

export interface Instructor {
  id: string;
  name: string;
  role: 'Course Director' | 'Instructor' | 'Dive Master' | 'Boat Captain';
  unavailableDates: string[]; // ISO Date strings 'YYYY-MM-DD'
  imageUrl?: string;
}

export interface PricingSettings {
  diveTiers: DiveTier[];
  accommodations: Accommodation[];
  seasons: Season[];
  instructors: Instructor[]; // New field
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

export interface Booking extends BookingDraft {
  id: string; // The Booking Ref (SID-XXXXXX)
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  grandTotal: number;
  assignedInstructorId?: string | null; // For linking to roster
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

// --- OPERATIONS SYSTEM TYPES ---

export type VIPLevel = 'V1' | 'V2' | 'V3';

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  vipLevel: VIPLevel;
  notes: string;
  bookings: string[]; // Booking IDs
  joinedDate: string;
}

export interface DailyEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'Morning Dive' | 'Tiger Zoo' | 'Afternoon Dive' | 'Night Dive' | 'Theory';
  boat: 'Shark One' | 'Shark Two' | 'Classroom';
  staffIds: string[];
  guestCount: number;
  notes: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  status: 'Active' | 'On Leave';
}

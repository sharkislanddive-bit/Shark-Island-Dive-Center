
import { PricingSettings, DiveTier, Accommodation, Season, DivePackage } from '../types';

const STORAGE_KEY = 'shark_island_settings';

const DEFAULT_SETTINGS: PricingSettings = {
  diveTiers: [
    { minDives: 1, maxDives: 5, pricePerDive: 85 },
    { minDives: 6, maxDives: 10, pricePerDive: 75 },
    { minDives: 11, maxDives: 100, pricePerDive: 65 },
  ],
  packages: [
    {
      id: 'pkg-explorer',
      name: 'Tiger Explorer 10',
      dives: 10,
      price: 750,
      description: 'Ideal for getting comfortable with the Tigers.',
      features: ['10 Guided Boat Dives', 'Tiger Harbour Guaranteed', 'Free Nitrox', 'Weights & Tank included']
    },
    {
      id: 'pkg-legend',
      name: 'Fuvahmulah Legend 20',
      dives: 20,
      price: 1300,
      description: 'The complete immersion experience.',
      features: ['20 Guided Boat Dives', 'Priority Boat Seating', 'Free Nitrox', 'Video Package Included']
    }
  ],
  accommodations: [
    {
      id: 'tiger-residence',
      name: 'Tiger Residence',
      type: 'Hotel',
      pricePerNight: 120,
      description: 'Luxury stay with pool, close to the harbor.',
      imageUrl: 'https://picsum.photos/id/164/400/300',
    },
    {
      id: 'shark-inn',
      name: 'Shark Inn Guesthouse',
      type: 'Guesthouse',
      pricePerNight: 65,
      description: 'Cozy local guesthouse with authentic island vibes.',
      imageUrl: 'https://picsum.photos/id/1040/400/300',
    }
  ],
  seasons: [
    {
      id: 'peak-season',
      name: 'Peak Season (Dec-Jan)',
      startDate: '2024-12-15',
      endDate: '2025-01-15',
      percentageAdjustment: 20
    }
  ],
  instructors: [
    {
      id: 'lonu',
      name: 'Lonu',
      role: 'Course Director',
      unavailableDates: [],
      imageUrl: 'https://ui-avatars.com/api/?name=Lonu&background=0284c7&color=fff'
    },
    {
      id: 'kai',
      name: 'Kai',
      role: 'Instructor',
      unavailableDates: [],
      imageUrl: 'https://ui-avatars.com/api/?name=Kai&background=0d9488&color=fff'
    }
  ],
  domesticFlightPrice: 360,
  groundTransferPrice: 20,
  groundTransferType: 'PER_PERSON',
  groundTransferCapacity: 4,
  greenTaxPerNight: 6,
};

export const getSettings = (): PricingSettings => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge with default to ensure new fields exist if loading old data
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      // Ensure instructors array exists if loading from older localstorage
      if (!merged.instructors) merged.instructors = DEFAULT_SETTINGS.instructors;
      // Ensure packages array exists
      if (!merged.packages) merged.packages = DEFAULT_SETTINGS.packages;
      
      return merged;
    } catch (e) {
      console.error("Failed to parse settings", e);
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: PricingSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const calculateTotals = (
  draft: import('../types').BookingDraft,
  settings: PricingSettings
): import('../types').BookingTotals => {
  const start = new Date(draft.checkIn);
  const end = new Date(draft.checkOut);
  const nights = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalGuests = draft.divers + draft.nonDivers;
  let seasonalAdjustmentApplied = false;

  // 1. Accommodation with Seasonal Logic
  let accommodationCost = 0;
  if (draft.selectedAccommodationId && nights > 0) {
    const acc = settings.accommodations.find(a => a.id === draft.selectedAccommodationId);
    if (acc) {
      const roomsNeeded = Math.ceil(totalGuests / 2); 
      
      let nightlyTotal = 0;
      const currentDate = new Date(start);
      
      for (let i = 0; i < nights; i++) {
        let rate = acc.pricePerNight;
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Find applicable season
        const season = settings.seasons?.find(s => dateStr >= s.startDate && dateStr <= s.endDate);
        
        if (season) {
          rate = rate * (1 + season.percentageAdjustment / 100);
          seasonalAdjustmentApplied = true;
        }
        
        nightlyTotal += rate;
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      accommodationCost = nightlyTotal * roomsNeeded;
    }
  }

  // 2. Diving (Tiered)
  let divePricePerDive = settings.diveTiers[0].pricePerDive;
  const perPersonDives = draft.totalDives;

  for (const tier of settings.diveTiers) {
    if (perPersonDives >= tier.minDives && perPersonDives <= tier.maxDives) {
      divePricePerDive = tier.pricePerDive;
      break;
    }
  }
  // Fallback to cheapest if exceeds max tier
  if (settings.diveTiers.length > 0 && perPersonDives > settings.diveTiers[settings.diveTiers.length - 1].maxDives) {
      divePricePerDive = settings.diveTiers[settings.diveTiers.length - 1].pricePerDive;
  }
  
  const diveCost = (divePricePerDive * perPersonDives) * draft.divers;

  // 3. Gear (Simple flat rate calculation logic: $30 * dive days * divers)
  const estimatedDiveDays = Math.ceil(perPersonDives / 3);
  const gearCost = draft.includeGearRental ? (30 * estimatedDiveDays * draft.divers) : 0;

  // 4. Transfers
  let transferCost = 0;
  
  // Domestic Flight (Always per person)
  if (draft.includeDomesticFlight) {
    transferCost += settings.domesticFlightPrice * totalGuests;
  }
  
  // Ground Transfer (Configurable Strategy)
  if (settings.groundTransferType === 'PER_VEHICLE') {
    const vehiclesNeeded = Math.ceil(totalGuests / (settings.groundTransferCapacity || 4));
    transferCost += settings.groundTransferPrice * vehiclesNeeded;
  } else {
    // Default PER_PERSON
    transferCost += settings.groundTransferPrice * totalGuests;
  }

  // 5. Green Tax
  const taxCost = settings.greenTaxPerNight * totalGuests * nights;

  return {
    accommodationCost,
    diveCost,
    transferCost,
    taxCost,
    gearCost,
    nights,
    grandTotal: accommodationCost + diveCost + transferCost + taxCost + gearCost,
    seasonalAdjustmentApplied
  };
};

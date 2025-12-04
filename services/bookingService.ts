import { Booking, StayBreakdown } from '../types';

const BOOKING_STORAGE_KEY = 'shark_island_bookings';

export const getBookings = (): Booking[] => {
  const stored = localStorage.getItem(BOOKING_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse bookings', e);
    return [];
  }
};

export const saveBooking = (booking: Booking): void => {
  const bookings = getBookings();
  // Check if exists, update if so, else add
  const index = bookings.findIndex(b => b.id === booking.id);
  if (index >= 0) {
    bookings[index] = booking;
  } else {
    bookings.push(booking);
  }
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
};

export const getBookingById = (id: string): Booking | undefined => {
  return getBookings().find(b => b.id === id);
};

// Helper to check if a date string falls within a booking's range (Inclusive of checkout)
export const isDateInBooking = (dateStr: string, booking: Booking): boolean => {
  return dateStr >= booking.checkIn && dateStr <= booking.checkOut;
};

// Helper to check if a date is an active DIVING day (CheckIn to CheckOut - 1 day)
// Guests typically don't dive on checkout day due to flight intervals
export const isDiveDate = (dateStr: string, booking: Booking): boolean => {
  return dateStr >= booking.checkIn && dateStr < booking.checkOut;
};

export const getDetailedStayBreakdown = (booking: Booking): StayBreakdown => {
    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    // Difference in time
    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Difference in days (nights)
    const nightCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const dayCount = nightCount + 1;

    const nights: string[] = [];
    const days: string[] = [];

    // Nights array
    let current = new Date(start);
    for (let i = 0; i < nightCount; i++) {
        nights.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    // Days array
    current = new Date(start);
    for (let i = 0; i < dayCount; i++) {
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    return {
        bookingId: booking.id,
        guestName: booking.guestName,
        pax: booking.divers + booking.nonDivers,
        arrival: booking.checkIn,
        departure: booking.checkOut,
        nights,
        days,
        nightCount,
        dayCount
    };
};
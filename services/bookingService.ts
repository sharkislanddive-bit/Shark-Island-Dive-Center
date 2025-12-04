
import { Booking } from '../types';

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

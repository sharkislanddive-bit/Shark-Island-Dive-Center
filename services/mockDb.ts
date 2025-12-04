
import { GuestProfile, DailyEvent, Staff, SystemUser } from '../types';

const GUEST_KEY = 'sidc_guests';
const EVENT_KEY = 'sidc_events';
const USER_KEY = 'sidc_users';

// Initial Mock Data
const MOCK_GUESTS: GuestProfile[] = [
  {
    id: 'g1',
    name: 'Jean-Luc Picard',
    email: 'captain@enterprise.com',
    whatsapp: '+33 6 12 34 56 78',
    country: 'France',
    vipLevel: 'V3',
    notes: 'Likes Earl Grey hot. Experienced diver (1000+).',
    bookings: ['SID-992831'],
    joinedDate: '2023-01-15'
  },
  {
    id: 'g2',
    name: 'Sarah Connor',
    email: 'sarah@skynet.net',
    whatsapp: '+1 555 0199',
    country: 'USA',
    vipLevel: 'V2',
    notes: 'Photography focus. Needs extra weights.',
    bookings: [],
    joinedDate: '2024-02-10'
  }
];

const MOCK_EVENTS: DailyEvent[] = [
  {
    id: 'e1',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    title: 'Tiger Zoo Deep',
    type: 'Tiger Zoo',
    boat: 'Shark One',
    staffIds: ['lonu', 'kai'],
    guestCount: 8,
    notes: 'Check current at harbor mouth.'
  },
  {
    id: 'e2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:00',
    title: 'Plateau Drift',
    type: 'Afternoon Dive',
    boat: 'Shark Two',
    staffIds: ['kai'],
    guestCount: 4,
    notes: ''
  }
];

const MOCK_USERS: SystemUser[] = [
  {
    id: 'admin_root',
    name: 'Administrator',
    email: 'Admin', // Username 'Admin' stored in email field
    phone: '',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'u1',
    name: 'Lonu',
    email: 'lonu@sharkislanddive.com',
    phone: '+960 778 6655',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: '2024-05-20'
  },
  {
    id: 'u2',
    name: 'Reservations Team',
    email: 'bookings@sharkislanddive.com',
    phone: '+960 778 1234',
    role: 'MANAGER',
    status: 'ACTIVE',
    lastLogin: '2024-05-19'
  }
];

// --- GUESTS ---
export const getGuests = (): GuestProfile[] => {
  const stored = localStorage.getItem(GUEST_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(GUEST_KEY, JSON.stringify(MOCK_GUESTS));
  return MOCK_GUESTS;
};

export const saveGuest = (guest: GuestProfile) => {
  const guests = getGuests();
  const idx = guests.findIndex(g => g.id === guest.id);
  if (idx >= 0) guests[idx] = guest;
  else guests.push(guest);
  localStorage.setItem(GUEST_KEY, JSON.stringify(guests));
};

// --- EVENTS ---
export const getEvents = (): DailyEvent[] => {
  const stored = localStorage.getItem(EVENT_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(EVENT_KEY, JSON.stringify(MOCK_EVENTS));
  return MOCK_EVENTS;
};

export const saveEvent = (event: DailyEvent) => {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === event.id);
  if (idx >= 0) events[idx] = event;
  else events.push(event);
  localStorage.setItem(EVENT_KEY, JSON.stringify(events));
};

export const getEventsForDate = (dateStr: string): DailyEvent[] => {
  return getEvents().filter(e => e.date === dateStr);
};

// --- SYSTEM USERS ---
export const getUsers = (): SystemUser[] => {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(USER_KEY, JSON.stringify(MOCK_USERS));
  return MOCK_USERS;
};

export const saveUser = (user: SystemUser) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  localStorage.setItem(USER_KEY, JSON.stringify(users));
};

export const deleteUser = (userId: string) => {
  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USER_KEY, JSON.stringify(users));
};

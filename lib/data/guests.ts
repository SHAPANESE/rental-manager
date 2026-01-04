import { Guest } from '../types';

// Datos mock de huéspedes
export let guests: Guest[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '+54 11 1234-5678',
    documentId: '30123456',
    notes: 'Cliente frecuente',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@email.com',
    phone: '+54 11 8765-4321',
    documentId: '28987654',
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos@email.com',
    phone: '+54 11 5555-5555',
    documentId: '35111222',
  },
];

export function getGuests(): Guest[] {
  return [...guests];
}

export function getGuestById(id: string): Guest | undefined {
  return guests.find((g) => g.id === id);
}

export function addGuest(guest: Omit<Guest, 'id'>): Guest {
  const newGuest: Guest = {
    ...guest,
    id: Date.now().toString(),
  };
  guests = [...guests, newGuest];
  return newGuest;
}

export function updateGuest(id: string, data: Partial<Guest>): Guest | undefined {
  const index = guests.findIndex((g) => g.id === id);
  if (index === -1) return undefined;
  guests[index] = { ...guests[index], ...data };
  return guests[index];
}

import { Booking } from '../types';
import { addDays } from 'date-fns';

// Datos mock de reservas
export let bookings: Booking[] = [
  {
    id: '1',
    propertyId: '1',
    guestId: '1',
    checkIn: addDays(new Date(), 2),
    checkOut: addDays(new Date(), 5),
    totalPrice: 45000,
    paymentStatus: 'paid',
    status: 'confirmed',
    notes: 'Llega por la tarde',
  },
  {
    id: '2',
    propertyId: '2',
    guestId: '2',
    checkIn: addDays(new Date(), -1),
    checkOut: addDays(new Date(), 3),
    totalPrice: 60000,
    paymentStatus: 'partial',
    status: 'confirmed',
  },
  {
    id: '3',
    propertyId: '3',
    guestId: '3',
    checkIn: addDays(new Date(), 7),
    checkOut: addDays(new Date(), 10),
    totalPrice: 55000,
    paymentStatus: 'pending',
    status: 'confirmed',
  },
];

export function getBookings(): Booking[] {
  return [...bookings];
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}

export function getBookingsByProperty(propertyId: string): Booking[] {
  return bookings.filter((b) => b.propertyId === propertyId);
}

export function addBooking(booking: Omit<Booking, 'id'>): Booking {
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
  };
  bookings = [...bookings, newBooking];
  return newBooking;
}

export function updateBooking(id: string, data: Partial<Booking>): Booking | undefined {
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  bookings[index] = { ...bookings[index], ...data };
  return bookings[index];
}

export function deleteBooking(id: string): boolean {
  const initialLength = bookings.length;
  bookings = bookings.filter((b) => b.id !== id);
  return bookings.length < initialLength;
}

// Verificar solapamiento de fechas
export function hasOverlap(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): boolean {
  return bookings.some((booking) => {
    if (booking.propertyId !== propertyId) return false;
    if (excludeBookingId && booking.id === excludeBookingId) return false;
    if (booking.status === 'cancelled') return false;

    // Hay solapamiento si el nuevo check-in es antes del check-out existente
    // Y el nuevo check-out es después del check-in existente
    return checkIn < booking.checkOut && checkOut > booking.checkIn;
  });
}

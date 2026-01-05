// Propiedad de alquiler
export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  color: string;
}

// Huésped
export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentId: string;
  notes?: string;
}

// Estado de pago
export type PaymentStatus = 'pending' | 'partial' | 'paid';

// Estado de reserva
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

// Reserva
export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  arrivalTime?: string;
  totalPrice: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes?: string;
}

// Evento para el calendario (extiende Booking con datos relacionados)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  booking: Booking;
  guest: Guest;
  property: Property;
}

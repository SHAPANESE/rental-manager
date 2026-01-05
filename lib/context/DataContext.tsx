'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useProperties, useGuests, useBookings } from '../hooks/useSupabase';
import { Property, Guest, Booking } from '../types';

interface DataContextType {
  properties: Property[];
  guests: Guest[];
  bookings: Booking[];
  loading: boolean;
  addGuest: (guest: Omit<Guest, 'id'>) => Promise<Guest | null>;
  updateGuest: (id: string, updates: Partial<Guest>) => Promise<boolean>;
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<Booking | null>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<boolean>;
  deleteBooking: (id: string) => Promise<boolean>;
  hasOverlap: (propertyId: string, checkIn: Date, checkOut: Date, excludeId?: string) => boolean;
  refetchBookings: () => Promise<void>;
  refetchGuests: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { properties, loading: loadingProps } = useProperties();
  const { guests, loading: loadingGuests, addGuest, updateGuest, refetch: refetchGuests } = useGuests();
  const {
    bookings,
    loading: loadingBookings,
    addBooking,
    updateBooking,
    deleteBooking,
    hasOverlap,
    refetch: refetchBookings,
  } = useBookings();

  const loading = loadingProps || loadingGuests || loadingBookings;

  return (
    <DataContext.Provider
      value={{
        properties,
        guests,
        bookings,
        loading,
        addGuest,
        updateGuest,
        addBooking,
        updateBooking,
        deleteBooking,
        hasOverlap,
        refetchBookings,
        refetchGuests,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

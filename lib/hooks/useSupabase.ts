'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, DbProperty, DbGuest, DbBooking } from '../supabase';
import { Property, Guest, Booking } from '../types';
import { properties as mockProperties } from '../data/properties';
import { bookings as mockBookingsData, addBooking as addMockBooking, updateBooking as updateMockBooking } from '../data/bookings';
import { guests as mockGuestsData, addGuest as addMockGuest } from '../data/guests';

// Parse date string as local timezone (not UTC) to avoid day shift
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format date as local timezone string (not UTC) to avoid day shift
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convertir de DB a tipos de la app
function dbToProperty(db: DbProperty): Property {
  return {
    id: db.id,
    name: db.name,
    address: db.address,
    description: db.description,
    imageUrl: db.image_url,
    color: db.color,
  };
}

function dbToGuest(db: DbGuest): Guest {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    phone: db.phone,
    documentId: db.document_id,
    notes: db.notes,
  };
}

function dbToBooking(db: DbBooking): Booking {
  return {
    id: db.id,
    propertyId: db.property_id,
    guestId: db.guest_id,
    checkIn: parseLocalDate(db.check_in),
    checkOut: parseLocalDate(db.check_out),
    arrivalTime: db.arrival_time,
    totalPrice: db.total_price,
    paidAmount: db.paid_amount ?? 0,
    paymentStatus: db.payment_status,
    status: db.status,
    notes: db.notes,
  };
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('properties').select('*').order('name');
        if (data) setProperties(data.map(dbToProperty));
      } else {
        // Usar datos mock
        setProperties(mockProperties);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  return { properties, loading };
}

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('guests').select('*').order('name');
      if (data) setGuests(data.map(dbToGuest));
    } else {
      setGuests([...mockGuestsData]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const addGuest = async (guest: Omit<Guest, 'id'>): Promise<Guest | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('guests')
        .insert({
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          document_id: guest.documentId,
          notes: guest.notes || '',
        })
        .select()
        .single();

      if (data) {
        const newGuest = dbToGuest(data);
        setGuests((prev) => [...prev, newGuest]);
        return newGuest;
      }
      return null;
    } else {
      // Mock: crear guest localmente
      const newGuest = addMockGuest(guest);
      setGuests((prev) => [...prev, newGuest]);
      return newGuest;
    }
  };

  const updateGuest = async (id: string, updates: Partial<Guest>): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.documentId !== undefined) dbUpdates.document_id = updates.documentId;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('guests')
        .update(dbUpdates)
        .eq('id', id);

      if (!error) {
        setGuests((prev) =>
          prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
        );
        return true;
      }
      return false;
    } else {
      // Mock: update guest locally
      setGuests((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
      return true;
    }
  };

  const deleteGuest = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (!error) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        return true;
      }
      return false;
    } else {
      setGuests((prev) => prev.filter((g) => g.id !== id));
      return true;
    }
  };

  return { guests, loading, addGuest, updateGuest, deleteGuest, refetch: fetchGuests };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('bookings').select('*').order('check_in');
      if (data) setBookings(data.map(dbToBooking));
    } else {
      setBookings([...mockBookingsData]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = async (booking: Omit<Booking, 'id'>): Promise<Booking | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          property_id: booking.propertyId,
          guest_id: booking.guestId,
          check_in: formatLocalDate(booking.checkIn),
          check_out: formatLocalDate(booking.checkOut),
          arrival_time: booking.arrivalTime || null,
          total_price: booking.totalPrice,
          paid_amount: booking.paidAmount || 0,
          payment_status: booking.paymentStatus,
          status: booking.status,
          notes: booking.notes || '',
        })
        .select()
        .single();

      if (data) {
        const newBooking = dbToBooking(data);
        setBookings((prev) => [...prev, newBooking]);
        return newBooking;
      }
      return null;
    } else {
      // Mock: crear booking localmente
      const newBooking = addMockBooking(booking);
      setBookings((prev) => [...prev, newBooking]);
      return newBooking;
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.propertyId) dbUpdates.property_id = updates.propertyId;
      if (updates.guestId) dbUpdates.guest_id = updates.guestId;
      if (updates.checkIn) dbUpdates.check_in = formatLocalDate(updates.checkIn);
      if (updates.checkOut) dbUpdates.check_out = formatLocalDate(updates.checkOut);
      if (updates.arrivalTime !== undefined) dbUpdates.arrival_time = updates.arrivalTime;
      if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
      if (updates.paidAmount !== undefined) dbUpdates.paid_amount = updates.paidAmount;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);

      if (!error) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
        );
        return true;
      }
      return false;
    } else {
      // Mock: actualizar localmente
      updateMockBooking(id, updates);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
      return true;
    }
  };

  const deleteBooking = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (!error) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        return true;
      }
      return false;
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      return true;
    }
  };

  const hasOverlap = (
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
    excludeId?: string
  ): boolean => {
    return bookings.some((b) => {
      if (b.propertyId !== propertyId) return false;
      if (excludeId && b.id === excludeId) return false;
      if (b.status === 'cancelled') return false;
      return checkIn < b.checkOut && checkOut > b.checkIn;
    });
  };

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    hasOverlap,
    refetch: fetchBookings,
  };
}

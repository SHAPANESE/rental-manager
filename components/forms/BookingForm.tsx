'use client';

import { useState, FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';
import { Booking, Guest, PaymentStatus, BookingStatus } from '@/lib/types';
import { properties } from '@/lib/data/properties';
import { getGuests, addGuest } from '@/lib/data/guests';
import { hasOverlap } from '@/lib/data/bookings';

interface BookingFormProps {
  initialData?: Partial<Booking> & { start?: Date; end?: Date; resourceId?: string };
  onSubmit: (booking: Omit<Booking, 'id'>, guest: Omit<Guest, 'id'> | string) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export default function BookingForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: BookingFormProps) {
  const guests = getGuests();

  const [propertyId, setPropertyId] = useState(
    initialData?.propertyId ?? initialData?.resourceId ?? '1'
  );
  const [checkIn, setCheckIn] = useState(
    initialData?.checkIn ?? initialData?.start ?? new Date()
  );
  const [checkOut, setCheckOut] = useState(
    initialData?.checkOut ?? initialData?.end ?? new Date()
  );
  const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice ?? 0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initialData?.paymentStatus ?? 'pending'
  );
  const [status, setStatus] = useState<BookingStatus>(
    initialData?.status ?? 'confirmed'
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  // Guest selection or new guest
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  const [selectedGuestId, setSelectedGuestId] = useState(
    initialData?.guestId ?? guests[0]?.id ?? ''
  );
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestDocument, setNewGuestDocument] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar solapamiento
    if (hasOverlap(propertyId, checkIn, checkOut, mode === 'edit' ? initialData?.id : undefined)) {
      setError('Ya existe una reserva en esas fechas para esta propiedad');
      return;
    }

    if (checkIn >= checkOut) {
      setError('La fecha de check-out debe ser posterior al check-in');
      return;
    }

    const bookingData: Omit<Booking, 'id'> = {
      propertyId,
      guestId: guestMode === 'existing' ? selectedGuestId : '',
      checkIn,
      checkOut,
      totalPrice,
      paymentStatus,
      status,
      notes,
    };

    if (guestMode === 'new') {
      if (!newGuestName.trim()) {
        setError('El nombre del huésped es requerido');
        return;
      }
      const newGuest: Omit<Guest, 'id'> = {
        name: newGuestName,
        email: newGuestEmail,
        phone: newGuestPhone,
        documentId: newGuestDocument,
      };
      onSubmit(bookingData, newGuest);
    } else {
      onSubmit(bookingData, selectedGuestId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Propiedad
        </label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={format(checkIn, 'yyyy-MM-dd')}
            onChange={(e) => {
              const date = parseISO(e.target.value);
              setCheckIn(date);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={format(checkOut, 'yyyy-MM-dd')}
            onChange={(e) => {
              const date = parseISO(e.target.value);
              setCheckOut(date);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Guest Selection */}
      <div className="border-t pt-4">
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={guestMode === 'existing'}
              onChange={() => setGuestMode('existing')}
              className="text-blue-600"
            />
            <span className="text-sm">Huésped existente</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={guestMode === 'new'}
              onChange={() => setGuestMode('new')}
              className="text-blue-600"
            />
            <span className="text-sm">Nuevo huésped</span>
          </label>
        </div>

        {guestMode === 'existing' ? (
          <select
            value={selectedGuestId}
            onChange={(e) => setSelectedGuestId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} - {g.phone}
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre *"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={newGuestPhone}
                onChange={(e) => setNewGuestPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <input
              type="text"
              placeholder="Documento (DNI)"
              value={newGuestDocument}
              onChange={(e) => setNewGuestDocument(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Price and Status */}
      <div className="border-t pt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio total ($)
          </label>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de pago
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pendiente</option>
            <option value="partial">Parcial</option>
            <option value="paid">Pagado</option>
          </select>
        </div>
      </div>

      {/* Booking Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado de la reserva
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="confirmed">Confirmada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {mode === 'create' ? 'Crear Reserva' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}

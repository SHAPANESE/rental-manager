'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import BookingCalendar from '@/components/calendar/BookingCalendar';
import BookingDetails from '@/components/BookingDetails';
import BookingForm from '@/components/forms/BookingForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { CalendarEvent, Booking, Guest } from '@/lib/types';
import { useData } from '@/lib/context/DataContext';

type ModalState =
  | { type: 'none' }
  | { type: 'details'; event: CalendarEvent }
  | { type: 'create'; initialData?: { start: Date; end: Date; resourceId?: string } }
  | { type: 'edit'; event: CalendarEvent };

export default function HomePage() {
  const {
    properties,
    guests,
    bookings,
    loading,
    addGuest,
    addBooking,
    updateBooking,
    hasOverlap,
  } = useData();

  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  // Construir eventos para el calendario
  const events: CalendarEvent[] = useMemo(() => {
    return bookings
      .filter((b) => b.status !== 'cancelled')
      .map((booking) => {
        const guest = guests.find((g) => g.id === booking.guestId);
        const property = properties.find((p) => p.id === booking.propertyId);

        return {
          id: booking.id,
          title: guest?.name ?? 'Huésped',
          start: new Date(booking.checkIn),
          end: new Date(booking.checkOut),
          resourceId: booking.propertyId,
          booking,
          guest: guest!,
          property: property!,
        };
      });
  }, [bookings, guests, properties]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setModalState({ type: 'details', event });
  }, []);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: string }) => {
      setModalState({
        type: 'create',
        initialData: slotInfo,
      });
    },
    []
  );

  const handleCloseModal = () => setModalState({ type: 'none' });

  const handleCreateBooking = async (
    bookingData: Omit<Booking, 'id'>,
    guestData: Omit<Guest, 'id'> | string
  ) => {
    let guestId: string;

    if (typeof guestData === 'string') {
      guestId = guestData;
    } else {
      const newGuest = await addGuest(guestData);
      if (!newGuest) return;
      guestId = newGuest.id;
    }

    await addBooking({ ...bookingData, guestId });
    handleCloseModal();
  };

  const handleEditBooking = async (
    bookingData: Omit<Booking, 'id'>,
    guestData: Omit<Guest, 'id'> | string
  ) => {
    if (modalState.type !== 'edit') return;

    let guestId: string;

    if (typeof guestData === 'string') {
      guestId = guestData;
    } else {
      const newGuest = await addGuest(guestData);
      if (!newGuest) return;
      guestId = newGuest.id;
    }

    await updateBooking(modalState.event.booking.id, { ...bookingData, guestId });
    handleCloseModal();
  };

  const handleCancelBooking = async () => {
    if (modalState.type !== 'details') return;
    await updateBooking(modalState.event.booking.id, { status: 'cancelled' });
    handleCloseModal();
  };

  const handleEditClick = () => {
    if (modalState.type !== 'details') return;
    setModalState({ type: 'edit', event: modalState.event });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendario de Reservas</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Click en una fecha para crear una reserva
          </p>
        </div>
        <Button onClick={() => setModalState({ type: 'create' })} className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          Nueva Reserva
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 overflow-visible">
        <BookingCalendar
          events={events}
          properties={properties}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {/* Modal de Detalles */}
      <Modal
        isOpen={modalState.type === 'details'}
        onClose={handleCloseModal}
        title="Detalles de Reserva"
      >
        {modalState.type === 'details' && (
          <BookingDetails
            event={modalState.event}
            onEdit={handleEditClick}
            onCancel={handleCancelBooking}
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      {/* Modal de Crear */}
      <Modal
        isOpen={modalState.type === 'create'}
        onClose={handleCloseModal}
        title="Nueva Reserva"
        size="lg"
      >
        {modalState.type === 'create' && (
          <BookingForm
            initialData={modalState.initialData}
            properties={properties}
            guests={guests}
            hasOverlap={hasOverlap}
            onSubmit={handleCreateBooking}
            onCancel={handleCloseModal}
            mode="create"
          />
        )}
      </Modal>

      {/* Modal de Editar */}
      <Modal
        isOpen={modalState.type === 'edit'}
        onClose={handleCloseModal}
        title="Editar Reserva"
        size="lg"
      >
        {modalState.type === 'edit' && (
          <BookingForm
            initialData={modalState.event.booking}
            properties={properties}
            guests={guests}
            hasOverlap={hasOverlap}
            onSubmit={handleEditBooking}
            onCancel={handleCloseModal}
            mode="edit"
          />
        )}
      </Modal>
    </div>
  );
}

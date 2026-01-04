'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import BookingCalendar from '@/components/calendar/BookingCalendar';
import BookingDetails from '@/components/BookingDetails';
import BookingForm from '@/components/forms/BookingForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { CalendarEvent, Booking, Guest } from '@/lib/types';
import { addBooking, updateBooking } from '@/lib/data/bookings';
import { addGuest } from '@/lib/data/guests';

type ModalState =
  | { type: 'none' }
  | { type: 'details'; event: CalendarEvent }
  | { type: 'create'; initialData?: { start: Date; end: Date; resourceId?: string } }
  | { type: 'edit'; event: CalendarEvent };

export default function HomePage() {
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

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

  const handleCreateBooking = (
    bookingData: Omit<Booking, 'id'>,
    guestData: Omit<Guest, 'id'> | string
  ) => {
    let guestId: string;

    if (typeof guestData === 'string') {
      guestId = guestData;
    } else {
      const newGuest = addGuest(guestData);
      guestId = newGuest.id;
    }

    addBooking({ ...bookingData, guestId });
    handleCloseModal();
    refresh();
  };

  const handleEditBooking = (
    bookingData: Omit<Booking, 'id'>,
    guestData: Omit<Guest, 'id'> | string
  ) => {
    if (modalState.type !== 'edit') return;

    let guestId: string;

    if (typeof guestData === 'string') {
      guestId = guestData;
    } else {
      const newGuest = addGuest(guestData);
      guestId = newGuest.id;
    }

    updateBooking(modalState.event.booking.id, { ...bookingData, guestId });
    handleCloseModal();
    refresh();
  };

  const handleCancelBooking = () => {
    if (modalState.type !== 'details') return;

    updateBooking(modalState.event.booking.id, { status: 'cancelled' });
    handleCloseModal();
    refresh();
  };

  const handleEditClick = () => {
    if (modalState.type !== 'details') return;
    setModalState({ type: 'edit', event: modalState.event });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Reservas</h1>
          <p className="text-gray-500 mt-1">
            Click en una fecha para crear una reserva
          </p>
        </div>
        <Button onClick={() => setModalState({ type: 'create' })}>
          <Plus size={18} className="mr-2" />
          Nueva Reserva
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <BookingCalendar
          key={refreshKey}
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
            onSubmit={handleEditBooking}
            onCancel={handleCloseModal}
            mode="edit"
          />
        )}
      </Modal>
    </div>
  );
}

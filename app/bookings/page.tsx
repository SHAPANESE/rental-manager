'use client';

import { useMemo, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import BookingDetails from '@/components/BookingDetails';
import BookingForm from '@/components/forms/BookingForm';
import { Calendar, User, Loader2 } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { Booking, Guest, CalendarEvent } from '@/lib/types';

const paymentStatusLabels = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  partial: { label: 'Parcial', color: 'bg-orange-100 text-orange-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
};

const bookingStatusLabels = {
  confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800' },
};

type ModalState =
  | { type: 'none' }
  | { type: 'details'; event: CalendarEvent }
  | { type: 'edit'; event: CalendarEvent };

export default function BookingsPage() {
  const { properties, guests, bookings: rawBookings, loading, addGuest, updateBooking, hasOverlap } = useData();
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  const bookings = useMemo(() => {
    return rawBookings
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
      .map((booking) => ({
        ...booking,
        guest: guests.find((g) => g.id === booking.guestId),
        property: properties.find((p) => p.id === booking.propertyId),
      }));
  }, [rawBookings, guests, properties]);

  const handleBookingClick = useCallback((booking: typeof bookings[0]) => {
    const event: CalendarEvent = {
      id: booking.id,
      title: booking.guest?.name ?? 'Huésped',
      start: new Date(booking.checkIn),
      end: new Date(booking.checkOut),
      resourceId: booking.propertyId,
      booking: booking,
      guest: booking.guest!,
      property: booking.property!,
    };
    setModalState({ type: 'details', event });
  }, []);

  const handleCloseModal = () => setModalState({ type: 'none' });

  const handleEditClick = () => {
    if (modalState.type !== 'details') return;
    setModalState({ type: 'edit', event: modalState.event });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.checkOut) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.checkOut) < new Date()
  );
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reservas</h1>

      {/* Próximas reservas */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Próximas Reservas ({upcomingBookings.length})
        </h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500">No hay reservas próximas</p>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Card
                key={booking.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBookingClick(booking)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: booking.property?.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {booking.property?.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              bookingStatusLabels[booking.status].color
                            }`}
                          >
                            {bookingStatusLabels[booking.status].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {format(new Date(booking.checkIn), 'd MMM', { locale: es })} -{' '}
                            {format(new Date(booking.checkOut), 'd MMM', { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {booking.guest?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          paymentStatusLabels[booking.paymentStatus].color
                        }`}
                      >
                        {paymentStatusLabels[booking.paymentStatus].label}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Reservas pasadas */}
      {pastBookings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-500 mb-4">
            Reservas Pasadas ({pastBookings.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleBookingClick(booking)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: booking.property?.color }}
                  />
                  <span className="text-gray-700">{booking.property?.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 text-sm">{booking.guest?.name}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  {format(new Date(booking.checkIn), 'd MMM yyyy', { locale: es })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Canceladas */}
      {cancelledBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-400 mb-4">
            Canceladas ({cancelledBookings.length})
          </h2>
          <div className="space-y-2 opacity-40">
            {cancelledBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg line-through cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleBookingClick(booking)}
              >
                <span className="text-gray-500">
                  {booking.property?.name} - {booking.guest?.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

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

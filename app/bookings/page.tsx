'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getBookings } from '@/lib/data/bookings';
import { getGuestById } from '@/lib/data/guests';
import { getPropertyById } from '@/lib/data/properties';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { Calendar, User, CreditCard } from 'lucide-react';

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

export default function BookingsPage() {
  const bookings = useMemo(() => {
    return getBookings()
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
      .map((booking) => ({
        ...booking,
        guest: getGuestById(booking.guestId),
        property: getPropertyById(booking.propertyId),
      }));
  }, []);

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
              <Card key={booking.id}>
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
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
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
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg line-through"
              >
                <span className="text-gray-500">
                  {booking.property?.name} - {booking.guest?.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import BookingForm from '@/components/forms/BookingForm';
import { Home, MapPin, Loader2, ChevronDown, ChevronUp, Calendar, User, CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval, startOfDay, addDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Booking, Guest, Property } from '@/lib/types';

// Mini calendar component for availability with booking capability
function AvailabilityCalendar({
  propertyBookings,
  propertyColor,
  propertyId,
  onDateClick
}: {
  propertyBookings: Booking[];
  propertyColor: string;
  propertyId: string;
  onDateClick: (date: Date, propertyId: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDay = monthStart.getDay();

  const isDateBooked = (date: Date) => {
    return propertyBookings.some((booking) => {
      if (booking.status === 'cancelled') return false;
      const checkIn = startOfDay(new Date(booking.checkIn));
      const checkOut = startOfDay(new Date(booking.checkOut));
      return isWithinInterval(startOfDay(date), { start: checkIn, end: checkOut });
    });
  };

  const isPastDate = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <div key={day} className="text-xs text-gray-500 font-medium py-1">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const booked = isDateBooked(day);
          const isToday = isSameDay(day, new Date());
          const past = isPastDate(day);
          const canBook = !booked && !past;

          return (
            <button
              key={day.toISOString()}
              onClick={() => canBook && onDateClick(day, propertyId)}
              disabled={!canBook}
              className={`aspect-square flex items-center justify-center text-xs rounded-full transition-all ${
                booked
                  ? 'text-white cursor-not-allowed'
                  : past
                  ? 'text-gray-300 cursor-not-allowed'
                  : isToday
                  ? 'bg-blue-100 text-blue-800 font-bold hover:bg-blue-200 cursor-pointer'
                  : 'text-gray-700 hover:bg-green-100 hover:text-green-700 cursor-pointer'
              }`}
              style={booked ? { backgroundColor: propertyColor } : {}}
              title={booked ? 'Ocupado' : past ? 'Fecha pasada' : 'Click para reservar'}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: propertyColor }} />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <Plus size={12} className="text-green-600" />
          <span>Click = Reservar</span>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const { properties, bookings, guests, loading, addGuest, addBooking, hasOverlap } = useData();
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [showAvailability, setShowAvailability] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    propertyId: string;
    startDate: Date;
  } | null>(null);

  const getGuestName = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest?.name || 'Huésped desconocido';
  };

  const toggleExpand = (propertyId: string) => {
    setExpandedProperty(expandedProperty === propertyId ? null : propertyId);
  };

  const toggleAvailability = (propertyId: string) => {
    setShowAvailability(showAvailability === propertyId ? null : propertyId);
  };

  const handleDateClick = (date: Date, propertyId: string) => {
    setBookingModal({
      isOpen: true,
      propertyId,
      startDate: date,
    });
  };

  const handleCloseModal = () => {
    setBookingModal(null);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedProperty = bookingModal
    ? properties.find((p) => p.id === bookingModal.propertyId)
    : null;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Mis Propiedades</h1>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const propertyBookings = bookings.filter((b) => b.propertyId === property.id);
          const activeBookings = propertyBookings.filter(
            (b) => b.status === 'confirmed' && new Date(b.checkOut) > new Date()
          );

          return (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: property.color + '20' }}
                  >
                    <Home size={20} style={{ color: property.color }} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 truncate">{property.name}</h2>
                    {property.address && (
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="truncate">{property.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {property.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                )}
                <div className="flex items-center justify-between py-3 border-t border-b">
                  <div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {activeBookings.length}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm ml-1">
                      activa{activeBookings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: property.color }}
                  >
                    {activeBookings.length > 0 ? 'Ocupada' : 'Disponible'}
                  </div>
                </div>

                {/* Bookings List */}
                {propertyBookings.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleExpand(property.id)}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                    >
                      <span>Ver reservas ({propertyBookings.length})</span>
                      {expandedProperty === property.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {expandedProperty === property.id && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {propertyBookings
                          .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className={`p-2 sm:p-3 rounded-lg text-sm ${
                                booking.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-500'
                                  : booking.status === 'completed'
                                  ? 'bg-green-50 text-green-800'
                                  : 'bg-blue-50 text-blue-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
                                <User size={14} className="flex-shrink-0" />
                                <span className="truncate">{getGuestName(booking.guestId)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                                <Calendar size={12} className="flex-shrink-0" />
                                {format(booking.checkIn, 'dd MMM', { locale: es })} - {format(booking.checkOut, 'dd MMM', { locale: es })}
                              </div>
                              {booking.status === 'cancelled' && (
                                <span className="text-xs text-red-500 mt-1 block">Cancelada</span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Availability Calendar */}
                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={() => toggleAvailability(property.id)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      Disponibilidad
                    </span>
                    {showAvailability === property.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {showAvailability === property.id && (
                    <AvailabilityCalendar
                      propertyBookings={propertyBookings}
                      propertyColor={property.color}
                      propertyId={property.id}
                      onDateClick={handleDateClick}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={!!bookingModal?.isOpen}
        onClose={handleCloseModal}
        title={`Nueva Reserva - ${selectedProperty?.name || ''}`}
        size="lg"
      >
        {bookingModal && (
          <BookingForm
            initialData={{
              propertyId: bookingModal.propertyId,
              start: bookingModal.startDate,
              end: addDays(bookingModal.startDate, 1),
            }}
            properties={properties}
            guests={guests}
            hasOverlap={hasOverlap}
            onSubmit={handleCreateBooking}
            onCancel={handleCloseModal}
            mode="create"
          />
        )}
      </Modal>
    </div>
  );
}

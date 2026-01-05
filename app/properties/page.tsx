'use client';

import { useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { Home, MapPin, Loader2, ChevronDown, ChevronUp, Calendar, User, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Booking } from '@/lib/types';

// Mini calendar component for availability
function AvailabilityCalendar({
  propertyBookings,
  propertyColor
}: {
  propertyBookings: Booking[];
  propertyColor: string;
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

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square flex items-center justify-center text-xs rounded-full ${
                booked
                  ? 'text-white'
                  : isToday
                  ? 'bg-blue-100 text-blue-800 font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={booked ? { backgroundColor: propertyColor } : {}}
              title={booked ? 'Ocupado' : 'Disponible'}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: propertyColor }} />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <span>Disponible</span>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const { properties, bookings, guests, loading } = useData();
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [showAvailability, setShowAvailability] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Propiedades</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: property.color + '20' }}
                  >
                    <Home size={20} style={{ color: property.color }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{property.name}</h2>
                    {property.address && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {property.address}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{property.description}</p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {activeBookings.length}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      reserva{activeBookings.length !== 1 ? 's' : ''} activa{activeBookings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: property.color }}
                  >
                    {activeBookings.length > 0 ? 'Ocupada' : 'Disponible'}
                  </div>
                </div>

                {/* Bookings List */}
                {propertyBookings.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => toggleExpand(property.id)}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <span>Ver reservas ({propertyBookings.length})</span>
                      {expandedProperty === property.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {expandedProperty === property.id && (
                      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                        {propertyBookings
                          .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className={`p-3 rounded-lg text-sm ${
                                booking.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-500'
                                  : booking.status === 'completed'
                                  ? 'bg-green-50 text-green-800'
                                  : 'bg-blue-50 text-blue-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-medium">
                                <User size={14} />
                                {getGuestName(booking.guestId)}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                                <Calendar size={12} />
                                {format(booking.checkIn, 'dd MMM', { locale: es })} - {format(booking.checkOut, 'dd MMM yyyy', { locale: es })}
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
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => toggleAvailability(property.id)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      Ver disponibilidad
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
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

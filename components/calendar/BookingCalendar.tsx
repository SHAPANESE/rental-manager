'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, NavigateAction, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { CalendarEvent } from '@/lib/types';
import { properties, getPropertyById } from '@/lib/data/properties';
import { getBookings } from '@/lib/data/bookings';
import { getGuestById } from '@/lib/data/guests';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface BookingCalendarProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date; resourceId?: string }) => void;
}

export default function BookingCalendar({
  onSelectEvent,
  onSelectSlot,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const handleNavigate = useCallback((newDate: Date, view: View, action: NavigateAction) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const events: CalendarEvent[] = useMemo(() => {
    const bookings = getBookings();
    return bookings
      .filter((b) => b.status !== 'cancelled')
      .map((booking) => {
        const guest = getGuestById(booking.guestId);
        const property = getPropertyById(booking.propertyId);

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
  }, []);

  const resources = useMemo(
    () =>
      properties.map((p) => ({
        id: p.id,
        title: p.name,
        color: p.color,
      })),
    []
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const property = event.property;
    return {
      style: {
        backgroundColor: property?.color ?? '#6B7280',
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
        padding: '2px 6px',
      },
    };
  }, []);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: string | number }) => {
      onSelectSlot({
        start: slotInfo.start,
        end: slotInfo.end,
        resourceId: slotInfo.resourceId?.toString(),
      });
    },
    [onSelectSlot]
  );

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <Calendar
        localizer={localizer}
        events={events}
        resources={resources}
        resourceIdAccessor="id"
        resourceTitleAccessor="title"
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={currentView}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        selectable
        onSelectEvent={onSelectEvent}
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventStyleGetter}
        messages={{
          today: 'Hoy',
          previous: 'Anterior',
          next: 'Siguiente',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          date: 'Fecha',
          time: 'Hora',
          event: 'Reserva',
          noEventsInRange: 'No hay reservas en este período',
        }}
        formats={{
          monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: es }),
          weekdayFormat: (date: Date) => format(date, 'EEE', { locale: es }),
          dayHeaderFormat: (date: Date) => format(date, 'EEEE dd/MM', { locale: es }),
        }}
      />
    </div>
  );
}

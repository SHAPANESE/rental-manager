'use client';

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, NavigateAction, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { CalendarEvent, Property } from '@/lib/types';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface BookingCalendarProps {
  events: CalendarEvent[];
  properties: Property[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date; resourceId?: string }) => void;
}

export default function BookingCalendar({
  events,
  properties,
  onSelectEvent,
  onSelectSlot,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const resources = properties.map((p) => ({
    id: p.id,
    title: p.name,
    color: p.color,
  }));

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

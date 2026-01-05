'use client';

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
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

// Custom event component for better visibility
function CustomEvent({ event }: { event: CalendarEvent }) {
  return (
    <div className="truncate text-xs sm:text-sm font-medium">
      <span className="hidden sm:inline">{event.property?.name}: </span>
      {event.title}
    </div>
  );
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

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const property = event.property;
    return {
      style: {
        backgroundColor: property?.color ?? '#6B7280',
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
        padding: '4px 8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
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

  // Legend component
  const PropertyLegend = () => (
    <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600 font-medium">Propiedades:</span>
      {properties.map((p) => (
        <div key={p.id} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-sm text-gray-700">{p.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <PropertyLegend />
      <div className="h-[calc(100vh-320px)] sm:h-[calc(100vh-240px)] min-h-[400px] sm:min-h-[500px] booking-calendar">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          allDayAccessor={() => true}
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          selectable
          onSelectEvent={onSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent,
          }}
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
            allDay: 'Reservas',
          }}
          formats={{
            monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: es }),
            weekdayFormat: (date: Date) => format(date, 'EEE', { locale: es }),
            dayHeaderFormat: (date: Date) => format(date, 'EEEE dd/MM', { locale: es }),
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM yyyy', { locale: es })}`,
          }}
        />
      </div>
      <style jsx global>{`
        /* Hide time gutter in week/day views */
        .booking-calendar .rbc-time-gutter,
        .booking-calendar .rbc-time-slot,
        .booking-calendar .rbc-timeslot-group {
          display: none !important;
        }

        /* Make week/day view show only all-day section */
        .booking-calendar .rbc-time-content {
          display: none !important;
        }

        /* Expand all-day section */
        .booking-calendar .rbc-allday-cell {
          min-height: 150px !important;
          max-height: none !important;
        }

        /* Better event display */
        .booking-calendar .rbc-event {
          min-height: 24px !important;
        }

        /* Month view - better cell height */
        .booking-calendar .rbc-month-row {
          min-height: 100px;
        }

        /* Better row display */
        .booking-calendar .rbc-row-segment {
          padding: 2px 4px;
        }

        /* Today highlight */
        .booking-calendar .rbc-today {
          background-color: #EFF6FF !important;
        }

        /* Header styling */
        .booking-calendar .rbc-header {
          padding: 8px 4px;
          font-weight: 600;
          color: #374151;
        }
      `}</style>
    </div>
  );
}

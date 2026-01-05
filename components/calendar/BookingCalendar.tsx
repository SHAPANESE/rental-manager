'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { CalendarEvent, Property } from '@/lib/types';
import { Home } from 'lucide-react';

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
function CustomEvent({ event, selectedPropertyId }: { event: CalendarEvent; selectedPropertyId: string | null }) {
  return (
    <div className="truncate text-xs font-medium px-1">
      {!selectedPropertyId && <span className="hidden sm:inline">{event.property?.name}: </span>}
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Filter events by selected property
  const filteredEvents = useMemo(() => {
    if (!selectedPropertyId) return events;
    return events.filter((e) => e.property?.id === selectedPropertyId);
  }, [events, selectedPropertyId]);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

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
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '11px',
        padding: '2px 4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
    };
  }, []);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: string | number }) => {
      onSelectSlot({
        start: slotInfo.start,
        end: slotInfo.end,
        resourceId: selectedPropertyId || slotInfo.resourceId?.toString(),
      });
    },
    [onSelectSlot, selectedPropertyId]
  );

  // Custom Event wrapper to pass selectedPropertyId
  const EventComponent = useCallback(
    ({ event }: { event: CalendarEvent }) => (
      <CustomEvent event={event} selectedPropertyId={selectedPropertyId} />
    ),
    [selectedPropertyId]
  );

  return (
    <div>
      {/* Property Filter - Mobile Friendly */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPropertyId(null)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPropertyId === null
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Home size={16} />
            <span>Todas</span>
          </button>
          {properties.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPropertyId(p.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPropertyId === p.id
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedPropertyId === p.id ? { backgroundColor: p.color } : {}}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="hidden sm:inline">{p.name}</span>
              <span className="sm:hidden">{p.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected property indicator */}
      {selectedProperty && (
        <div
          className="mb-3 p-3 rounded-lg flex items-center gap-2"
          style={{ backgroundColor: selectedProperty.color + '15' }}
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: selectedProperty.color }}
          />
          <span className="font-medium text-sm" style={{ color: selectedProperty.color }}>
            {selectedProperty.name}
          </span>
          <span className="text-xs text-gray-500">
            - {filteredEvents.length} reserva{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Hint for adding reservations */}
      <p className="text-xs text-gray-400 mb-2 text-center sm:text-left">
        Toca una fecha para crear reserva
      </p>

      <div className="h-[550px] sm:h-[650px] booking-calendar overflow-visible">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          allDayAccessor={() => true}
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          selectable
          longPressThreshold={50}
          onSelectEvent={onSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
          }}
          messages={{
            today: 'Hoy',
            previous: '<',
            next: '>',
            month: 'Mes',
            week: 'Sem',
            day: 'Día',
            date: 'Fecha',
            time: 'Hora',
            event: 'Reserva',
            noEventsInRange: 'No hay reservas',
            allDay: 'Reservas',
          }}
          formats={{
            monthHeaderFormat: (date: Date) => format(date, 'MMM yyyy', { locale: es }),
            weekdayFormat: (date: Date) => format(date, 'EEEEE', { locale: es }),
            dayHeaderFormat: (date: Date) => format(date, 'EEE dd/MM', { locale: es }),
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM', { locale: es })}`,
          }}
        />
      </div>
      <style jsx global>{`
        /* Ensure calendar is fully visible */
        .booking-calendar,
        .booking-calendar .rbc-calendar,
        .booking-calendar .rbc-month-view {
          overflow: visible !important;
        }

        /* Mobile-first calendar styles */
        .booking-calendar .rbc-toolbar {
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .booking-calendar .rbc-toolbar button {
          padding: 6px 10px;
          font-size: 13px;
        }

        .booking-calendar .rbc-btn-group {
          flex-wrap: nowrap;
        }

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
          min-height: 120px !important;
          max-height: none !important;
        }

        /* Better event display */
        .booking-calendar .rbc-event {
          min-height: 20px !important;
          padding: 1px 4px !important;
        }

        /* Month view - better cell height for mobile */
        .booking-calendar .rbc-month-row {
          min-height: 80px;
        }

        @media (min-width: 640px) {
          .booking-calendar .rbc-month-row {
            min-height: 100px;
          }
        }

        /* Better row display */
        .booking-calendar .rbc-row-segment {
          padding: 1px 2px;
        }

        /* Today highlight */
        .booking-calendar .rbc-today {
          background-color: #EFF6FF !important;
        }

        /* Header styling - compact for mobile */
        .booking-calendar .rbc-header {
          padding: 6px 2px;
          font-weight: 600;
          font-size: 11px;
          color: #374151;
        }

        @media (min-width: 640px) {
          .booking-calendar .rbc-header {
            padding: 8px 4px;
            font-size: 13px;
          }
        }

        /* Date cell number */
        .booking-calendar .rbc-date-cell {
          padding: 2px 4px;
          font-size: 12px;
        }

        /* Off-range dates more subtle */
        .booking-calendar .rbc-off-range-bg {
          background-color: #f9fafb;
        }

        /* Show more link */
        .booking-calendar .rbc-show-more {
          font-size: 11px;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
}

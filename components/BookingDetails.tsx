'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Calendar, User, Phone, Mail, FileText, CreditCard, AlertTriangle } from 'lucide-react';

interface BookingDetailsProps {
  event: CalendarEvent;
  onEdit: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const paymentStatusLabels = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  partial: { label: 'Parcial', color: 'bg-orange-100 text-orange-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
};

export default function BookingDetails({
  event,
  onEdit,
  onCancel,
  onClose,
}: BookingDetailsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { booking, guest, property } = event;
  const paymentInfo = paymentStatusLabels[booking.paymentStatus];

  return (
    <div className="space-y-6">
      {/* Property Badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium"
        style={{ backgroundColor: property.color }}
      >
        {property.name}
      </div>

      {/* Dates */}
      <div className="flex items-start gap-3">
        <Calendar className="text-gray-400 mt-0.5" size={20} />
        <div>
          <div className="font-medium text-gray-900">
            {format(new Date(booking.checkIn), "EEEE d 'de' MMMM", { locale: es })}
          </div>
          <div className="text-gray-500 text-sm">
            hasta {format(new Date(booking.checkOut), "EEEE d 'de' MMMM", { locale: es })}
          </div>
        </div>
      </div>

      {/* Guest Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <User className="text-gray-400" size={20} />
          <span className="font-medium text-gray-900">{guest?.name ?? 'Huésped'}</span>
        </div>
        {guest?.phone && (
          <div className="flex items-center gap-3">
            <Phone className="text-gray-400" size={20} />
            <a href={`tel:${guest.phone}`} className="text-blue-600 hover:underline">
              {guest.phone}
            </a>
          </div>
        )}
        {guest?.email && (
          <div className="flex items-center gap-3">
            <Mail className="text-gray-400" size={20} />
            <a href={`mailto:${guest.email}`} className="text-blue-600 hover:underline">
              {guest.email}
            </a>
          </div>
        )}
        {guest?.documentId && (
          <div className="flex items-center gap-3">
            <FileText className="text-gray-400" size={20} />
            <span className="text-gray-600">DNI: {guest.documentId}</span>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="text-gray-400" size={20} />
          <span className="text-lg font-semibold text-gray-900">
            ${booking.totalPrice.toLocaleString()}
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentInfo.color}`}>
          {paymentInfo.label}
        </span>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">{booking.notes}</p>
        </div>
      )}

      {/* Confirm Cancel */}
      {showConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-3">
            <AlertTriangle size={20} />
            <span className="font-medium">¿Cancelar esta reserva?</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onCancel();
                setShowConfirm(false);
              }}
            >
              Sí, cancelar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfirm(false)}
            >
              No
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cerrar
        </Button>
        <Button variant="ghost" onClick={onEdit}>
          Editar
        </Button>
        {booking.status !== 'cancelled' && !showConfirm && (
          <Button variant="danger" onClick={() => setShowConfirm(true)}>
            Cancelar Reserva
          </Button>
        )}
      </div>
    </div>
  );
}

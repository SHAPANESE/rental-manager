'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Calendar, User, Phone, Mail, FileText, CreditCard, AlertTriangle, MessageCircle, Pencil, Clock, DollarSign } from 'lucide-react';

interface BookingDetailsProps {
  event: CalendarEvent;
  onEdit: () => void;
  onEditGuest?: () => void;
  onRecordPayment?: () => void;
  onCancel: () => void;
  onDelete?: () => void;
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
  onEditGuest,
  onRecordPayment,
  onCancel,
  onDelete,
  onClose,
}: BookingDetailsProps) {
  const [showConfirm, setShowConfirm] = useState<'cancel' | 'delete' | null>(null);
  const { booking, guest, property } = event;
  const paymentInfo = paymentStatusLabels[booking.paymentStatus];
  const paidAmount = booking.paidAmount || 0;
  const pendingAmount = booking.totalPrice - paidAmount;

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
            {booking.arrivalTime && (
              <span className="text-blue-600 ml-2">
                <Clock size={14} className="inline mr-1" />
                {booking.arrivalTime}
              </span>
            )}
          </div>
          <div className="text-gray-500 text-sm">
            hasta {format(new Date(booking.checkOut), "EEEE d 'de' MMMM", { locale: es })}
          </div>
        </div>
      </div>

      {/* Guest Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="text-gray-400" size={20} />
            <span className="font-medium text-gray-900">{guest?.name ?? 'Huésped'}</span>
          </div>
          {onEditGuest && guest && (
            <button
              onClick={onEditGuest}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Pencil size={12} />
              Editar
            </button>
          )}
        </div>
        {guest?.phone && (
          <div className="flex items-center gap-3">
            <Phone className="text-gray-400" size={20} />
            <a href={`tel:${guest.phone}`} className="text-blue-600 hover:underline">
              {guest.phone}
            </a>
            <a
              href={`https://wa.me/${guest.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
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
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
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

        {/* Payment breakdown */}
        <div className="flex items-center justify-between text-sm border-t pt-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-green-500" />
            <span className="text-gray-600">Pagado:</span>
            <span className="font-medium text-green-600">${paidAmount.toLocaleString()}</span>
          </div>
          {pendingAmount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Pendiente:</span>
              <span className="font-medium text-orange-600">${pendingAmount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Record payment button */}
        {onRecordPayment && pendingAmount > 0 && booking.status !== 'cancelled' && (
          <button
            onClick={onRecordPayment}
            className="w-full mt-2 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign size={16} />
            Registrar Pago
          </button>
        )}
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">{booking.notes}</p>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-3">
            <AlertTriangle size={20} />
            <span className="font-medium">
              {showConfirm === 'cancel' ? '¿Cancelar esta reserva?' : '¿Eliminar esta reserva permanentemente?'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (showConfirm === 'cancel') {
                  onCancel();
                } else if (showConfirm === 'delete' && onDelete) {
                  onDelete();
                }
                setShowConfirm(null);
              }}
            >
              {showConfirm === 'cancel' ? 'Sí, cancelar' : 'Sí, eliminar'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfirm(null)}
            >
              No
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
        <Button variant="secondary" onClick={onClose} className="flex-1 order-last sm:order-first">
          Cerrar
        </Button>
        <Button variant="primary" onClick={onEdit} className="flex-1 sm:flex-none">
          Editar
        </Button>
        {booking.status !== 'cancelled' && !showConfirm && (
          <Button variant="danger" onClick={() => setShowConfirm('cancel')} className="flex-1 sm:flex-none">
            Cancelar Reserva
          </Button>
        )}
        {booking.status === 'cancelled' && onDelete && !showConfirm && (
          <Button variant="danger" onClick={() => setShowConfirm('delete')} className="flex-1 sm:flex-none">
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}

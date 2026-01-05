'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { DollarSign } from 'lucide-react';

interface PaymentFormProps {
  totalPrice: number;
  paidAmount: number;
  onSubmit: (amount: number) => Promise<void>;
  onCancel: () => void;
}

export default function PaymentForm({ totalPrice, paidAmount, onSubmit, onCancel }: PaymentFormProps) {
  const pendingAmount = totalPrice - paidAmount;
  const [amount, setAmount] = useState(pendingAmount.toString());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    setSaving(true);
    await onSubmit(paymentAmount);
    setSaving(false);
  };

  const quickAmounts = [
    { label: 'Total pendiente', value: pendingAmount },
    { label: '50%', value: totalPrice * 0.5 },
    { label: 'Seña (30%)', value: totalPrice * 0.3 },
  ].filter(q => q.value > 0 && q.value <= pendingAmount);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total reserva:</span>
          <span className="font-medium">${totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ya pagado:</span>
          <span className="font-medium text-green-600">${paidAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-gray-600">Pendiente:</span>
          <span className="font-bold text-orange-600">${pendingAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Quick amounts */}
      {quickAmounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAmount(q.value.toString())}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                parseFloat(amount) === q.value
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {q.label} (${q.value.toLocaleString()})
            </button>
          ))}
        </div>
      )}

      {/* Amount input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <DollarSign size={16} />
          Monto a registrar
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            max={pendingAmount}
            step="0.01"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Guardando...' : 'Registrar Pago'}
        </Button>
      </div>
    </form>
  );
}

'use client';

import { properties } from '@/lib/data/properties';
import { getBookingsByProperty } from '@/lib/data/bookings';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { Home, MapPin } from 'lucide-react';

export default function PropertiesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Propiedades</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const bookings = getBookingsByProperty(property.id);
          const activeBookings = bookings.filter(
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

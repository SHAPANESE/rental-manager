import { Property } from '../types';

export const properties: Property[] = [
  {
    id: '1',
    name: 'Duplex 1',
    address: '',
    description: 'Primer duplex disponible para alquiler temporal',
    imageUrl: '/duplex1.jpg',
    color: '#3B82F6', // blue-500
  },
  {
    id: '2',
    name: 'Duplex 2',
    address: '',
    description: 'Segundo duplex disponible para alquiler temporal',
    imageUrl: '/duplex2.jpg',
    color: '#22C55E', // green-500
  },
  {
    id: '3',
    name: 'Casa Fondo',
    address: '',
    description: 'Casa al fondo disponible para alquiler temporal',
    imageUrl: '/casa-fondo.jpg',
    color: '#EAB308', // yellow-500
  },
];

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getPropertyColor(id: string): string {
  return getPropertyById(id)?.color ?? '#6B7280';
}

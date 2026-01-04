'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Home, List } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Calendario', icon: Calendar },
  { href: '/properties', label: 'Propiedades', icon: Home },
  { href: '/bookings', label: 'Reservas', icon: List },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-base sm:text-xl font-bold text-gray-900">
          Mis Propiedades
        </Link>

        <div className="flex gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline text-sm sm:text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

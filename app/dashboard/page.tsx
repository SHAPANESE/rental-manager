'use client';

import { useMemo } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useData } from '@/lib/context/DataContext';
import { Loader2, TrendingUp, Home, Calendar, DollarSign, Percent, LogIn, LogOut, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, startOfDay, subMonths, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { properties, bookings, guests, loading } = useData();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Calculate occupancy for a given period
    const calculateOccupancy = (start: Date, end: Date, propertyId?: string) => {
      const days = eachDayOfInterval({ start, end });
      const totalDays = days.length * (propertyId ? 1 : properties.length);

      let occupiedDays = 0;
      days.forEach((day) => {
        const relevantBookings = bookings.filter((b) => {
          if (b.status === 'cancelled') return false;
          if (propertyId && b.propertyId !== propertyId) return false;
          const checkIn = startOfDay(new Date(b.checkIn));
          const checkOut = startOfDay(new Date(b.checkOut));
          return isWithinInterval(startOfDay(day), { start: checkIn, end: checkOut });
        });
        if (propertyId) {
          if (relevantBookings.length > 0) occupiedDays++;
        } else {
          occupiedDays += relevantBookings.length;
        }
      });

      return totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;
    };

    // Calculate revenue for a period
    const calculateRevenue = (start: Date, end: Date, propertyId?: string) => {
      return bookings
        .filter((b) => {
          if (b.status === 'cancelled') return false;
          if (propertyId && b.propertyId !== propertyId) return false;
          const checkIn = new Date(b.checkIn);
          return checkIn >= start && checkIn <= end;
        })
        .reduce((sum, b) => sum + b.totalPrice, 0);
    };

    // Total nights booked (all time)
    const totalNightsBooked = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }, 0);

    // Total revenue (all time)
    const totalRevenue = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // Current month stats
    const currentMonthOccupancy = calculateOccupancy(currentMonthStart, currentMonthEnd);
    const currentMonthRevenue = calculateRevenue(currentMonthStart, currentMonthEnd);

    // Last month stats (for comparison)
    const lastMonthOccupancy = calculateOccupancy(lastMonthStart, lastMonthEnd);
    const lastMonthRevenue = calculateRevenue(lastMonthStart, lastMonthEnd);

    // Per property stats
    const propertyStats = properties.map((property) => {
      const propertyBookings = bookings.filter((b) => b.propertyId === property.id && b.status !== 'cancelled');
      const revenue = propertyBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const nights = propertyBookings.reduce((sum, b) => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      const occupancy = calculateOccupancy(currentMonthStart, currentMonthEnd, property.id);

      return {
        ...property,
        revenue,
        nights,
        bookingsCount: propertyBookings.length,
        occupancy,
      };
    });

    // Monthly revenue for chart (last 6 months)
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const monthStart = startOfMonth(subMonths(now, 5 - i));
      const monthEnd = endOfMonth(subMonths(now, 5 - i));
      return {
        month: format(monthStart, 'MMM', { locale: es }),
        revenue: calculateRevenue(monthStart, monthEnd),
      };
    });

    // Today's check-ins and check-outs
    const today = startOfDay(new Date());
    const todayCheckIns = bookings.filter((b) =>
      b.status !== 'cancelled' && isSameDay(new Date(b.checkIn), today)
    );
    const todayCheckOuts = bookings.filter((b) =>
      b.status !== 'cancelled' && isSameDay(new Date(b.checkOut), today)
    );

    return {
      totalRevenue,
      totalNightsBooked,
      currentMonthOccupancy,
      currentMonthRevenue,
      lastMonthOccupancy,
      lastMonthRevenue,
      propertyStats,
      monthlyRevenue,
      totalBookings: bookings.filter((b) => b.status !== 'cancelled').length,
      todayCheckIns,
      todayCheckOuts,
    };
  }, [properties, bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const occupancyChange = stats.currentMonthOccupancy - stats.lastMonthOccupancy;
  const revenueChange = stats.lastMonthRevenue > 0
    ? ((stats.currentMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100
    : 0;

  // Helper to get guest name
  const getGuestName = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest?.name || 'Huésped';
  };

  // Helper to get property
  const getProperty = (propertyId: string) => {
    return properties.find((p) => p.id === propertyId);
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {/* Today's Check-ins and Check-outs */}
      {(stats.todayCheckIns.length > 0 || stats.todayCheckOuts.length > 0) && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
          {/* Check-ins Today */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <LogIn className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Llegan hoy ({stats.todayCheckIns.length})</h3>
              </div>
              {stats.todayCheckIns.length === 0 ? (
                <p className="text-sm text-gray-500">No hay llegadas hoy</p>
              ) : (
                <div className="space-y-2">
                  {stats.todayCheckIns.map((booking) => {
                    const property = getProperty(booking.propertyId);
                    return (
                      <div key={booking.id} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: property?.color }}
                        />
                        <User size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium truncate">{getGuestName(booking.guestId)}</span>
                        <span className="text-gray-400 text-xs">• {property?.name}</span>
                        {booking.arrivalTime && (
                          <span className="text-green-600 text-xs font-medium">• {booking.arrivalTime}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Check-outs Today */}
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <LogOut className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Se van hoy ({stats.todayCheckOuts.length})</h3>
              </div>
              {stats.todayCheckOuts.length === 0 ? (
                <p className="text-sm text-gray-500">No hay salidas hoy</p>
              ) : (
                <div className="space-y-2">
                  {stats.todayCheckOuts.map((booking) => {
                    const property = getProperty(booking.propertyId);
                    return (
                      <div key={booking.id} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: property?.color }}
                        />
                        <User size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium truncate">{getGuestName(booking.guestId)}</span>
                        <span className="text-gray-400 text-xs">• {property?.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                <p className="text-sm sm:text-xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500">Noches</p>
                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.totalNightsBooked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500">Ocupación</p>
                <p className="text-base sm:text-xl font-bold text-gray-900">{stats.currentMonthOccupancy.toFixed(0)}%</p>
                <p className={`text-[10px] ${occupancyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {occupancyChange >= 0 ? '+' : ''}{occupancyChange.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500">Este mes</p>
                <p className="text-sm sm:text-xl font-bold text-gray-900">${stats.currentMonthRevenue.toLocaleString()}</p>
                <p className={`text-[10px] ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Ingresos Mensuales</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-48">
            {stats.monthlyRevenue.map((month, i) => {
              const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1);
              const height = (month.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-gray-600 font-medium">
                    ${month.revenue > 1000 ? `${(month.revenue / 1000).toFixed(0)}k` : month.revenue}
                  </span>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-[10px] sm:text-xs text-gray-500 capitalize">{month.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Per Property Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rendimiento por Propiedad</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.propertyStats.map((property) => (
              <div key={property.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: property.color + '20' }}
                  >
                    <Home size={16} style={{ color: property.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{property.name}</h3>
                    <p className="text-xs text-gray-500">{property.bookingsCount} reservas</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs sm:text-base font-bold text-gray-900">${property.revenue.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Ingresos</p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-gray-900">{property.nights}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Noches</p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-gray-900">{property.occupancy.toFixed(0)}%</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Ocupación</p>
                  </div>
                </div>
                {/* Occupancy bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${property.occupancy}%`,
                        backgroundColor: property.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

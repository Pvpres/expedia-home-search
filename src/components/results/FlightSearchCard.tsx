import { useState } from 'react';
import { Plane, Clock, Luggage, Leaf, ChevronDown, ChevronUp, Wifi, Zap, Tv, AlertCircle } from 'lucide-react';
import { FlightResult, PriceBreakdown } from '../../types';
import PriceCalculator from '../../utils/PriceCalculator';

interface FlightSearchCardProps {
  flight: FlightResult;
  isMember?: boolean;
}

const calculator = new PriceCalculator();

export default function FlightSearchCard({ flight, isMember = false }: FlightSearchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const breakdown: PriceBreakdown = calculator.calculateFullPrice(flight, isMember);

  const airlineColors: Record<string, string> = {
    UA: 'bg-blue-600',
    DL: 'bg-red-600',
    AA: 'bg-sky-700',
    B6: 'bg-blue-500',
    NK: 'bg-yellow-500',
    AS: 'bg-teal-700',
  };

  const badgeColor = airlineColors[flight.airlineCode] || 'bg-gray-600';

  const amenityIcons: Record<string, typeof Wifi> = {
    'Wi-Fi': Wifi,
    'Power outlets': Zap,
    'Entertainment': Tv,
    'Live TV': Tv,
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 lg:w-44">
            <div className={`${badgeColor} text-white text-xs font-bold px-2.5 py-1.5 rounded-md`}>
              {flight.airlineCode}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{flight.airline}</div>
              <div className="text-xs text-gray-500">{flight.flightNumber}</div>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{flight.departureTime}</div>
              <div className="text-xs font-medium text-gray-500">{flight.origin.code}</div>
            </div>

            <div className="flex-1 relative px-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                  {flight.stops > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white shadow" />
                    </div>
                  )}
                </div>
                <Plane className="w-4 h-4 text-blue-600 -rotate-45" />
              </div>
              <div className="flex justify-between mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {flight.duration}
                </div>
                <div className={`text-xs font-medium ${flight.stops === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </div>
              </div>
              {flight.stops > 0 && (
                <div className="text-xs text-gray-400 text-center mt-0.5">
                  {flight.stopCities.join(', ')}
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{flight.arrivalTime}</div>
              <div className="text-xs font-medium text-gray-500">{flight.destination.code}</div>
            </div>
          </div>

          <div className="lg:w-48 flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-1.5">
              {flight.originalPrice > flight.price && (
                <span className="text-sm text-gray-400 line-through">${flight.originalPrice}</span>
              )}
              <span className="text-2xl font-bold text-blue-700">${breakdown.total}</span>
            </div>
            <div className="text-xs text-gray-500">per person</div>
            {isMember && breakdown.memberSavings > 0 && (
              <div className="text-xs text-green-600 font-medium">
                Member saves ${breakdown.memberSavings.toFixed(2)}
              </div>
            )}
            {flight.seatsLeft <= 5 && (
              <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                {flight.seatsLeft} seat{flight.seatsLeft > 1 ? 's' : ''} left
              </div>
            )}
            <button className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm hover:shadow">
              Select
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Plane className="w-3.5 h-3.5" />
            {flight.aircraft}
          </div>
          <span className="text-gray-300">|</span>
          {flight.amenities.slice(0, 3).map(amenity => {
            const Icon = amenityIcons[amenity];
            return (
              <div key={amenity} className="flex items-center gap-1 text-xs text-gray-500">
                {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                {amenity}
              </div>
            );
          })}
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Luggage className="w-3.5 h-3.5" />
            {flight.baggageIncluded ? 'Bag included' : 'No bag included'}
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Leaf className="w-3.5 h-3.5" />
            {flight.co2Emissions}
          </div>
          {flight.refundable && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-blue-600 font-medium">Refundable</span>
            </>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Price details
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-4">
          <div className="max-w-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base fare</span>
              <span className="text-gray-900">${breakdown.baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes</span>
              <span className="text-gray-900">${breakdown.taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fees & surcharges</span>
              <span className="text-gray-900">${breakdown.fees.toFixed(2)}</span>
            </div>
            {breakdown.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Discount</span>
                <span className="text-green-600">-${breakdown.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-300">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-700">${breakdown.total.toFixed(2)}</span>
            </div>
            {isMember && breakdown.loyaltyPoints > 0 && (
              <div className="flex justify-between text-xs pt-1">
                <span className="text-yellow-600">Loyalty points earned</span>
                <span className="text-yellow-600 font-medium">{breakdown.loyaltyPoints.toLocaleString()} pts</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

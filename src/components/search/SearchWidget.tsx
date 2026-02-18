import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Building2, Car, Package, Compass, Ship, ArrowRightLeft, Search, Plus, Minus, ChevronDown } from 'lucide-react';
import { Airport, SearchTab, TripType, CabinClass } from '../../types';
import AirportPicker from './AirportPicker';

export default function SearchWidget() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>('flights');
  const [tripType, setTripType] = useState<TripType>('roundtrip');
  const [cabinClass, setCabinClass] = useState<CabinClass>('economy');
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [showTravelers, setShowTravelers] = useState(false);
  const [hotelDest, setHotelDest] = useState('');
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');
  const [hotelRooms, setHotelRooms] = useState(1);
  const [carPickup, setCarPickup] = useState('');
  const [carPickupDate, setCarPickupDate] = useState('');
  const [carDropoffDate, setCarDropoffDate] = useState('');

  const swapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = () => {
    if (activeTab === 'flights' && origin && destination) {
      const params = new URLSearchParams({
        origin: origin.code,
        destination: destination.code,
        depart: departDate || '2026-03-15',
        return: returnDate || '2026-03-22',
        travelers: travelers.toString(),
        cabin: cabinClass,
        tripType,
      });
      navigate(`/flights/search?${params.toString()}`);
    }
  };

  const tabs = [
    { id: 'hotels' as SearchTab, label: 'Stays', icon: Building2 },
    { id: 'flights' as SearchTab, label: 'Flights', icon: Plane },
    { id: 'cars' as SearchTab, label: 'Cars', icon: Car },
    { id: 'packages' as SearchTab, label: 'Packages', icon: Package },
    { id: 'things' as SearchTab, label: 'Things to do', icon: Compass },
    { id: 'cruises' as SearchTab, label: 'Cruises', icon: Ship },
  ];

  const cabinOptions: { value: CabinClass; label: string }[] = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 px-4 py-4 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-blue-800 border-b-[3px] border-blue-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'flights' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                {(['roundtrip', 'oneway', 'multicity'] as TripType[]).map(type => (
                  <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="tripType"
                      value={type}
                      checked={tripType === type}
                      onChange={() => setTripType(type)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {type === 'roundtrip' ? 'Roundtrip' : type === 'oneway' ? 'One-way' : 'Multi-city'}
                    </span>
                  </label>
                ))}
              </div>

              <div className="relative ml-auto">
                <select
                  value={cabinClass}
                  onChange={e => setCabinClass(e.target.value as CabinClass)}
                  className="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 cursor-pointer hover:border-blue-500"
                >
                  {cabinOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-end gap-3">
              <AirportPicker
                label="Leaving from"
                selected={origin}
                onSelect={setOrigin}
                placeholder="City or airport"
              />

              <button
                onClick={swapAirports}
                className="flex-shrink-0 bg-white border border-gray-300 rounded-full p-2 hover:bg-blue-50 hover:border-blue-400 transition-colors mb-0.5"
                title="Swap airports"
              >
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              </button>

              <AirportPicker
                label="Going to"
                selected={destination}
                onSelect={setDestination}
                placeholder="City or airport"
              />

              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Departing</label>
                <input
                  type="date"
                  value={departDate}
                  onChange={e => setDepartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                />
              </div>

              {tripType === 'roundtrip' && (
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Returning</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                  />
                </div>
              )}

              <div className="relative flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Travelers</label>
                <button
                  onClick={() => setShowTravelers(!showTravelers)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors flex items-center gap-2 min-w-28"
                >
                  <span>{travelers} Traveler{travelers > 1 ? 's' : ''}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showTravelers && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-64">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Adults</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setTravelers(Math.max(1, travelers - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                          disabled={travelers <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{travelers}</span>
                        <button
                          onClick={() => setTravelers(Math.min(9, travelers + 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                          disabled={travelers >= 9}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTravelers(false)}
                      className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm text-gray-600">Add a place to stay</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm text-gray-600">Add a car</span>
              </label>
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-[#1a1a6c] hover:bg-[#14144f] text-white py-3.5 rounded-full text-base font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        )}

        {activeTab === 'hotels' && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Going to</label>
                <input
                  type="text"
                  value={hotelDest}
                  onChange={e => setHotelDest(e.target.value)}
                  placeholder="Enter a destination"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Check-in</label>
                <input
                  type="date"
                  value={hotelCheckIn}
                  onChange={e => setHotelCheckIn(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Check-out</label>
                <input
                  type="date"
                  value={hotelCheckOut}
                  onChange={e => setHotelCheckOut(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rooms</label>
                <select
                  value={hotelRooms}
                  onChange={e => setHotelRooms(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="w-full bg-[#1a1a6c] hover:bg-[#14144f] text-white py-3.5 rounded-full text-base font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl">
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        )}

        {activeTab === 'cars' && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pick-up</label>
                <input
                  type="text"
                  value={carPickup}
                  onChange={e => setCarPickup(e.target.value)}
                  placeholder="City, airport, or address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pick-up date</label>
                <input
                  type="date"
                  value={carPickupDate}
                  onChange={e => setCarPickupDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Drop-off date</label>
                <input
                  type="date"
                  value={carDropoffDate}
                  onChange={e => setCarDropoffDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm hover:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm text-gray-600">Return car to a different location</span>
            </label>
            <button className="w-full bg-[#1a1a6c] hover:bg-[#14144f] text-white py-3.5 rounded-full text-base font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl">
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

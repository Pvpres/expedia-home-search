import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, Filter, X, Plane } from 'lucide-react';
import GlobalNav from '../components/navigation/GlobalNav';
import FlightSearchCard from '../components/results/FlightSearchCard';
import Footer from '../components/common/Footer';
import { MOCK_FLIGHT_RESULTS } from '../constants/mockFlights';
import { AIRPORTS } from '../constants/airports';
import PriceCalculator from '../utils/PriceCalculator';

type SortOption = 'price' | 'duration' | 'departure' | 'stops';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [isMember, setIsMember] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  const originCode = searchParams.get('origin') || 'JFK';
  const destCode = searchParams.get('destination') || 'LAX';
  const departDate = searchParams.get('depart') || '2026-03-15';
  const returnDate = searchParams.get('return') || '2026-03-22';
  const travelers = searchParams.get('travelers') || '1';
  const cabin = searchParams.get('cabin') || 'economy';

  const originAirport = AIRPORTS.find(a => a.code === originCode);
  const destAirport = AIRPORTS.find(a => a.code === destCode);

  const calculator = useMemo(() => new PriceCalculator(), []);

  const airlines = useMemo(() => {
    const set = new Set(MOCK_FLIGHT_RESULTS.map(f => f.airline));
    return Array.from(set);
  }, []);

  const filteredFlights = useMemo(() => {
    let flights = [...MOCK_FLIGHT_RESULTS];

    if (maxStops !== null) {
      flights = flights.filter(f => f.stops <= maxStops);
    }

    if (selectedAirlines.length > 0) {
      flights = flights.filter(f => selectedAirlines.includes(f.airline));
    }

    switch (sortBy) {
      case 'price':
        flights = calculator.sortByPrice(flights, isMember, true);
        break;
      case 'duration':
        flights.sort((a, b) => {
          const dA = parseInt(a.duration);
          const dB = parseInt(b.duration);
          return dA - dB;
        });
        break;
      case 'departure':
        flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      case 'stops':
        flights.sort((a, b) => a.stops - b.stops);
        break;
    }

    return flights;
  }, [sortBy, isMember, maxStops, selectedAirlines, calculator]);

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <GlobalNav />

      <div className="bg-blue-800 text-white py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <Link to="/" className="flex items-center gap-1 text-sm text-blue-200 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Modify search
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg">
                {originAirport?.city || originCode} ({originCode})
              </span>
              <span className="text-blue-300 mx-1">&rarr;</span>
              <span className="font-bold text-lg">
                {destAirport?.city || destCode} ({destCode})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <span>{formatDate(departDate)}</span>
              <span>-</span>
              <span>{formatDate(returnDate)}</span>
              <span className="text-blue-400">|</span>
              <span>{travelers} traveler{Number(travelers) > 1 ? 's' : ''}</span>
              <span className="text-blue-400">|</span>
              <span className="capitalize">{cabin.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  <button
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Stops</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Any number of stops', value: null },
                      { label: 'Nonstop only', value: 0 },
                      { label: '1 stop or fewer', value: 1 },
                    ].map(opt => (
                      <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="stops"
                          checked={maxStops === opt.value}
                          onChange={() => setMaxStops(opt.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-600">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Airlines</h4>
                  <div className="space-y-2">
                    {airlines.map(airline => (
                      <label key={airline} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline)}
                          onChange={() => toggleAirline(airline)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-600">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Membership</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMember}
                      onChange={e => setIsMember(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-600">Show member prices</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="lg:hidden flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>
                  <span className="text-sm text-gray-500">
                    {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortOption)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <option value="price">Price (lowest)</option>
                    <option value="duration">Duration (shortest)</option>
                    <option value="departure">Departure (earliest)</option>
                    <option value="stops">Stops (fewest)</option>
                  </select>
                </div>
              </div>

              {isMember && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-yellow-600 text-sm font-medium">
                    Member prices shown — sign in to unlock exclusive savings and earn loyalty points
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {filteredFlights.map(flight => (
                  <FlightSearchCard
                    key={flight.id}
                    flight={flight}
                    isMember={isMember}
                  />
                ))}
              </div>

              {filteredFlights.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No flights match your filters</h3>
                  <p className="text-sm text-gray-500">Try adjusting your filters to see more results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

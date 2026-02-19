export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface FlightSearchParams {
  origin: Airport | null;
  destination: Airport | null;
  departDate: string;
  returnDate: string;
  travelers: number;
  cabinClass: CabinClass;
  tripType: TripType;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
}

export interface CarSearchParams {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
}

export type SearchTab = 'flights' | 'hotels' | 'cars' | 'packages' | 'things' | 'cruises';
export type TripType = 'roundtrip' | 'oneway' | 'multicity';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopCities: string[];
  price: number;
  originalPrice: number;
  seatsLeft: number;
  aircraft: string;
  cabinClass: CabinClass;
  amenities: string[];
  co2Emissions: string;
  baggageIncluded: boolean;
  refundable: boolean;
}

export interface PriceBreakdown {
  baseFare: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;
  loyaltyPoints: number;
  memberSavings: number;
}

export interface PromoOffer {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  discount: string;
  destination: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

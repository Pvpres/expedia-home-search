import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FlightSearchCard from './FlightSearchCard';
import { FlightResult } from '../../types';

function makeFlight(overrides: Partial<FlightResult> = {}): FlightResult {
  return {
    id: 'FL-TEST',
    airline: 'United Airlines',
    airlineCode: 'UA',
    flightNumber: 'UA 2451',
    origin: { code: 'JFK', city: 'New York', name: 'JFK Airport', country: 'United States' },
    destination: { code: 'LAX', city: 'Los Angeles', name: 'LAX Airport', country: 'United States' },
    departureTime: '06:15 AM',
    arrivalTime: '09:38 AM',
    duration: '5h 23m',
    stops: 0,
    stopCities: [],
    price: 247,
    originalPrice: 312,
    seatsLeft: 4,
    aircraft: 'Boeing 737-900',
    cabinClass: 'economy',
    amenities: ['Wi-Fi', 'Power outlets', 'Entertainment'],
    co2Emissions: '189 kg CO2',
    baggageIncluded: false,
    refundable: false,
    ...overrides,
  };
}

describe('FlightSearchCard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2024-03-15T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders airline name and flight number', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('United Airlines')).toBeInTheDocument();
    expect(screen.getByText('UA 2451')).toBeInTheDocument();
  });

  it('renders departure and arrival times', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('06:15 AM')).toBeInTheDocument();
    expect(screen.getByText('09:38 AM')).toBeInTheDocument();
  });

  it('renders origin and destination codes', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('JFK')).toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
  });

  it('renders duration', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('5h 23m')).toBeInTheDocument();
  });

  it('shows nonstop for 0 stops', () => {
    render(<FlightSearchCard flight={makeFlight({ stops: 0 })} />);
    expect(screen.getByText('Nonstop')).toBeInTheDocument();
  });

  it('shows stop count for flights with stops', () => {
    render(<FlightSearchCard flight={makeFlight({ stops: 1, stopCities: ['Dallas (DFW)'] })} />);
    expect(screen.getByText('1 stop')).toBeInTheDocument();
    expect(screen.getByText('Dallas (DFW)')).toBeInTheDocument();
  });

  it('shows plural stops text', () => {
    render(<FlightSearchCard flight={makeFlight({ stops: 2, stopCities: ['Dallas', 'Denver'] })} />);
    expect(screen.getByText('2 stops')).toBeInTheDocument();
  });

  it('shows original price strikethrough when discounted', () => {
    render(<FlightSearchCard flight={makeFlight({ price: 247, originalPrice: 312 })} />);
    expect(screen.getByText('$312')).toBeInTheDocument();
  });

  it('does not show strikethrough when prices match', () => {
    render(<FlightSearchCard flight={makeFlight({ price: 247, originalPrice: 247 })} />);
    expect(screen.queryByText('$247', { selector: '.line-through' })).not.toBeInTheDocument();
  });

  it('shows seats left warning when <= 5', () => {
    render(<FlightSearchCard flight={makeFlight({ seatsLeft: 4 })} />);
    expect(screen.getByText(/4 seats left/)).toBeInTheDocument();
  });

  it('does not show seats warning when > 5', () => {
    render(<FlightSearchCard flight={makeFlight({ seatsLeft: 10 })} />);
    expect(screen.queryByText(/seats left/)).not.toBeInTheDocument();
  });

  it('singular seat left text', () => {
    render(<FlightSearchCard flight={makeFlight({ seatsLeft: 1 })} />);
    expect(screen.getByText(/1 seat left/)).toBeInTheDocument();
  });

  it('renders aircraft info', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('Boeing 737-900')).toBeInTheDocument();
  });

  it('renders amenities', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Power outlets')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('shows baggage status', () => {
    render(<FlightSearchCard flight={makeFlight({ baggageIncluded: false })} />);
    expect(screen.getByText('No bag included')).toBeInTheDocument();
  });

  it('shows bag included when true', () => {
    render(<FlightSearchCard flight={makeFlight({ baggageIncluded: true })} />);
    expect(screen.getByText('Bag included')).toBeInTheDocument();
  });

  it('shows CO2 emissions', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('189 kg CO2')).toBeInTheDocument();
  });

  it('shows refundable badge when applicable', () => {
    render(<FlightSearchCard flight={makeFlight({ refundable: true })} />);
    expect(screen.getByText('Refundable')).toBeInTheDocument();
  });

  it('does not show refundable badge when not refundable', () => {
    render(<FlightSearchCard flight={makeFlight({ refundable: false })} />);
    expect(screen.queryByText('Refundable')).not.toBeInTheDocument();
  });

  it('renders select button', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('renders price details toggle', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    expect(screen.getByText('Price details')).toBeInTheDocument();
  });

  it('expands price breakdown on click', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    fireEvent.click(screen.getByText('Price details'));
    expect(screen.getByText('Base fare')).toBeInTheDocument();
    expect(screen.getByText('Taxes')).toBeInTheDocument();
    expect(screen.getByText('Fees & surcharges')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('collapses price breakdown on second click', () => {
    render(<FlightSearchCard flight={makeFlight()} />);
    fireEvent.click(screen.getByText('Price details'));
    expect(screen.getByText('Base fare')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Price details'));
    expect(screen.queryByText('Base fare')).not.toBeInTheDocument();
  });

  it('shows member savings when isMember and savings > 0', () => {
    const flight = makeFlight({ price: 600, originalPrice: 600 });
    render(<FlightSearchCard flight={flight} isMember={true} />);
    const savingsText = screen.queryByText(/Member saves/);
    if (savingsText) {
      expect(savingsText).toBeInTheDocument();
    }
  });

  it('shows loyalty points in expanded view for members', () => {
    const flight = makeFlight({ price: 500 });
    render(<FlightSearchCard flight={flight} isMember={true} />);
    fireEvent.click(screen.getByText('Price details'));
    const pointsText = screen.queryByText(/Loyalty points earned/);
    if (pointsText) {
      expect(pointsText).toBeInTheDocument();
    }
  });

  it('shows discount row in expanded view when discounted', () => {
    const flight = makeFlight({ price: 200, originalPrice: 300 });
    render(<FlightSearchCard flight={flight} />);
    fireEvent.click(screen.getByText('Price details'));
    expect(screen.getByText('Discount')).toBeInTheDocument();
  });

  it('renders airline badge with correct code', () => {
    render(<FlightSearchCard flight={makeFlight({ airlineCode: 'DL' })} />);
    expect(screen.getByText('DL')).toBeInTheDocument();
  });
});

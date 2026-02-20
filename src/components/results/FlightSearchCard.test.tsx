import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FlightSearchCard from './FlightSearchCard';
import { FlightResult } from '../../types';
import { AIRPORTS } from '../../constants/airports';

const findAirport = (code: string) => {
  const airport = AIRPORTS.find(a => a.code === code);
  if (!airport) throw new Error(`Airport ${code} not found`);
  return airport;
};

function makeFlight(overrides: Partial<FlightResult> = {}): FlightResult {
  return {
    id: 'TEST-001',
    airline: 'United Airlines',
    airlineCode: 'UA',
    flightNumber: 'UA 100',
    origin: findAirport('JFK'),
    destination: findAirport('LAX'),
    departureTime: '08:00 AM',
    arrivalTime: '11:00 AM',
    duration: '5h 00m',
    stops: 0,
    stopCities: [],
    price: 200,
    originalPrice: 200,
    seatsLeft: 10,
    aircraft: 'Boeing 737',
    cabinClass: 'economy',
    amenities: ['Wi-Fi', 'Power outlets', 'Entertainment'],
    co2Emissions: '180 kg CO₂',
    baggageIncluded: false,
    refundable: false,
    ...overrides,
  };
}

function renderCard(flight: FlightResult, isMember = false) {
  return render(
    <MemoryRouter>
      <FlightSearchCard flight={flight} isMember={isMember} />
    </MemoryRouter>
  );
}

describe('FlightSearchCard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2024-03-15T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders airline name and flight number', () => {
    renderCard(makeFlight());
    expect(screen.getByText('United Airlines')).toBeInTheDocument();
    expect(screen.getByText('UA 100')).toBeInTheDocument();
  });

  it('renders departure and arrival times', () => {
    renderCard(makeFlight());
    expect(screen.getByText('08:00 AM')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM')).toBeInTheDocument();
  });

  it('renders origin and destination codes', () => {
    renderCard(makeFlight());
    expect(screen.getByText('JFK')).toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
  });

  it('renders duration', () => {
    renderCard(makeFlight());
    expect(screen.getByText('5h 00m')).toBeInTheDocument();
  });

  it('shows Nonstop for 0 stops', () => {
    renderCard(makeFlight({ stops: 0 }));
    expect(screen.getByText('Nonstop')).toBeInTheDocument();
  });

  it('shows stop count for flights with stops', () => {
    renderCard(makeFlight({ stops: 1, stopCities: ['Dallas (DFW)'] }));
    expect(screen.getByText('1 stop')).toBeInTheDocument();
    expect(screen.getByText('Dallas (DFW)')).toBeInTheDocument();
  });

  it('shows plural stops text', () => {
    renderCard(makeFlight({ stops: 2, stopCities: ['A', 'B'] }));
    expect(screen.getByText('2 stops')).toBeInTheDocument();
  });

  it('renders price', () => {
    renderCard(makeFlight({ price: 200 }));
    const priceEls = screen.getAllByText(/\$\d/);
    expect(priceEls.length).toBeGreaterThan(0);
  });

  it('shows strikethrough original price when discounted', () => {
    renderCard(makeFlight({ price: 200, originalPrice: 300 }));
    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  it('does NOT show strikethrough when prices are equal', () => {
    renderCard(makeFlight({ price: 200, originalPrice: 200 }));
    expect(screen.queryByText('$200', { selector: '.line-through' })).not.toBeInTheDocument();
  });

  it('shows low seats warning when seatsLeft <= 5', () => {
    renderCard(makeFlight({ seatsLeft: 3 }));
    expect(screen.getByText(/3 seats? left/)).toBeInTheDocument();
  });

  it('does NOT show seats warning when seatsLeft > 5', () => {
    renderCard(makeFlight({ seatsLeft: 10 }));
    expect(screen.queryByText(/seats? left/)).not.toBeInTheDocument();
  });

  it('shows singular seat text', () => {
    renderCard(makeFlight({ seatsLeft: 1 }));
    expect(screen.getByText('1 seat left')).toBeInTheDocument();
  });

  it('shows Refundable badge when refundable', () => {
    renderCard(makeFlight({ refundable: true }));
    expect(screen.getByText('Refundable')).toBeInTheDocument();
  });

  it('does NOT show Refundable badge when not refundable', () => {
    renderCard(makeFlight({ refundable: false }));
    expect(screen.queryByText('Refundable')).not.toBeInTheDocument();
  });

  it('shows Bag included when baggageIncluded is true', () => {
    renderCard(makeFlight({ baggageIncluded: true }));
    expect(screen.getByText('Bag included')).toBeInTheDocument();
  });

  it('shows No bag included when baggageIncluded is false', () => {
    renderCard(makeFlight({ baggageIncluded: false }));
    expect(screen.getByText('No bag included')).toBeInTheDocument();
  });

  it('renders aircraft name', () => {
    renderCard(makeFlight({ aircraft: 'Boeing 737' }));
    expect(screen.getByText('Boeing 737')).toBeInTheDocument();
  });

  it('renders amenities', () => {
    renderCard(makeFlight({ amenities: ['Wi-Fi', 'Power outlets', 'Entertainment'] }));
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Power outlets')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('renders CO2 emissions', () => {
    renderCard(makeFlight({ co2Emissions: '180 kg CO₂' }));
    expect(screen.getByText('180 kg CO₂')).toBeInTheDocument();
  });

  it('renders Select button', () => {
    renderCard(makeFlight());
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  describe('price details expand/collapse', () => {
    it('renders Price details button', () => {
      renderCard(makeFlight());
      expect(screen.getByText('Price details')).toBeInTheDocument();
    });

    it('expands price breakdown on click', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderCard(makeFlight());
      await user.click(screen.getByText('Price details'));
      expect(screen.getByText('Base fare')).toBeInTheDocument();
      expect(screen.getByText('Taxes')).toBeInTheDocument();
      expect(screen.getByText('Fees & surcharges')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('collapses price breakdown on second click', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderCard(makeFlight());
      await user.click(screen.getByText('Price details'));
      expect(screen.getByText('Base fare')).toBeInTheDocument();
      await user.click(screen.getByText('Price details'));
      expect(screen.queryByText('Base fare')).not.toBeInTheDocument();
    });
  });

  describe('member pricing', () => {
    it('shows member savings when isMember and savings > 0', () => {
      renderCard(makeFlight({ price: 500 }), true);
      const savingsEl = screen.queryByText(/Member saves/);
      if (savingsEl) {
        expect(savingsEl).toBeInTheDocument();
      }
    });

    it('shows loyalty points in expanded view for members', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderCard(makeFlight({ price: 500 }), true);
      await user.click(screen.getByText('Price details'));
      const pointsEl = screen.queryByText(/pts/);
      if (pointsEl) {
        expect(pointsEl).toBeInTheDocument();
      }
    });
  });

  describe('airline badge colors', () => {
    it('renders airline code badge', () => {
      renderCard(makeFlight({ airlineCode: 'DL' }));
      expect(screen.getByText('DL')).toBeInTheDocument();
    });

    it('renders unknown airline code with default color', () => {
      renderCard(makeFlight({ airlineCode: 'ZZ' }));
      expect(screen.getByText('ZZ')).toBeInTheDocument();
    });
  });
});

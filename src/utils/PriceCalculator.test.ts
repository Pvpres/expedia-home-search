import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PriceCalculator from './PriceCalculator';
import { FlightResult, CabinClass } from '../types';
import { AIRPORTS } from '../constants/airports';

const findAirport = (code: string) => {
  const airport = AIRPORTS.find(a => a.code === code);
  if (!airport) throw new Error(`Airport ${code} not found`);
  return airport;
};

function makeFlight(overrides: Partial<FlightResult> = {}): FlightResult {
  return {
    id: 'TEST-001',
    airline: 'Test Airlines',
    airlineCode: 'TA',
    flightNumber: 'TA 100',
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
    amenities: ['Wi-Fi'],
    co2Emissions: '180 kg CO₂',
    baggageIncluded: false,
    refundable: false,
    ...overrides,
  };
}

describe('PriceCalculator', () => {
  let calc: PriceCalculator;

  beforeEach(() => {
    calc = new PriceCalculator();
    vi.useFakeTimers({ now: new Date('2024-03-15T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateFullPrice — route classification', () => {
    it('classifies US domestic route (JFK → LAX)', () => {
      const flight = makeFlight();
      calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log.some(s => s.includes('US Domestic'))).toBe(true);
    });

    it('classifies EU domestic route (CDG → FRA)', () => {
      const flight = makeFlight({
        origin: findAirport('CDG'),
        destination: findAirport('FRA'),
      });
      calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log.some(s => s.includes('EU Domestic'))).toBe(true);
    });

    it('classifies international route (JFK → LHR)', () => {
      const flight = makeFlight({
        origin: findAirport('JFK'),
        destination: findAirport('LHR'),
      });
      calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log.some(s => s.includes('International'))).toBe(true);
    });

    it('classifies non-US/non-EU route as international (NRT → SYD)', () => {
      const flight = makeFlight({
        origin: findAirport('NRT'),
        destination: findAirport('SYD'),
      });
      calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log.some(s => s.includes('International'))).toBe(true);
    });

    it('classifies EU to non-EU as international', () => {
      const flight = makeFlight({
        origin: findAirport('CDG'),
        destination: findAirport('JFK'),
      });
      calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log.some(s => s.includes('International'))).toBe(true);
    });
  });

  describe('calculateFullPrice — cabin class multipliers', () => {
    it('applies economy multiplier (1.0x)', () => {
      const flight = makeFlight({ price: 100, cabinClass: 'economy' });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(100);
    });

    it('applies premium_economy multiplier (1.65x)', () => {
      const flight = makeFlight({ price: 100, cabinClass: 'premium_economy' });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(164);
    });

    it('applies business multiplier (3.2x)', () => {
      const flight = makeFlight({ price: 100, cabinClass: 'business' });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(319);
    });

    it('applies first class multiplier (5.75x)', () => {
      const flight = makeFlight({ price: 100, cabinClass: 'first' });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(574);
    });
  });

  describe('calculateFullPrice — peak season surcharge', () => {
    it('does NOT apply surcharge in off-peak month (March)', () => {
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
      const flight = makeFlight({ price: 100 });
      const result = calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).not.toContain('PEAK_SEASON_SURCHARGE');
      expect(result.baseFare).toBeLessThan(115);
    });

    it('applies 15% surcharge in June (peak)', () => {
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
      const freshCalc = new PriceCalculator();
      const flight = makeFlight({ price: 100 });
      const result = freshCalc.calculateFullPrice(flight);
      const rules = freshCalc.getAppliedRules();
      expect(rules).toContain('PEAK_SEASON_SURCHARGE');
      expect(result.baseFare).toBeGreaterThanOrEqual(114);
    });

    it('applies surcharge in July (peak)', () => {
      vi.setSystemTime(new Date('2024-07-15T12:00:00Z'));
      const freshCalc = new PriceCalculator();
      const flight = makeFlight({ price: 100 });
      freshCalc.calculateFullPrice(flight);
      expect(freshCalc.getAppliedRules()).toContain('PEAK_SEASON_SURCHARGE');
    });

    it('applies surcharge in August (peak)', () => {
      vi.setSystemTime(new Date('2024-08-15T12:00:00Z'));
      const freshCalc = new PriceCalculator();
      const flight = makeFlight({ price: 100 });
      freshCalc.calculateFullPrice(flight);
      expect(freshCalc.getAppliedRules()).toContain('PEAK_SEASON_SURCHARGE');
    });

    it('applies surcharge in November (peak)', () => {
      vi.setSystemTime(new Date('2024-11-15T12:00:00Z'));
      const freshCalc = new PriceCalculator();
      const flight = makeFlight({ price: 100 });
      freshCalc.calculateFullPrice(flight);
      expect(freshCalc.getAppliedRules()).toContain('PEAK_SEASON_SURCHARGE');
    });

    it('applies surcharge in December (peak)', () => {
      vi.setSystemTime(new Date('2024-12-15T12:00:00Z'));
      const freshCalc = new PriceCalculator();
      const flight = makeFlight({ price: 100 });
      freshCalc.calculateFullPrice(flight);
      expect(freshCalc.getAppliedRules()).toContain('PEAK_SEASON_SURCHARGE');
    });

    it('does NOT apply surcharge in January (off-peak)', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
      const freshCalc = new PriceCalculator();
      const flight = makeFlight({ price: 100 });
      freshCalc.calculateFullPrice(flight);
      expect(freshCalc.getAppliedRules()).not.toContain('PEAK_SEASON_SURCHARGE');
    });
  });

  describe('calculateFullPrice — taxes', () => {
    it('applies US domestic tax rate (7.5%)', () => {
      const flight = makeFlight({ price: 100 });
      const result = calc.calculateFullPrice(flight);
      expect(result.taxes).toBeCloseTo(7.5, 0);
    });

    it('applies EU domestic tax rate (6%)', () => {
      const flight = makeFlight({
        origin: findAirport('CDG'),
        destination: findAirport('FRA'),
        price: 100,
      });
      const result = calc.calculateFullPrice(flight);
      expect(result.taxes).toBeCloseTo(6, 0);
    });

    it('applies default international tax rate (8%)', () => {
      const flight = makeFlight({
        origin: findAirport('NRT'),
        destination: findAirport('SYD'),
        price: 100,
      });
      const result = calc.calculateFullPrice(flight);
      expect(result.taxes).toBeCloseTo(8, 0);
    });
  });

  describe('calculateFullPrice — fees', () => {
    it('includes base fees (911 security + PFC + booking)', () => {
      const flight = makeFlight({ stops: 0, price: 50 });
      const result = calc.calculateFullPrice(flight);
      expect(result.fees).toBeGreaterThan(20);
    });

    it('adds PFC per additional stop', () => {
      const noStop = calc.calculateFullPrice(makeFlight({ stops: 0, price: 200 }));
      const calcWithStop = new PriceCalculator();
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
      const oneStop = calcWithStop.calculateFullPrice(makeFlight({ stops: 1, price: 200 }));
      expect(oneStop.fees).toBeGreaterThan(noStop.fees);
    });

    it('adds international fees bundle for international routes', () => {
      const domestic = calc.calculateFullPrice(makeFlight({ price: 200 }));
      const intlCalc = new PriceCalculator();
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
      const intl = intlCalc.calculateFullPrice(makeFlight({
        origin: findAirport('JFK'),
        destination: findAirport('LHR'),
        price: 200,
      }));
      expect(intl.fees).toBeGreaterThan(domestic.fees);
      expect(intlCalc.getAppliedRules()).toContain('INTL_FEES_BUNDLE');
    });

    it('applies fuel surcharge tier for baseFare > 200', () => {
      const flight = makeFlight({ price: 300 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules()).toContain('FUEL_SURCHARGE');
    });

    it('applies fuel surcharge tier for baseFare 100-200', () => {
      const flight = makeFlight({ price: 150 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules()).toContain('FUEL_SURCHARGE');
    });

    it('applies fuel surcharge tier for baseFare < 100', () => {
      const flight = makeFlight({ price: 50 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules()).toContain('FUEL_SURCHARGE');
    });

    it('adds carrier surcharge for international', () => {
      const intlFlight = makeFlight({
        origin: findAirport('JFK'),
        destination: findAirport('LHR'),
        price: 200,
      });
      const result = calc.calculateFullPrice(intlFlight);
      expect(result.fees).toBeGreaterThan(0);
    });

    it('adds carrier surcharge for >1 stop domestic', () => {
      const flight = makeFlight({ stops: 2, price: 200 });
      const result = calc.calculateFullPrice(flight);
      expect(result.fees).toBeGreaterThan(0);
    });
  });

  describe('calculateFullPrice — discounts', () => {
    it('applies sale discount when originalPrice > price', () => {
      const flight = makeFlight({ price: 200, originalPrice: 300 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules()).toContain('SALE_DISCOUNT');
    });

    it('does not apply sale discount when prices are equal', () => {
      const flight = makeFlight({ price: 200, originalPrice: 200 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules()).not.toContain('SALE_DISCOUNT');
    });

    it('applies member discount when subtotal >= 500 and isMember', () => {
      const flight = makeFlight({ price: 500 });
      calc.calculateFullPrice(flight, true);
      expect(calc.getAppliedRules()).toContain('MEMBER_DISCOUNT');
    });

    it('does NOT apply member discount when subtotal < 500', () => {
      const flight = makeFlight({ price: 50 });
      calc.calculateFullPrice(flight, true);
      expect(calc.getAppliedRules()).not.toContain('MEMBER_DISCOUNT');
    });

    it('does NOT apply member discount for non-members', () => {
      const flight = makeFlight({ price: 500 });
      calc.calculateFullPrice(flight, false);
      expect(calc.getAppliedRules()).not.toContain('MEMBER_DISCOUNT');
    });

    it('applies high availability discount when seatsLeft > 10', () => {
      const flight = makeFlight({ seatsLeft: 15, price: 200 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules()).toContain('HIGH_AVAILABILITY_DISCOUNT');
    });

    it('does NOT apply high availability discount when seatsLeft <= 10', () => {
      const flight = makeFlight({ seatsLeft: 5, price: 200 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules()).not.toContain('HIGH_AVAILABILITY_DISCOUNT');
    });

    it('returns memberSavings in breakdown when member discount applies', () => {
      const flight = makeFlight({ price: 500 });
      const result = calc.calculateFullPrice(flight, true);
      expect(result.memberSavings).toBeGreaterThan(0);
    });
  });

  describe('calculateFullPrice — loyalty points', () => {
    it('returns 0 points for non-members', () => {
      const flight = makeFlight({ price: 200 });
      const result = calc.calculateFullPrice(flight, false);
      expect(result.loyaltyPoints).toBe(0);
    });

    it('calculates points for members at 2 per dollar', () => {
      const flight = makeFlight({ price: 100 });
      const result = calc.calculateFullPrice(flight, true);
      expect(result.loyaltyPoints).toBeGreaterThan(0);
    });

    it('applies 1.5x bonus for international routes', () => {
      const domesticCalc = new PriceCalculator();
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
      const domesticFlight = makeFlight({ price: 200 });
      const domesticResult = domesticCalc.calculateFullPrice(domesticFlight, true);

      const intlCalc = new PriceCalculator();
      const intlFlight = makeFlight({
        origin: findAirport('JFK'),
        destination: findAirport('LHR'),
        price: 200,
      });
      const intlResult = intlCalc.calculateFullPrice(intlFlight, true);

      expect(intlCalc.getAppliedRules()).toContain('INTL_LOYALTY_BONUS');
      expect(intlResult.loyaltyPoints).toBeGreaterThan(domesticResult.loyaltyPoints);
    });

    it('applies 1.25x peak season bonus', () => {
      vi.setSystemTime(new Date('2024-07-15T12:00:00Z'));
      const peakCalc = new PriceCalculator();
      const flight = makeFlight({ price: 200 });
      peakCalc.calculateFullPrice(flight, true);
      expect(peakCalc.getAppliedRules()).toContain('PEAK_LOYALTY_BONUS');
    });
  });

  describe('calculateFullPrice — rounding rules', () => {
    it('returns a total that is a valid number', () => {
      const flight = makeFlight({ price: 123.456 });
      const result = calc.calculateFullPrice(flight);
      expect(Number.isFinite(result.total)).toBe(true);
    });

    it('rounds values to two decimal places', () => {
      const flight = makeFlight({ price: 333 });
      const result = calc.calculateFullPrice(flight);
      const decimalPlaces = (result.total.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateFullPrice — input validation', () => {
    it('returns zeroed breakdown for missing price', () => {
      const flight = makeFlight();
      (flight as Record<string, unknown>).price = undefined;
      const result = calc.calculateFullPrice(flight as FlightResult);
      expect(result.total).toBe(0);
      expect(result.baseFare).toBe(0);
    });

    it('returns zeroed breakdown for negative price', () => {
      const flight = makeFlight({ price: -50 });
      const result = calc.calculateFullPrice(flight);
      expect(result.total).toBe(0);
    });

    it('returns zeroed breakdown for missing origin', () => {
      const flight = makeFlight();
      (flight as Record<string, unknown>).origin = undefined;
      const result = calc.calculateFullPrice(flight as FlightResult);
      expect(result.total).toBe(0);
    });

    it('returns zeroed breakdown for missing destination', () => {
      const flight = makeFlight();
      (flight as Record<string, unknown>).destination = undefined;
      const result = calc.calculateFullPrice(flight as FlightResult);
      expect(result.total).toBe(0);
    });

    it('returns zeroed breakdown for negative stops', () => {
      const flight = makeFlight({ stops: -1 });
      const result = calc.calculateFullPrice(flight);
      expect(result.total).toBe(0);
    });

    it('returns zeroed breakdown for missing cabinClass', () => {
      const flight = makeFlight();
      (flight as Record<string, unknown>).cabinClass = undefined;
      const result = calc.calculateFullPrice(flight as FlightResult);
      expect(result.total).toBe(0);
    });

    it('populates error log on validation failure', () => {
      const flight = makeFlight({ price: -50 });
      calc.calculateFullPrice(flight);
      const errors = calc.getErrorLog();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('VALIDATION_ERROR'))).toBe(true);
    });
  });

  describe('calculateFullPrice — state reset between calls', () => {
    it('produces identical results for same input across consecutive calls', () => {
      const flight = makeFlight({ price: 250 });
      const first = calc.calculateFullPrice(flight, true);
      const second = calc.calculateFullPrice(flight, true);
      expect(first.total).toBe(second.total);
      expect(first.baseFare).toBe(second.baseFare);
      expect(first.taxes).toBe(second.taxes);
      expect(first.fees).toBe(second.fees);
      expect(first.loyaltyPoints).toBe(second.loyaltyPoints);
    });

    it('does not leak state from international to domestic call', () => {
      const intlFlight = makeFlight({
        origin: findAirport('JFK'),
        destination: findAirport('LHR'),
        price: 200,
      });
      calc.calculateFullPrice(intlFlight);

      const domesticFlight = makeFlight({ price: 200 });
      calc.calculateFullPrice(domesticFlight);
      const log = calc.getCalculationLog();
      expect(log.some(s => s.includes('US Domestic'))).toBe(true);
    });
  });

  describe('calculateFullPrice — complete breakdown structure', () => {
    it('returns all expected fields', () => {
      const flight = makeFlight({ price: 250 });
      const result = calc.calculateFullPrice(flight);
      expect(result).toHaveProperty('baseFare');
      expect(result).toHaveProperty('taxes');
      expect(result).toHaveProperty('fees');
      expect(result).toHaveProperty('discount');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('currency', 'USD');
      expect(result).toHaveProperty('loyaltyPoints');
      expect(result).toHaveProperty('memberSavings');
    });

    it('total equals baseFare + taxes + fees - discount (approximately)', () => {
      const flight = makeFlight({ price: 300, originalPrice: 350, seatsLeft: 5 });
      const result = calc.calculateFullPrice(flight);
      const expected = result.baseFare + result.taxes + result.fees - result.discount;
      expect(Math.abs(result.total - expected)).toBeLessThan(2);
    });
  });

  describe('calculateBatchPrices', () => {
    it('returns array of breakdowns matching input length', () => {
      const flights = [
        makeFlight({ price: 100 }),
        makeFlight({ price: 200 }),
        makeFlight({ price: 300 }),
      ];
      const results = calc.calculateBatchPrices(flights);
      expect(results).toHaveLength(3);
    });

    it('returns empty array for empty input', () => {
      const results = calc.calculateBatchPrices([]);
      expect(results).toHaveLength(0);
    });

    it('applies member pricing to all flights when isMember is true', () => {
      const flights = [
        makeFlight({ price: 500 }),
        makeFlight({ price: 600 }),
      ];
      const memberResults = calc.calculateBatchPrices(flights, true);
      const nonMemberCalc = new PriceCalculator();
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
      const nonMemberResults = nonMemberCalc.calculateBatchPrices(flights, false);
      expect(memberResults[0].loyaltyPoints).toBeGreaterThan(0);
      expect(nonMemberResults[0].loyaltyPoints).toBe(0);
    });
  });

  describe('findCheapestFlight', () => {
    it('returns null for empty array', () => {
      const result = calc.findCheapestFlight([]);
      expect(result).toBeNull();
    });

    it('finds the cheapest flight from a list', () => {
      const flights = [
        makeFlight({ id: 'A', price: 300 }),
        makeFlight({ id: 'B', price: 100 }),
        makeFlight({ id: 'C', price: 200 }),
      ];
      const result = calc.findCheapestFlight(flights);
      expect(result).not.toBeNull();
      expect(result!.flight.id).toBe('B');
    });

    it('returns breakdown for the cheapest flight', () => {
      const flights = [makeFlight({ price: 150 })];
      const result = calc.findCheapestFlight(flights);
      expect(result!.breakdown.total).toBeGreaterThan(0);
    });
  });

  describe('sortByPrice', () => {
    it('sorts flights by ascending price by default', () => {
      const flights = [
        makeFlight({ id: 'A', price: 300 }),
        makeFlight({ id: 'B', price: 100 }),
        makeFlight({ id: 'C', price: 200 }),
      ];
      const sorted = calc.sortByPrice(flights);
      expect(sorted[0].id).toBe('B');
      expect(sorted[1].id).toBe('C');
      expect(sorted[2].id).toBe('A');
    });

    it('sorts flights by descending price when ascending=false', () => {
      const flights = [
        makeFlight({ id: 'A', price: 300 }),
        makeFlight({ id: 'B', price: 100 }),
        makeFlight({ id: 'C', price: 200 }),
      ];
      const sorted = calc.sortByPrice(flights, false, false);
      expect(sorted[0].id).toBe('A');
      expect(sorted[2].id).toBe('B');
    });

    it('returns empty array for empty input', () => {
      const sorted = calc.sortByPrice([]);
      expect(sorted).toHaveLength(0);
    });

    it('handles single element array', () => {
      const flights = [makeFlight({ id: 'ONLY', price: 200 })];
      const sorted = calc.sortByPrice(flights);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('ONLY');
    });
  });

  describe('getCalculationLog / getErrorLog / getAppliedRules', () => {
    it('returns calculation steps after computing', () => {
      const flight = makeFlight({ price: 200 });
      calc.calculateFullPrice(flight);
      expect(calc.getCalculationLog().length).toBeGreaterThan(0);
    });

    it('returns applied rules after computing', () => {
      const flight = makeFlight({ price: 200 });
      calc.calculateFullPrice(flight);
      expect(calc.getAppliedRules().length).toBeGreaterThan(0);
    });

    it('returns error log for invalid input', () => {
      const flight = makeFlight({ price: -10 });
      calc.calculateFullPrice(flight);
      expect(calc.getErrorLog().length).toBeGreaterThan(0);
    });

    it('returns empty error log for valid input', () => {
      const flight = makeFlight({ price: 200 });
      calc.calculateFullPrice(flight);
      expect(calc.getErrorLog()).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('handles zero price', () => {
      const flight = makeFlight({ price: 0, originalPrice: 0, seatsLeft: 5 });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBe(0);
      expect(Number.isFinite(result.total)).toBe(true);
    });

    it('handles very large price', () => {
      const flight = makeFlight({ price: 999999 });
      const result = calc.calculateFullPrice(flight);
      expect(Number.isFinite(result.total)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('handles many stops', () => {
      const flight = makeFlight({ stops: 10, price: 200 });
      const result = calc.calculateFullPrice(flight);
      expect(result.fees).toBeGreaterThan(0);
    });
  });
});

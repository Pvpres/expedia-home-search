import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PriceCalculator from './PriceCalculator';
import { FlightResult } from '../types';

function makeFlight(overrides: Partial<FlightResult> = {}): FlightResult {
  return {
    id: 'FL-TEST',
    airline: 'Test Airlines',
    airlineCode: 'TA',
    flightNumber: 'TA 100',
    origin: { code: 'JFK', city: 'New York', name: 'JFK Airport', country: 'United States' },
    destination: { code: 'LAX', city: 'Los Angeles', name: 'LAX Airport', country: 'United States' },
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
    co2Emissions: '180 kg CO2',
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

  describe('calculateFullPrice', () => {
    describe('route classification', () => {
      it('classifies US domestic routes correctly', () => {
        const flight = makeFlight({
          origin: { code: 'JFK', city: 'New York', name: 'JFK', country: 'United States' },
          destination: { code: 'LAX', city: 'Los Angeles', name: 'LAX', country: 'United States' },
        });
        const result = calc.calculateFullPrice(flight);
        expect(result.taxes).toBeGreaterThan(0);
        const expectedTaxes = result.baseFare * 0.075;
        expect(result.taxes).toBeCloseTo(expectedTaxes, 0);
      });

      it('classifies EU domestic routes correctly', () => {
        const flight = makeFlight({
          origin: { code: 'CDG', city: 'Paris', name: 'CDG', country: 'France' },
          destination: { code: 'FRA', city: 'Frankfurt', name: 'FRA', country: 'Germany' },
        });
        const result = calc.calculateFullPrice(flight);
        const expectedTaxes = result.baseFare * 0.06;
        expect(result.taxes).toBeCloseTo(expectedTaxes, 0);
      });

      it('classifies international routes correctly', () => {
        const flight = makeFlight({
          origin: { code: 'JFK', city: 'New York', name: 'JFK', country: 'United States' },
          destination: { code: 'LHR', city: 'London', name: 'LHR', country: 'United Kingdom' },
        });
        const result = calc.calculateFullPrice(flight);
        expect(result.fees).toBeGreaterThan(0);
      });

      it('classifies non-US non-EU routes as international', () => {
        const flight = makeFlight({
          origin: { code: 'NRT', city: 'Tokyo', name: 'NRT', country: 'Japan' },
          destination: { code: 'SYD', city: 'Sydney', name: 'SYD', country: 'Australia' },
        });
        const result = calc.calculateFullPrice(flight);
        expect(result.total).toBeGreaterThan(0);
      });

      it('handles US variant country names', () => {
        const variants = ['United States', 'US', 'USA', 'United States of America'];
        for (const variant of variants) {
          const flight = makeFlight({
            origin: { code: 'JFK', city: 'New York', name: 'JFK', country: variant },
            destination: { code: 'LAX', city: 'LA', name: 'LAX', country: 'United States' },
          });
          const result = calc.calculateFullPrice(flight);
          const expectedTaxes = result.baseFare * 0.075;
          expect(result.taxes).toBeCloseTo(expectedTaxes, 0);
        }
      });
    });

    describe('cabin class multipliers', () => {
      it('applies economy multiplier (1.0x)', () => {
        const flight = makeFlight({ price: 100, cabinClass: 'economy' });
        const result = calc.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(100, 0);
      });

      it('applies premium_economy multiplier (1.65x)', () => {
        const flight = makeFlight({ price: 100, cabinClass: 'premium_economy' });
        const result = calc.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(165, 0);
      });

      it('applies business multiplier (3.20x)', () => {
        const flight = makeFlight({ price: 100, cabinClass: 'business' });
        const result = calc.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(320, 0);
      });

      it('applies first class multiplier (5.75x)', () => {
        const flight = makeFlight({ price: 100, cabinClass: 'first' });
        const result = calc.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(575, 0);
      });
    });

    describe('peak season surcharge', () => {
      it('applies surcharge in June', () => {
        vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
        const calc2 = new PriceCalculator();
        const flight = makeFlight({ price: 100 });
        const result = calc2.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(115, 0);
      });

      it('applies surcharge in July', () => {
        vi.setSystemTime(new Date('2024-07-15T12:00:00Z'));
        const calc2 = new PriceCalculator();
        const flight = makeFlight({ price: 100 });
        const result = calc2.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(115, 0);
      });

      it('applies surcharge in August', () => {
        vi.setSystemTime(new Date('2024-08-15T12:00:00Z'));
        const calc2 = new PriceCalculator();
        const flight = makeFlight({ price: 100 });
        const result = calc2.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(115, 0);
      });

      it('applies surcharge in November', () => {
        vi.setSystemTime(new Date('2024-11-15T12:00:00Z'));
        const calc2 = new PriceCalculator();
        const flight = makeFlight({ price: 100 });
        const result = calc2.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(115, 0);
      });

      it('applies surcharge in December', () => {
        vi.setSystemTime(new Date('2024-12-15T12:00:00Z'));
        const calc2 = new PriceCalculator();
        const flight = makeFlight({ price: 100 });
        const result = calc2.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(115, 0);
      });

      it('does not apply surcharge in off-peak months', () => {
        vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
        const calc2 = new PriceCalculator();
        const flight = makeFlight({ price: 100 });
        const result = calc2.calculateFullPrice(flight);
        expect(result.baseFare).toBeCloseTo(100, 0);
      });
    });

    describe('tax calculation', () => {
      it('applies US domestic tax rate (7.5%)', () => {
        const flight = makeFlight({ price: 100 });
        const result = calc.calculateFullPrice(flight);
        expect(result.taxes).toBeCloseTo(100 * 0.075, 1);
      });

      it('applies EU domestic tax rate (6%)', () => {
        const flight = makeFlight({
          price: 100,
          origin: { code: 'CDG', city: 'Paris', name: 'CDG', country: 'France' },
          destination: { code: 'FRA', city: 'Frankfurt', name: 'FRA', country: 'Germany' },
        });
        const result = calc.calculateFullPrice(flight);
        expect(result.taxes).toBeCloseTo(100 * 0.06, 1);
      });

      it('applies default tax rate for international non-US origin', () => {
        const flight = makeFlight({
          price: 100,
          origin: { code: 'NRT', city: 'Tokyo', name: 'NRT', country: 'Japan' },
          destination: { code: 'LHR', city: 'London', name: 'LHR', country: 'United Kingdom' },
        });
        const result = calc.calculateFullPrice(flight);
        expect(result.taxes).toBeCloseTo(100 * 0.08, 1);
      });
    });

    describe('fee calculation', () => {
      it('includes base fees for domestic nonstop', () => {
        const flight = makeFlight({ stops: 0 });
        const result = calc.calculateFullPrice(flight);
        expect(result.fees).toBeGreaterThan(0);
      });

      it('adds additional PFC for stops', () => {
        const noStops = calc.calculateFullPrice(makeFlight({ stops: 0 }));
        const oneStop = calc.calculateFullPrice(makeFlight({ stops: 1 }));
        expect(oneStop.fees).toBeGreaterThan(noStops.fees);
      });

      it('adds international fee bundle for international routes', () => {
        const domestic = calc.calculateFullPrice(makeFlight());
        const international = calc.calculateFullPrice(makeFlight({
          destination: { code: 'LHR', city: 'London', name: 'LHR', country: 'United Kingdom' },
        }));
        expect(international.fees).toBeGreaterThan(domestic.fees);
      });

      it('applies higher fuel surcharge for baseFare > 200', () => {
        const low = calc.calculateFullPrice(makeFlight({ price: 50 }));
        const high = calc.calculateFullPrice(makeFlight({ price: 300 }));
        expect(high.fees).toBeGreaterThan(low.fees);
      });

      it('applies medium fuel surcharge for baseFare 100-200', () => {
        const flight = makeFlight({ price: 150 });
        const result = calc.calculateFullPrice(flight);
        expect(result.fees).toBeGreaterThan(0);
      });

      it('applies low fuel surcharge for baseFare <= 100', () => {
        const flight = makeFlight({ price: 50 });
        const result = calc.calculateFullPrice(flight);
        expect(result.fees).toBeGreaterThan(0);
      });

      it('adds carrier surcharge for international flights', () => {
        const flight = makeFlight({
          destination: { code: 'LHR', city: 'London', name: 'LHR', country: 'United Kingdom' },
        });
        const result = calc.calculateFullPrice(flight);
        expect(result.fees).toBeGreaterThan(0);
      });

      it('adds carrier surcharge for flights with >1 stop (domestic)', () => {
        const oneStop = calc.calculateFullPrice(makeFlight({ stops: 1 }));
        const twoStops = calc.calculateFullPrice(makeFlight({ stops: 2 }));
        expect(twoStops.fees).toBeGreaterThan(oneStop.fees);
      });
    });

    describe('discount calculation', () => {
      it('applies sale discount when originalPrice > price', () => {
        const flight = makeFlight({ price: 200, originalPrice: 300 });
        const result = calc.calculateFullPrice(flight);
        expect(result.discount).toBeGreaterThan(0);
      });

      it('no sale discount when originalPrice equals price', () => {
        const flight = makeFlight({ price: 200, originalPrice: 200 });
        const result = calc.calculateFullPrice(flight);
        expect(result.discount).toBe(0);
      });

      it('applies member discount when subtotal >= 500', () => {
        const flight = makeFlight({ price: 500, originalPrice: 500 });
        const result = calc.calculateFullPrice(flight, true);
        expect(result.memberSavings).toBeGreaterThan(0);
      });

      it('no member discount for non-members', () => {
        const flight = makeFlight({ price: 500, originalPrice: 500 });
        const result = calc.calculateFullPrice(flight, false);
        expect(result.memberSavings).toBe(0);
      });

      it('no member discount when subtotal < 500', () => {
        const flight = makeFlight({ price: 50, originalPrice: 50 });
        const result = calc.calculateFullPrice(flight, true);
        expect(result.memberSavings).toBe(0);
      });

      it('applies high availability discount when seatsLeft > 10', () => {
        const low = calc.calculateFullPrice(makeFlight({ seatsLeft: 5 }));
        const high = calc.calculateFullPrice(makeFlight({ seatsLeft: 15 }));
        expect(high.discount).toBeGreaterThan(low.discount);
      });
    });

    describe('loyalty points', () => {
      it('earns zero points for non-members', () => {
        const flight = makeFlight({ price: 200 });
        const result = calc.calculateFullPrice(flight, false);
        expect(result.loyaltyPoints).toBe(0);
      });

      it('earns points for members', () => {
        const flight = makeFlight({ price: 200 });
        const result = calc.calculateFullPrice(flight, true);
        expect(result.loyaltyPoints).toBeGreaterThan(0);
      });

      it('earns 1.5x points for international routes', () => {
        const domestic = calc.calculateFullPrice(makeFlight({ price: 200 }), true);
        const international = calc.calculateFullPrice(
          makeFlight({
            price: 200,
            destination: { code: 'LHR', city: 'London', name: 'LHR', country: 'United Kingdom' },
          }),
          true,
        );
        expect(international.loyaltyPoints).toBeGreaterThan(domestic.loyaltyPoints);
      });

      it('earns 1.25x bonus during peak season', () => {
        vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
        const offPeakCalc = new PriceCalculator();
        const offPeak = offPeakCalc.calculateFullPrice(makeFlight({ price: 200 }), true);

        vi.setSystemTime(new Date('2024-07-15T12:00:00Z'));
        const peakCalc = new PriceCalculator();
        const peak = peakCalc.calculateFullPrice(makeFlight({ price: 200 }), true);

        expect(peak.loyaltyPoints).toBeGreaterThan(offPeak.loyaltyPoints);
      });
    });

    describe('rounding rules', () => {
      it('rounds to two decimal places', () => {
        const flight = makeFlight({ price: 133 });
        const result = calc.calculateFullPrice(flight);
        const decimalPlaces = (result.total.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });

      it('returns USD as currency', () => {
        const flight = makeFlight();
        const result = calc.calculateFullPrice(flight);
        expect(result.currency).toBe('USD');
      });
    });

    describe('input validation', () => {
      it('returns zero breakdown for negative price', () => {
        const flight = makeFlight({ price: -100 });
        const result = calc.calculateFullPrice(flight);
        expect(result.total).toBe(0);
        expect(result.baseFare).toBe(0);
      });

      it('returns zero breakdown for negative stops', () => {
        const flight = makeFlight({ stops: -1 });
        const result = calc.calculateFullPrice(flight);
        expect(result.total).toBe(0);
      });

      it('returns valid result for zero price', () => {
        const flight = makeFlight({ price: 0 });
        const result = calc.calculateFullPrice(flight);
        expect(result.baseFare).toBe(0);
      });
    });

    describe('state reset between calls', () => {
      it('produces consistent results across multiple calls', () => {
        const flight = makeFlight({ price: 250 });
        const result1 = calc.calculateFullPrice(flight);
        const result2 = calc.calculateFullPrice(flight);
        expect(result1.total).toBe(result2.total);
        expect(result1.baseFare).toBe(result2.baseFare);
        expect(result1.taxes).toBe(result2.taxes);
        expect(result1.fees).toBe(result2.fees);
      });

      it('resets between different flights', () => {
        const intl = makeFlight({
          price: 500,
          destination: { code: 'LHR', city: 'London', name: 'LHR', country: 'United Kingdom' },
        });
        calc.calculateFullPrice(intl, true);

        const domestic = makeFlight({ price: 100 });
        const result = calc.calculateFullPrice(domestic, false);
        expect(result.loyaltyPoints).toBe(0);
        expect(result.memberSavings).toBe(0);
      });
    });
  });

  describe('calculateBatchPrices', () => {
    it('returns empty array for empty input', () => {
      expect(calc.calculateBatchPrices([])).toEqual([]);
    });

    it('returns breakdown for each flight', () => {
      const flights = [makeFlight({ price: 100 }), makeFlight({ price: 200 }), makeFlight({ price: 300 })];
      const results = calc.calculateBatchPrices(flights);
      expect(results).toHaveLength(3);
      expect(results[0].total).toBeLessThan(results[2].total);
    });

    it('applies member pricing to all flights', () => {
      const flights = [makeFlight({ price: 500 }), makeFlight({ price: 600 })];
      const nonMember = calc.calculateBatchPrices(flights, false);
      const member = calc.calculateBatchPrices(flights, true);
      expect(member[0].memberSavings).toBeGreaterThanOrEqual(0);
      expect(nonMember[0].memberSavings).toBe(0);
    });
  });

  describe('findCheapestFlight', () => {
    it('returns null for empty array', () => {
      expect(calc.findCheapestFlight([])).toBeNull();
    });

    it('finds the cheapest flight', () => {
      const flights = [
        makeFlight({ id: 'F1', price: 300 }),
        makeFlight({ id: 'F2', price: 100 }),
        makeFlight({ id: 'F3', price: 200 }),
      ];
      const result = calc.findCheapestFlight(flights);
      expect(result).not.toBeNull();
      expect(result!.flight.id).toBe('F2');
    });

    it('returns breakdown for cheapest flight', () => {
      const flights = [makeFlight({ price: 150 })];
      const result = calc.findCheapestFlight(flights);
      expect(result!.breakdown.total).toBeGreaterThan(0);
    });

    it('considers member pricing', () => {
      const flights = [makeFlight({ price: 600 }), makeFlight({ price: 500 })];
      const result = calc.findCheapestFlight(flights, true);
      expect(result).not.toBeNull();
      expect(result!.flight.price).toBe(500);
    });
  });

  describe('sortByPrice', () => {
    it('returns empty array for empty input', () => {
      expect(calc.sortByPrice([])).toEqual([]);
    });

    it('sorts ascending by default', () => {
      const flights = [
        makeFlight({ id: 'F1', price: 300 }),
        makeFlight({ id: 'F2', price: 100 }),
        makeFlight({ id: 'F3', price: 200 }),
      ];
      const sorted = calc.sortByPrice(flights);
      expect(sorted[0].id).toBe('F2');
      expect(sorted[1].id).toBe('F3');
      expect(sorted[2].id).toBe('F1');
    });

    it('sorts descending when specified', () => {
      const flights = [
        makeFlight({ id: 'F1', price: 300 }),
        makeFlight({ id: 'F2', price: 100 }),
        makeFlight({ id: 'F3', price: 200 }),
      ];
      const sorted = calc.sortByPrice(flights, false, false);
      expect(sorted[0].id).toBe('F1');
      expect(sorted[2].id).toBe('F2');
    });

    it('handles single element', () => {
      const flights = [makeFlight({ id: 'F1', price: 100 })];
      const sorted = calc.sortByPrice(flights);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('F1');
    });
  });

  describe('getCalculationLog', () => {
    it('returns log entries after calculation', () => {
      calc.calculateFullPrice(makeFlight());
      const log = calc.getCalculationLog();
      expect(log.length).toBeGreaterThan(0);
    });
  });

  describe('getErrorLog', () => {
    it('returns errors for invalid input', () => {
      calc.calculateFullPrice(makeFlight({ price: -1 }));
      const errors = calc.getErrorLog();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('returns empty for valid input', () => {
      calc.calculateFullPrice(makeFlight());
      const errors = calc.getErrorLog();
      expect(errors).toEqual([]);
    });
  });

  describe('getAppliedRules', () => {
    it('tracks applied rules', () => {
      calc.calculateFullPrice(makeFlight({ price: 200, originalPrice: 300 }));
      const rules = calc.getAppliedRules();
      expect(rules).toContain('SALE_DISCOUNT');
      expect(rules).toContain('FUEL_SURCHARGE');
    });
  });
});

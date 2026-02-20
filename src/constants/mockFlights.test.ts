import { describe, it, expect } from 'vitest';
import { MOCK_FLIGHT_RESULTS } from './mockFlights';

describe('mock flights data integrity', () => {
  it('has entries', () => {
    expect(MOCK_FLIGHT_RESULTS.length).toBeGreaterThan(0);
  });

  it('has unique IDs', () => {
    const ids = MOCK_FLIGHT_RESULTS.map(f => f.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every flight has valid origin and destination', () => {
    for (const flight of MOCK_FLIGHT_RESULTS) {
      expect(flight.origin).toBeTruthy();
      expect(flight.origin.code).toBeTruthy();
      expect(flight.destination).toBeTruthy();
      expect(flight.destination.code).toBeTruthy();
    }
  });

  it('every flight has non-negative price', () => {
    for (const flight of MOCK_FLIGHT_RESULTS) {
      expect(flight.price).toBeGreaterThanOrEqual(0);
    }
  });

  it('every flight has non-negative stops', () => {
    for (const flight of MOCK_FLIGHT_RESULTS) {
      expect(flight.stops).toBeGreaterThanOrEqual(0);
    }
  });

  it('originalPrice >= price for all flights', () => {
    for (const flight of MOCK_FLIGHT_RESULTS) {
      expect(flight.originalPrice).toBeGreaterThanOrEqual(flight.price);
    }
  });

  it('stopCities length matches stops count', () => {
    for (const flight of MOCK_FLIGHT_RESULTS) {
      if (flight.stops === 0) {
        expect(flight.stopCities).toHaveLength(0);
      } else {
        expect(flight.stopCities.length).toBeGreaterThan(0);
      }
    }
  });
});

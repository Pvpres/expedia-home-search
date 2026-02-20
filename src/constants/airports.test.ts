import { describe, it, expect } from 'vitest';
import { AIRPORTS } from './airports';

describe('airports data integrity', () => {
  it('has entries', () => {
    expect(AIRPORTS.length).toBeGreaterThan(0);
  });

  it('has unique airport codes', () => {
    const codes = AIRPORTS.map(a => a.code);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it('every airport has required fields', () => {
    for (const airport of AIRPORTS) {
      expect(airport.code).toBeTruthy();
      expect(airport.city).toBeTruthy();
      expect(airport.name).toBeTruthy();
      expect(airport.country).toBeTruthy();
    }
  });

  it('codes are 3-letter uppercase', () => {
    for (const airport of AIRPORTS) {
      expect(airport.code).toMatch(/^[A-Z]{3}$/);
    }
  });
});

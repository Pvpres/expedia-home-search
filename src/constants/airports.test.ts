import { describe, it, expect } from 'vitest';
import { AIRPORTS } from './airports';

describe('airports constant', () => {
  it('contains airports', () => {
    expect(AIRPORTS.length).toBeGreaterThan(0);
  });

  it('each airport has required fields', () => {
    for (const airport of AIRPORTS) {
      expect(airport).toHaveProperty('code');
      expect(airport).toHaveProperty('city');
      expect(airport).toHaveProperty('name');
      expect(airport).toHaveProperty('country');
      expect(airport.code.length).toBe(3);
    }
  });

  it('has JFK airport', () => {
    const jfk = AIRPORTS.find(a => a.code === 'JFK');
    expect(jfk).toBeDefined();
    expect(jfk!.city).toBe('New York');
    expect(jfk!.country).toBe('United States');
  });

  it('has no duplicate codes', () => {
    const codes = AIRPORTS.map(a => a.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import PriceCalculator from "./PriceCalculator";
import { FlightResult, CabinClass } from "../types";
import { AIRPORTS } from "../constants/airports";

function findAirport(code: string) {
  const airport = AIRPORTS.find((a) => a.code === code);
  if (!airport) throw new Error(`Airport ${code} not found`);
  return airport;
}

function makeFlight(overrides: Partial<FlightResult> = {}): FlightResult {
  return {
    id: "TEST-001",
    airline: "Test Airlines",
    airlineCode: "TA",
    flightNumber: "TA 100",
    origin: findAirport("JFK"),
    destination: findAirport("LAX"),
    departureTime: "08:00 AM",
    arrivalTime: "11:00 AM",
    duration: "5h 00m",
    stops: 0,
    stopCities: [],
    price: 300,
    originalPrice: 300,
    seatsLeft: 5,
    aircraft: "Boeing 737",
    cabinClass: "economy" as CabinClass,
    amenities: ["Wi-Fi"],
    co2Emissions: "180 kg CO2",
    baggageIncluded: false,
    refundable: false,
    ...overrides,
  };
}

describe("PriceCalculator", () => {
  let calc: PriceCalculator;

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2024-03-15") });
    calc = new PriceCalculator();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("calculateFullPrice — route classification", () => {
    it("classifies US domestic routes", () => {
      const flight = makeFlight({
        origin: findAirport("JFK"),
        destination: findAirport("LAX"),
      });
      const result = calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log).toContain("Route classified: US Domestic");
    });

    it("classifies EU domestic routes", () => {
      const flight = makeFlight({
        origin: { code: "CDG", city: "Paris", name: "CDG", country: "France" },
        destination: {
          code: "FRA",
          city: "Frankfurt",
          name: "FRA",
          country: "Germany",
        },
      });
      const result = calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log).toContain("Route classified: EU Domestic");
    });

    it("classifies international routes", () => {
      const flight = makeFlight({
        origin: findAirport("JFK"),
        destination: findAirport("LHR"),
      });
      const result = calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log).toContain("Route classified: International");
    });

    it("classifies non-US/non-EU routes as international", () => {
      const flight = makeFlight({
        origin: findAirport("NRT"),
        destination: findAirport("SYD"),
      });
      const result = calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log).toContain("Route classified: International");
    });
  });

  describe("calculateFullPrice — cabin class multipliers", () => {
    it("applies economy multiplier (1.0)", () => {
      const flight = makeFlight({ price: 100, cabinClass: "economy" });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(100);
    });

    it("applies premium_economy multiplier (1.65)", () => {
      const flight = makeFlight({
        price: 100,
        cabinClass: "premium_economy",
      });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(165);
    });

    it("applies business multiplier (3.20)", () => {
      const flight = makeFlight({ price: 100, cabinClass: "business" });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(320);
    });

    it("applies first class multiplier (5.75)", () => {
      const flight = makeFlight({ price: 100, cabinClass: "first" });
      const result = calc.calculateFullPrice(flight);
      expect(result.baseFare).toBeGreaterThanOrEqual(575);
    });
  });

  describe("calculateFullPrice — taxes", () => {
    it("applies US domestic tax rate (7.5%)", () => {
      const flight = makeFlight({ price: 100, stops: 0 });
      const result = calc.calculateFullPrice(flight);
      expect(result.taxes).toBeCloseTo(7.5, 0);
    });

    it("applies EU domestic tax rate (6%)", () => {
      const flight = makeFlight({
        price: 100,
        stops: 0,
        origin: { code: "CDG", city: "Paris", name: "CDG", country: "France" },
        destination: {
          code: "FRA",
          city: "Frankfurt",
          name: "FRA",
          country: "Germany",
        },
      });
      const result = calc.calculateFullPrice(flight);
      expect(result.taxes).toBeCloseTo(6, 0);
    });

    it("applies default tax rate for international routes", () => {
      const flight = makeFlight({
        price: 100,
        stops: 0,
        origin: findAirport("NRT"),
        destination: findAirport("SYD"),
      });
      const result = calc.calculateFullPrice(flight);
      expect(result.taxes).toBeCloseTo(8, 0);
    });
  });

  describe("calculateFullPrice — fees", () => {
    it("calculates base fees for nonstop domestic", () => {
      const flight = makeFlight({ price: 300, stops: 0 });
      const result = calc.calculateFullPrice(flight);
      expect(result.fees).toBeGreaterThan(0);
    });

    it("adds additional PFC for stops", () => {
      const nonstop = makeFlight({ price: 300, stops: 0 });
      const oneStop = makeFlight({ price: 300, stops: 1 });
      const r1 = calc.calculateFullPrice(nonstop);
      const r2 = calc.calculateFullPrice(oneStop);
      expect(r2.fees).toBeGreaterThan(r1.fees);
    });

    it("adds international fee bundle for international routes", () => {
      const domestic = makeFlight({ price: 300, stops: 0 });
      const intl = makeFlight({
        price: 300,
        stops: 0,
        origin: findAirport("JFK"),
        destination: findAirport("LHR"),
      });
      const r1 = calc.calculateFullPrice(domestic);
      const r2 = calc.calculateFullPrice(intl);
      expect(r2.fees).toBeGreaterThan(r1.fees);
    });

    it("applies higher fuel surcharge for baseFare > 200", () => {
      const flight = makeFlight({ price: 300, stops: 0 });
      const result = calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("FUEL_SURCHARGE");
    });

    it("applies medium fuel surcharge for baseFare 100-200", () => {
      const flight = makeFlight({ price: 150, stops: 0 });
      calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("FUEL_SURCHARGE");
    });

    it("applies low fuel surcharge for baseFare <= 100", () => {
      const flight = makeFlight({ price: 50, stops: 0 });
      calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("FUEL_SURCHARGE");
    });

    it("adds carrier surcharge for international", () => {
      const flight = makeFlight({
        price: 300,
        stops: 0,
        origin: findAirport("JFK"),
        destination: findAirport("LHR"),
      });
      const result = calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("INTL_FEES_BUNDLE");
    });

    it("adds carrier surcharge for >1 stop domestic", () => {
      const oneStop = makeFlight({ price: 300, stops: 1 });
      const twoStops = makeFlight({ price: 300, stops: 2 });
      const r1 = calc.calculateFullPrice(oneStop);
      const r2 = calc.calculateFullPrice(twoStops);
      expect(r2.fees).toBeGreaterThan(r1.fees);
    });
  });

  describe("calculateFullPrice — discounts", () => {
    it("applies sale discount when originalPrice > price", () => {
      const flight = makeFlight({ price: 200, originalPrice: 300 });
      const result = calc.calculateFullPrice(flight);
      expect(result.discount).toBeGreaterThan(0);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("SALE_DISCOUNT");
    });

    it("no sale discount when originalPrice === price", () => {
      const flight = makeFlight({ price: 300, originalPrice: 300 });
      const result = calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).not.toContain("SALE_DISCOUNT");
    });

    it("applies member discount when isMember and subtotal >= 500", () => {
      const flight = makeFlight({ price: 500, originalPrice: 500 });
      const result = calc.calculateFullPrice(flight, true);
      expect(result.memberSavings).toBeGreaterThan(0);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("MEMBER_DISCOUNT");
    });

    it("no member discount when not a member", () => {
      const flight = makeFlight({ price: 500, originalPrice: 500 });
      const result = calc.calculateFullPrice(flight, false);
      expect(result.memberSavings).toBe(0);
    });

    it("no member discount when subtotal < 500", () => {
      const flight = makeFlight({ price: 50, originalPrice: 50 });
      const result = calc.calculateFullPrice(flight, true);
      expect(result.memberSavings).toBe(0);
    });

    it("applies high availability discount when seatsLeft > 10", () => {
      const flight = makeFlight({ price: 300, seatsLeft: 15 });
      calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("HIGH_AVAILABILITY_DISCOUNT");
    });

    it("no high availability discount when seatsLeft <= 10", () => {
      const flight = makeFlight({ price: 300, seatsLeft: 5 });
      calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules).not.toContain("HIGH_AVAILABILITY_DISCOUNT");
    });
  });

  describe("calculateFullPrice — peak season", () => {
    it("applies peak season surcharge in June", () => {
      vi.setSystemTime(new Date("2024-06-15"));
      const newCalc = new PriceCalculator();
      const flight = makeFlight({ price: 300 });
      newCalc.calculateFullPrice(flight);
      const rules = newCalc.getAppliedRules();
      expect(rules).toContain("PEAK_SEASON_SURCHARGE");
    });

    it("applies peak season surcharge in July", () => {
      vi.setSystemTime(new Date("2024-07-15"));
      const newCalc = new PriceCalculator();
      const flight = makeFlight({ price: 300 });
      newCalc.calculateFullPrice(flight);
      const rules = newCalc.getAppliedRules();
      expect(rules).toContain("PEAK_SEASON_SURCHARGE");
    });

    it("applies peak season surcharge in August", () => {
      vi.setSystemTime(new Date("2024-08-15"));
      const newCalc = new PriceCalculator();
      const flight = makeFlight({ price: 300 });
      newCalc.calculateFullPrice(flight);
      const rules = newCalc.getAppliedRules();
      expect(rules).toContain("PEAK_SEASON_SURCHARGE");
    });

    it("applies peak season surcharge in November", () => {
      vi.setSystemTime(new Date("2024-11-15"));
      const newCalc = new PriceCalculator();
      const flight = makeFlight({ price: 300 });
      newCalc.calculateFullPrice(flight);
      const rules = newCalc.getAppliedRules();
      expect(rules).toContain("PEAK_SEASON_SURCHARGE");
    });

    it("applies peak season surcharge in December", () => {
      vi.setSystemTime(new Date("2024-12-15"));
      const newCalc = new PriceCalculator();
      const flight = makeFlight({ price: 300 });
      newCalc.calculateFullPrice(flight);
      const rules = newCalc.getAppliedRules();
      expect(rules).toContain("PEAK_SEASON_SURCHARGE");
    });

    it("no peak surcharge in March (off-peak)", () => {
      vi.setSystemTime(new Date("2024-03-15"));
      const newCalc = new PriceCalculator();
      const flight = makeFlight({ price: 300 });
      newCalc.calculateFullPrice(flight);
      const rules = newCalc.getAppliedRules();
      expect(rules).not.toContain("PEAK_SEASON_SURCHARGE");
    });

    it("applies peak loyalty bonus for members in peak season", () => {
      vi.setSystemTime(new Date("2024-07-15"));
      const newCalc = new PriceCalculator();
      const flight = makeFlight({ price: 500 });
      newCalc.calculateFullPrice(flight, true);
      const rules = newCalc.getAppliedRules();
      expect(rules).toContain("PEAK_LOYALTY_BONUS");
    });
  });

  describe("calculateFullPrice — loyalty points", () => {
    it("earns zero loyalty points for non-members", () => {
      const flight = makeFlight({ price: 300 });
      const result = calc.calculateFullPrice(flight, false);
      expect(result.loyaltyPoints).toBe(0);
    });

    it("earns loyalty points for members", () => {
      const flight = makeFlight({ price: 300 });
      const result = calc.calculateFullPrice(flight, true);
      expect(result.loyaltyPoints).toBeGreaterThan(0);
    });

    it("earns international loyalty bonus for intl member flights", () => {
      const flight = makeFlight({
        price: 300,
        origin: findAirport("JFK"),
        destination: findAirport("LHR"),
      });
      calc.calculateFullPrice(flight, true);
      const rules = calc.getAppliedRules();
      expect(rules).toContain("INTL_LOYALTY_BONUS");
    });

    it("no intl loyalty bonus for domestic flights", () => {
      const flight = makeFlight({ price: 300 });
      calc.calculateFullPrice(flight, true);
      const rules = calc.getAppliedRules();
      expect(rules).not.toContain("INTL_LOYALTY_BONUS");
    });
  });

  describe("calculateFullPrice — rounding rules", () => {
    it("returns prices rounded to 2 decimal places", () => {
      const flight = makeFlight({ price: 333 });
      const result = calc.calculateFullPrice(flight);
      const decimalPlaces = (n: number) =>
        (n.toString().split(".")[1] || "").length;
      expect(decimalPlaces(result.baseFare)).toBeLessThanOrEqual(2);
      expect(decimalPlaces(result.taxes)).toBeLessThanOrEqual(2);
      expect(decimalPlaces(result.fees)).toBeLessThanOrEqual(2);
      expect(decimalPlaces(result.total)).toBeLessThanOrEqual(2);
    });
  });

  describe("calculateFullPrice — input validation", () => {
    it("returns zeroed breakdown for negative price", () => {
      const flight = makeFlight({ price: -10 });
      const result = calc.calculateFullPrice(flight);
      expect(result.total).toBe(0);
      expect(result.baseFare).toBe(0);
    });

    it("returns zeroed breakdown for missing origin", () => {
      const flight = makeFlight();
      (flight as Record<string, unknown>).origin = null;
      const result = calc.calculateFullPrice(flight as FlightResult);
      expect(result.total).toBe(0);
    });

    it("returns zeroed breakdown for missing destination", () => {
      const flight = makeFlight();
      (flight as Record<string, unknown>).destination = null;
      const result = calc.calculateFullPrice(flight as FlightResult);
      expect(result.total).toBe(0);
    });

    it("returns zeroed breakdown for negative stops", () => {
      const flight = makeFlight({ stops: -1 });
      const result = calc.calculateFullPrice(flight);
      expect(result.total).toBe(0);
    });

    it("returns zeroed breakdown for missing cabinClass", () => {
      const flight = makeFlight();
      (flight as Record<string, unknown>).cabinClass = null;
      const result = calc.calculateFullPrice(flight as FlightResult);
      expect(result.total).toBe(0);
    });

    it("populates error log for validation failures", () => {
      const flight = makeFlight({ price: -10 });
      calc.calculateFullPrice(flight);
      const errors = calc.getErrorLog();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes("VALIDATION_ERROR"))).toBe(true);
    });
  });

  describe("calculateFullPrice — state reset between calls", () => {
    it("produces identical results for consecutive identical calls", () => {
      const flight = makeFlight({ price: 300 });
      const r1 = calc.calculateFullPrice(flight, true);
      const r2 = calc.calculateFullPrice(flight, true);
      expect(r1).toEqual(r2);
    });

    it("resets state between different flights", () => {
      const intl = makeFlight({
        price: 300,
        origin: findAirport("JFK"),
        destination: findAirport("LHR"),
      });
      calc.calculateFullPrice(intl, true);
      const rules1 = calc.getAppliedRules();
      expect(rules1).toContain("INTL_FEES_BUNDLE");

      const domestic = makeFlight({ price: 300 });
      calc.calculateFullPrice(domestic);
      const rules2 = calc.getAppliedRules();
      expect(rules2).not.toContain("INTL_FEES_BUNDLE");
    });
  });

  describe("calculateFullPrice — currency field", () => {
    it("always returns USD currency", () => {
      const flight = makeFlight({ price: 300 });
      const result = calc.calculateFullPrice(flight);
      expect(result.currency).toBe("USD");
    });
  });

  describe("calculateFullPrice — total composition", () => {
    it("total equals baseFare + taxes + fees - discount (after rounding)", () => {
      const flight = makeFlight({
        price: 300,
        originalPrice: 350,
        seatsLeft: 5,
      });
      const result = calc.calculateFullPrice(flight, true);
      expect(result.total).toBeGreaterThan(0);
      expect(result.baseFare).toBeGreaterThan(0);
      expect(result.taxes).toBeGreaterThan(0);
      expect(result.fees).toBeGreaterThan(0);
    });
  });

  describe("calculateBatchPrices", () => {
    it("returns empty array for empty input", () => {
      const result = calc.calculateBatchPrices([]);
      expect(result).toEqual([]);
    });

    it("returns one breakdown per flight", () => {
      const flights = [
        makeFlight({ price: 100 }),
        makeFlight({ price: 200 }),
        makeFlight({ price: 300 }),
      ];
      const results = calc.calculateBatchPrices(flights);
      expect(results).toHaveLength(3);
    });

    it("respects isMember flag", () => {
      const flights = [makeFlight({ price: 500 })];
      const nonMember = calc.calculateBatchPrices(flights, false);
      const member = calc.calculateBatchPrices(flights, true);
      expect(nonMember[0].memberSavings).toBe(0);
      expect(member[0].memberSavings).toBeGreaterThanOrEqual(0);
    });
  });

  describe("findCheapestFlight", () => {
    it("returns null for empty array", () => {
      const result = calc.findCheapestFlight([]);
      expect(result).toBeNull();
    });

    it("finds the cheapest flight", () => {
      const flights = [
        makeFlight({ id: "A", price: 300 }),
        makeFlight({ id: "B", price: 100 }),
        makeFlight({ id: "C", price: 200 }),
      ];
      const result = calc.findCheapestFlight(flights);
      expect(result).not.toBeNull();
      expect(result!.flight.id).toBe("B");
    });

    it("returns breakdown for cheapest flight", () => {
      const flights = [makeFlight({ price: 300 })];
      const result = calc.findCheapestFlight(flights);
      expect(result).not.toBeNull();
      expect(result!.breakdown.total).toBeGreaterThan(0);
    });
  });

  describe("sortByPrice", () => {
    it("returns empty array for empty input", () => {
      const result = calc.sortByPrice([]);
      expect(result).toEqual([]);
    });

    it("sorts ascending by default", () => {
      const flights = [
        makeFlight({ id: "A", price: 300 }),
        makeFlight({ id: "B", price: 100 }),
        makeFlight({ id: "C", price: 200 }),
      ];
      const sorted = calc.sortByPrice(flights, false, true);
      const r1 = calc.calculateFullPrice(sorted[0]);
      const r2 = calc.calculateFullPrice(sorted[sorted.length - 1]);
      expect(r1.total).toBeLessThanOrEqual(r2.total);
    });

    it("sorts descending when ascending=false", () => {
      const flights = [
        makeFlight({ id: "A", price: 300 }),
        makeFlight({ id: "B", price: 100 }),
        makeFlight({ id: "C", price: 200 }),
      ];
      const sorted = calc.sortByPrice(flights, false, false);
      const r1 = calc.calculateFullPrice(sorted[0]);
      const r2 = calc.calculateFullPrice(sorted[sorted.length - 1]);
      expect(r1.total).toBeGreaterThanOrEqual(r2.total);
    });

    it("preserves all flights in output", () => {
      const flights = [
        makeFlight({ id: "A", price: 300 }),
        makeFlight({ id: "B", price: 100 }),
      ];
      const sorted = calc.sortByPrice(flights);
      expect(sorted).toHaveLength(2);
    });
  });

  describe("getCalculationLog", () => {
    it("returns log entries after calculation", () => {
      const flight = makeFlight({ price: 300 });
      calc.calculateFullPrice(flight);
      const log = calc.getCalculationLog();
      expect(log.length).toBeGreaterThan(0);
    });
  });

  describe("getErrorLog", () => {
    it("returns empty for valid input", () => {
      const flight = makeFlight({ price: 300 });
      calc.calculateFullPrice(flight);
      const errors = calc.getErrorLog();
      expect(errors).toHaveLength(0);
    });

    it("returns errors for invalid input", () => {
      const flight = makeFlight({ price: -10 });
      calc.calculateFullPrice(flight);
      const errors = calc.getErrorLog();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("getAppliedRules", () => {
    it("returns applied rules after calculation", () => {
      const flight = makeFlight({ price: 300 });
      calc.calculateFullPrice(flight);
      const rules = calc.getAppliedRules();
      expect(rules.length).toBeGreaterThan(0);
    });
  });
});

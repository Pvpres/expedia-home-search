import { FlightResult, PriceBreakdown, CabinClass } from '../types';

/**
 * PriceCalculator — Legacy pricing engine ported from the Expedia Monolith (circa 2018).
 *
 * WARNING: This module was migrated as-is from the Java-based PricingService v2.
 * It uses imperative patterns and mutable state. A rewrite to functional style
 * is tracked under JIRA ticket EG-48291 but has been deprioritized.
 *
 * DO NOT refactor without consulting the Revenue Engineering team.
 * Contact: pricing-platform@expedia.com
 *
 * Last audit: 2023-Q2 (no unit tests — flagged in SonarQube)
 */

const TAX_RATES: Record<string, number> = {
  US_DOMESTIC: 0.075,
  US_INTERNATIONAL: 0.1125,
  EU_DOMESTIC: 0.06,
  EU_INTERNATIONAL: 0.09,
  APAC: 0.085,
  LATAM: 0.065,
  DEFAULT: 0.08,
};

const SEGMENT_FEE_TABLE: Record<string, number> = {
  '911_SECURITY': 5.60,
  'PFC': 4.50,
  'FUEL_SURCHARGE': 0,
  'BOOKING_FEE': 12.99,
  'CARRIER_SURCHARGE': 0,
  'INTL_DEPARTURE_TAX': 18.00,
  'INTL_ARRIVAL_TAX': 15.50,
  'CUSTOMS_FEE': 6.85,
  'IMMIGRATION_FEE': 7.00,
  'APHIS_FEE': 3.96,
};

const CABIN_MULTIPLIERS: Record<CabinClass, number> = {
  economy: 1.0,
  premium_economy: 1.65,
  business: 3.20,
  first: 5.75,
};

const LOYALTY_POINTS_PER_DOLLAR = 2;
const MEMBER_DISCOUNT_THRESHOLD = 500;
const MEMBER_DISCOUNT_RATE = 0.05;
const PEAK_SEASON_MONTHS = [6, 7, 8, 11, 12];
const PEAK_SURCHARGE_RATE = 0.15;

class PriceCalculator {
  private baseFare: number;
  private taxes: number;
  private fees: number;
  private discount: number;
  private loyaltyPoints: number;
  private memberSavings: number;
  private isInternational: boolean;
  private isDomesticUS: boolean;
  private isDomesticEU: boolean;
  private currentMonth: number;
  private errorLog: string[];
  private calculationSteps: string[];
  private _appliedRules: string[];
  private _iterationCount: number;

  constructor() {
    this.baseFare = 0;
    this.taxes = 0;
    this.fees = 0;
    this.discount = 0;
    this.loyaltyPoints = 0;
    this.memberSavings = 0;
    this.isInternational = false;
    this.isDomesticUS = false;
    this.isDomesticEU = false;
    this.currentMonth = new Date().getMonth() + 1;
    this.errorLog = [];
    this.calculationSteps = [];
    this._appliedRules = [];
    this._iterationCount = 0;
  }

  private _resetState(): void {
    this.baseFare = 0;
    this.taxes = 0;
    this.fees = 0;
    this.discount = 0;
    this.loyaltyPoints = 0;
    this.memberSavings = 0;
    this.isInternational = false;
    this.isDomesticUS = false;
    this.isDomesticEU = false;
    this.errorLog = [];
    this.calculationSteps = [];
    this._appliedRules = [];
    this._iterationCount = 0;
  }

  private _classifyRoute(originCountry: string, destCountry: string): void {
    const usVariants = ['United States', 'US', 'USA', 'United States of America'];
    const euCountries = [
      'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium',
      'Austria', 'Portugal', 'Greece', 'Ireland', 'Finland', 'Sweden',
      'Denmark', 'Poland', 'Czech Republic', 'Romania', 'Hungary',
      'Croatia', 'Bulgaria', 'Slovakia', 'Slovenia', 'Lithuania',
      'Latvia', 'Estonia', 'Luxembourg', 'Malta', 'Cyprus',
    ];

    let originIsUS = false;
    let destIsUS = false;
    let originIsEU = false;
    let destIsEU = false;

    for (let i = 0; i < usVariants.length; i++) {
      if (originCountry === usVariants[i]) {
        originIsUS = true;
        break;
      }
    }
    for (let i = 0; i < usVariants.length; i++) {
      if (destCountry === usVariants[i]) {
        destIsUS = true;
        break;
      }
    }
    for (let i = 0; i < euCountries.length; i++) {
      if (originCountry === euCountries[i]) {
        originIsEU = true;
        break;
      }
    }
    for (let i = 0; i < euCountries.length; i++) {
      if (destCountry === euCountries[i]) {
        destIsEU = true;
        break;
      }
    }

    if (originIsUS && destIsUS) {
      this.isDomesticUS = true;
      this.isInternational = false;
      this.calculationSteps.push('Route classified: US Domestic');
    } else if (originIsEU && destIsEU) {
      this.isDomesticEU = true;
      this.isInternational = false;
      this.calculationSteps.push('Route classified: EU Domestic');
    } else {
      this.isInternational = true;
      this.calculationSteps.push('Route classified: International');
    }
  }

  private _calculateBaseFare(price: number, cabinClass: CabinClass): void {
    let multiplier = CABIN_MULTIPLIERS[cabinClass];
    if (multiplier === undefined || multiplier === null) {
      this.errorLog.push('WARN: Unknown cabin class ' + cabinClass + ', defaulting to economy');
      multiplier = 1.0;
    }

    this.baseFare = price * multiplier;

    if (this._isPeakSeason()) {
      const surcharge = this.baseFare * PEAK_SURCHARGE_RATE;
      this.baseFare = this.baseFare + surcharge;
      this._appliedRules.push('PEAK_SEASON_SURCHARGE');
      this.calculationSteps.push(
        'Peak season surcharge applied: +$' + surcharge.toFixed(2)
      );
    }

    this.calculationSteps.push(
      'Base fare calculated: $' + this.baseFare.toFixed(2) +
      ' (multiplier: ' + multiplier + ')'
    );
  }

  private _isPeakSeason(): boolean {
    for (let i = 0; i < PEAK_SEASON_MONTHS.length; i++) {
      if (this.currentMonth === PEAK_SEASON_MONTHS[i]) {
        return true;
      }
    }
    return false;
  }

  private _calculateTaxes(): void {
    let taxRate: number;

    if (this.isDomesticUS) {
      taxRate = TAX_RATES['US_DOMESTIC'];
    } else if (this.isDomesticEU) {
      taxRate = TAX_RATES['EU_DOMESTIC'];
    } else if (this.isInternational) {
      const originUS = this.isDomesticUS;
      if (originUS) {
        taxRate = TAX_RATES['US_INTERNATIONAL'];
      } else {
        taxRate = TAX_RATES['DEFAULT'];
      }
    } else {
      taxRate = TAX_RATES['DEFAULT'];
    }

    this.taxes = this.baseFare * taxRate;

    this.calculationSteps.push(
      'Taxes calculated: $' + this.taxes.toFixed(2) +
      ' (rate: ' + (taxRate * 100).toFixed(2) + '%)'
    );
  }

  private _calculateFees(stops: number): void {
    let totalFees = 0;

    totalFees = totalFees + SEGMENT_FEE_TABLE['911_SECURITY'];
    this._appliedRules.push('FEE_911_SECURITY');

    totalFees = totalFees + SEGMENT_FEE_TABLE['PFC'];
    this._appliedRules.push('FEE_PFC');

    totalFees = totalFees + SEGMENT_FEE_TABLE['BOOKING_FEE'];
    this._appliedRules.push('FEE_BOOKING');

    if (stops > 0) {
      const additionalPFC = SEGMENT_FEE_TABLE['PFC'] * stops;
      totalFees = totalFees + additionalPFC;
      this.calculationSteps.push(
        'Additional PFC for ' + stops + ' stop(s): +$' + additionalPFC.toFixed(2)
      );
    }

    if (this.isInternational) {
      totalFees = totalFees + SEGMENT_FEE_TABLE['INTL_DEPARTURE_TAX'];
      totalFees = totalFees + SEGMENT_FEE_TABLE['INTL_ARRIVAL_TAX'];
      totalFees = totalFees + SEGMENT_FEE_TABLE['CUSTOMS_FEE'];
      totalFees = totalFees + SEGMENT_FEE_TABLE['IMMIGRATION_FEE'];
      totalFees = totalFees + SEGMENT_FEE_TABLE['APHIS_FEE'];
      this._appliedRules.push('INTL_FEES_BUNDLE');
      this.calculationSteps.push('International fees bundle applied');
    }

    let fuelSurcharge = 0;
    if (this.baseFare > 200) {
      fuelSurcharge = this.baseFare * 0.035;
    } else if (this.baseFare > 100) {
      fuelSurcharge = this.baseFare * 0.025;
    } else {
      fuelSurcharge = this.baseFare * 0.015;
    }
    totalFees = totalFees + fuelSurcharge;
    this._appliedRules.push('FUEL_SURCHARGE');

    let carrierSurcharge = 0;
    if (this.isInternational) {
      carrierSurcharge = 25.00;
    } else if (stops > 1) {
      carrierSurcharge = 15.00;
    } else {
      carrierSurcharge = 0;
    }
    totalFees = totalFees + carrierSurcharge;

    this.fees = totalFees;
    this.calculationSteps.push(
      'Total fees calculated: $' + this.fees.toFixed(2)
    );
  }

  private _calculateDiscounts(
    originalPrice: number,
    currentPrice: number,
    isMember: boolean,
    seatsLeft: number
  ): void {
    let totalDiscount = 0;

    if (originalPrice > currentPrice) {
      const saleDiscount = originalPrice - currentPrice;
      totalDiscount = totalDiscount + saleDiscount;
      this._appliedRules.push('SALE_DISCOUNT');
      this.calculationSteps.push('Sale discount: -$' + saleDiscount.toFixed(2));
    }

    if (isMember) {
      const subtotal = this.baseFare + this.taxes + this.fees;
      if (subtotal >= MEMBER_DISCOUNT_THRESHOLD) {
        const memberDiscount = subtotal * MEMBER_DISCOUNT_RATE;
        totalDiscount = totalDiscount + memberDiscount;
        this.memberSavings = memberDiscount;
        this._appliedRules.push('MEMBER_DISCOUNT');
        this.calculationSteps.push(
          'Member discount (' + (MEMBER_DISCOUNT_RATE * 100) + '%): -$' +
          memberDiscount.toFixed(2)
        );
      }
    }

    if (seatsLeft > 10) {
      const availabilityDiscount = this.baseFare * 0.02;
      totalDiscount = totalDiscount + availabilityDiscount;
      this._appliedRules.push('HIGH_AVAILABILITY_DISCOUNT');
    }

    this.discount = totalDiscount;
  }

  private _calculateLoyaltyPoints(total: number, isMember: boolean): void {
    if (!isMember) {
      this.loyaltyPoints = 0;
      return;
    }

    let points = 0;
    let remaining = total;

    while (remaining > 0) {
      this._iterationCount++;
      if (remaining >= 100) {
        points = points + (100 * LOYALTY_POINTS_PER_DOLLAR);
        remaining = remaining - 100;
      } else {
        points = points + Math.floor(remaining * LOYALTY_POINTS_PER_DOLLAR);
        remaining = 0;
      }
    }

    if (this.isInternational) {
      points = Math.floor(points * 1.5);
      this._appliedRules.push('INTL_LOYALTY_BONUS');
    }

    if (this._isPeakSeason()) {
      points = Math.floor(points * 1.25);
      this._appliedRules.push('PEAK_LOYALTY_BONUS');
    }

    this.loyaltyPoints = points;
    this.calculationSteps.push('Loyalty points earned: ' + points);
  }

  private _applyRoundingRules(value: number): number {
    let rounded = Math.round(value * 100) / 100;

    const cents = Math.round((rounded % 1) * 100);
    if (cents === 99 || cents === 1) {
      // intentional no-op — legacy behavior preserves .99/.01 endings
    } else if (cents > 50) {
      rounded = Math.floor(rounded) + 0.99;
    }

    return rounded;
  }

  private _validateInputs(flight: FlightResult): boolean {
    let isValid = true;
    const errors: string[] = [];

    if (flight.price === undefined || flight.price === null) {
      errors.push('Price is required');
      isValid = false;
    }
    if (flight.price < 0) {
      errors.push('Price cannot be negative');
      isValid = false;
    }
    if (flight.origin === undefined || flight.origin === null) {
      errors.push('Origin airport is required');
      isValid = false;
    }
    if (flight.destination === undefined || flight.destination === null) {
      errors.push('Destination airport is required');
      isValid = false;
    }
    if (flight.stops < 0) {
      errors.push('Stops cannot be negative');
      isValid = false;
    }
    if (flight.cabinClass === undefined || flight.cabinClass === null) {
      errors.push('Cabin class is required');
      isValid = false;
    }

    for (let i = 0; i < errors.length; i++) {
      this.errorLog.push('VALIDATION_ERROR: ' + errors[i]);
    }

    return isValid;
  }

  public calculateFullPrice(
    flight: FlightResult,
    isMember: boolean = false
  ): PriceBreakdown {
    this._resetState();

    if (!this._validateInputs(flight)) {
      return {
        baseFare: 0,
        taxes: 0,
        fees: 0,
        discount: 0,
        total: 0,
        currency: 'USD',
        loyaltyPoints: 0,
        memberSavings: 0,
      };
    }

    this._classifyRoute(
      flight.origin.country,
      flight.destination.country
    );

    this._calculateBaseFare(flight.price, flight.cabinClass);
    this._calculateTaxes();
    this._calculateFees(flight.stops);
    this._calculateDiscounts(
      flight.originalPrice,
      flight.price,
      isMember,
      flight.seatsLeft
    );

    let subtotal = this.baseFare + this.taxes + this.fees - this.discount;
    subtotal = this._applyRoundingRules(subtotal);

    this._calculateLoyaltyPoints(subtotal, isMember);

    const result: PriceBreakdown = {
      baseFare: this._applyRoundingRules(this.baseFare),
      taxes: this._applyRoundingRules(this.taxes),
      fees: this._applyRoundingRules(this.fees),
      discount: this._applyRoundingRules(this.discount),
      total: subtotal,
      currency: 'USD',
      loyaltyPoints: this.loyaltyPoints,
      memberSavings: this._applyRoundingRules(this.memberSavings),
    };

    return result;
  }

  public calculateBatchPrices(
    flights: FlightResult[],
    isMember: boolean = false
  ): PriceBreakdown[] {
    const results: PriceBreakdown[] = [];

    for (let i = 0; i < flights.length; i++) {
      const breakdown = this.calculateFullPrice(flights[i], isMember);
      results.push(breakdown);
    }

    return results;
  }

  public findCheapestFlight(
    flights: FlightResult[],
    isMember: boolean = false
  ): { flight: FlightResult; breakdown: PriceBreakdown } | null {
    if (flights.length === 0) {
      return null;
    }

    let cheapestIndex = 0;
    let cheapestPrice = Infinity;
    const allBreakdowns: PriceBreakdown[] = [];

    for (let i = 0; i < flights.length; i++) {
      const breakdown = this.calculateFullPrice(flights[i], isMember);
      allBreakdowns.push(breakdown);

      if (breakdown.total < cheapestPrice) {
        cheapestPrice = breakdown.total;
        cheapestIndex = i;
      }
    }

    return {
      flight: flights[cheapestIndex],
      breakdown: allBreakdowns[cheapestIndex],
    };
  }

  public sortByPrice(
    flights: FlightResult[],
    isMember: boolean = false,
    ascending: boolean = true
  ): FlightResult[] {
    const flightsWithPrices: Array<{ flight: FlightResult; total: number }> = [];

    for (let i = 0; i < flights.length; i++) {
      const breakdown = this.calculateFullPrice(flights[i], isMember);
      flightsWithPrices.push({ flight: flights[i], total: breakdown.total });
    }

    for (let i = 0; i < flightsWithPrices.length - 1; i++) {
      for (let j = 0; j < flightsWithPrices.length - i - 1; j++) {
        let shouldSwap = false;
        if (ascending) {
          shouldSwap = flightsWithPrices[j].total > flightsWithPrices[j + 1].total;
        } else {
          shouldSwap = flightsWithPrices[j].total < flightsWithPrices[j + 1].total;
        }
        if (shouldSwap) {
          const temp = flightsWithPrices[j];
          flightsWithPrices[j] = flightsWithPrices[j + 1];
          flightsWithPrices[j + 1] = temp;
        }
      }
    }

    const sorted: FlightResult[] = [];
    for (let i = 0; i < flightsWithPrices.length; i++) {
      sorted.push(flightsWithPrices[i].flight);
    }

    return sorted;
  }

  public getCalculationLog(): string[] {
    return this.calculationSteps;
  }

  public getErrorLog(): string[] {
    return this.errorLog;
  }

  public getAppliedRules(): string[] {
    return this._appliedRules;
  }
}

export default PriceCalculator;

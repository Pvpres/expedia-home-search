# Pain Point Analysis Report

**Repository**: Pvpres/expedia-home-search
**Date**: 2026-02-20
**Analyst**: Devin (automated)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3     |
| High     | 4     |
| Medium   | 3     |

---

## Findings

### [Critical] File: src/utils/PriceCalculator.ts
**What**: 537-line legacy pricing engine with zero test coverage, mutable class state, and high cyclomatic complexity
**Why it matters**: This is the core business logic module. Every flight price shown to users flows through this class. Bugs here directly affect revenue correctness. The class uses 14 mutable instance fields modified across 12+ methods, making state corruption between calls a real risk.
**Lines**: 1-537 (entire file)
**Pain points identified**:
- Zero test coverage (flagged in source comments as SonarQube finding)
- Mutable state shared across methods (`this.baseFare`, `this.taxes`, `this.fees`, etc.) — 14 instance fields
- High cyclomatic complexity: `_calculateFees` has 6 conditional branches, `_calculateDiscounts` has 4, `_calculateTaxes` has 4
- Legacy imperative patterns: manual `for` loops instead of `Array.includes()` (lines 116-139), bubble sort (lines 499-513), manual iteration for loyalty points (lines 318-327)
- Date-dependent branching (`_isPeakSeason`) with no test isolation
- Missing input validation edge cases: `_validateInputs` checks for null/undefined but doesn't guard against NaN or non-numeric prices
**Proposed test strategy**: Comprehensive unit tests covering every public method, all route classification branches, cabin class multipliers, peak/off-peak seasons, member/non-member discounts, fee calculations with varying stops, loyalty point computation, rounding rules, batch operations, sorting, and edge cases (empty arrays, invalid inputs, negative prices)

### [Critical] File: src/components/search/SearchWidget.tsx
**What**: Complex search form component with 16 useState hooks and zero test coverage
**Why it matters**: This is the primary user interaction point — the search form. It handles flight/hotel/car tab switching, airport selection, date inputs, traveler counter, and search navigation. Bugs here prevent users from searching.
**Lines**: 1-323
**Pain points identified**:
- 16 `useState` hooks managing form state (lines 9-24) — extremely complex UI state
- Business logic mixed into component: URL parameter construction (lines 34-43), swap airports logic (lines 26-30)
- No validation before search (only checks `origin && destination`, no date validation)
- Three separate tab UIs (flights, hotels, cars) with no shared form abstraction
**Proposed test strategy**: Component tests for tab switching, form field interactions, airport swap, traveler counter increment/decrement, search button navigation with URL params, conditional rendering (roundtrip vs one-way return date field)

### [Critical] File: src/pages/SearchResultsPage.tsx
**What**: Results page with complex filtering, sorting, and state management — zero test coverage
**Why it matters**: This page displays flight results to users with filtering and sorting. It integrates PriceCalculator for price-based sorting and member pricing. Incorrect filtering/sorting directly impacts user experience.
**Lines**: 1-256
**Pain points identified**:
- 5 useState hooks managing filter/sort state
- Business logic in component: filtering logic (lines 38-69), duration parsing (lines 54-57), date formatting (lines 79-82)
- Direct dependency on PriceCalculator for sorting (line 51)
- URL search param parsing with fallback defaults (lines 21-26)
**Proposed test strategy**: Component tests for filter interactions (stops, airlines, membership), sort option changes, empty state display, URL parameter parsing, member pricing banner visibility

### [High] File: src/components/results/FlightSearchCard.tsx
**What**: Flight result card with price breakdown display and expand/collapse — zero test coverage
**Why it matters**: This component renders pricing information to users. It integrates PriceCalculator and displays breakdowns. Incorrect display of prices, discounts, or member savings is a revenue-impacting bug.
**Lines**: 1-193
**Pain points identified**:
- Module-level PriceCalculator instance (line 11) — shared mutable state across all card instances
- Conditional rendering based on price data: sale prices (line 91), member savings (line 97), seats left warning (line 102), refundable badge (line 139)
- Expand/collapse for price details section
**Proposed test strategy**: Component tests for price display, expand/collapse toggle, conditional badges (sale, member savings, low seats, refundable), amenity icons rendering

### [High] File: src/components/search/AirportPicker.tsx
**What**: Airport search/select dropdown with filtering — zero test coverage
**Why it matters**: Users must select airports to search. Bugs in filtering or selection prevent flight searches.
**Lines**: 1-101
**Pain points identified**:
- Click-outside handling with DOM refs (lines 29-40)
- Search filtering across 4 fields (code, city, name, country)
- Open/close state management with focus handling
**Proposed test strategy**: Component tests for search filtering, airport selection, dropdown open/close, placeholder vs selected display

### [High] File: src/components/navigation/GlobalNav.tsx
**What**: Navigation component with mobile menu and hover dropdown — zero test coverage
**Why it matters**: Navigation is core to user experience. Mobile menu toggle and dropdown must work correctly.
**Lines**: 1-115
**Pain points identified**:
- Mobile menu toggle state
- Hover-based dropdown (mouseEnter/mouseLeave)
- Responsive visibility classes
**Proposed test strategy**: Component tests for mobile menu toggle, dropdown visibility, logo link

### [High] File: src/components/hero/PromoSection.tsx
**What**: Promotional deals section with image error handling — zero test coverage
**Why it matters**: Promotional content drives conversions. Image fallback logic needs testing.
**Lines**: 1-76
**Pain points identified**:
- Image onError handler with dynamic fallback URL (lines 46-48)
- VIP badge conditional rendering
- Static deal data embedded in component
**Proposed test strategy**: Component tests for deal card rendering, VIP badge visibility, image error fallback

### [Medium] File: src/constants/mockFlights.ts
**What**: Mock flight data with airport lookup function that throws on missing airports
**Why it matters**: The `findAirport` helper throws an unhandled error if an airport code doesn't exist. This could crash the app if data is misconfigured.
**Lines**: 4-8
**Proposed test strategy**: Unit test for findAirport helper with valid and invalid codes

### [Medium] File: src/lib/utils.ts
**What**: Utility function `cn()` for Tailwind class merging — zero test coverage
**Why it matters**: Low risk since it's a thin wrapper, but still untested
**Lines**: 1-7
**Proposed test strategy**: Unit test for cn() with various class combinations

### [Medium] File: src/types/index.ts
**What**: Type definitions only — no runtime logic to test
**Why it matters**: Types provide compile-time safety but no runtime behavior
**Lines**: 1-87
**Proposed test strategy**: No tests needed (type-only file)

---

## Coverage Targets

| File | Target Coverage |
|------|----------------|
| src/utils/PriceCalculator.ts | 80%+ branch coverage |
| src/components/search/SearchWidget.tsx | 80%+ branch coverage |
| src/pages/SearchResultsPage.tsx | 80%+ branch coverage |
| src/components/results/FlightSearchCard.tsx | 80%+ branch coverage |
| src/components/search/AirportPicker.tsx | 80%+ branch coverage |

---

## 10x Stability Results

| Suite | Runs | Passed | Failed |
|-------|------|--------|--------|
| Unit (Vitest) | 10 | 10 | 0 |
| E2E (Cypress) | 10 | 10 | 0 |

All 10 unit test runs (184 tests each) and all 10 Cypress E2E runs (34 tests each) passed with zero failures.

## Final Coverage Numbers

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| src/utils/PriceCalculator.ts | 98.46% | **96.03%** | 100% | 98.39% |
| src/components/search/SearchWidget.tsx | 64.58% | **68.96%** | 43.47% | 64.58% |
| src/pages/SearchResultsPage.tsx | 95.16% | **86.11%** | 88% | 94.44% |
| src/components/results/FlightSearchCard.tsx | 100% | **100%** | 100% | 100% |
| src/components/search/AirportPicker.tsx | 100% | **100%** | 100% | 100% |
| **Overall** | **93.33%** | **91.77%** | **80%** | **93.18%** |

Critical files meeting 80% branch coverage target: PriceCalculator.ts (96.03%), SearchResultsPage.tsx (86.11%), FlightSearchCard.tsx (100%), AirportPicker.tsx (100%).

SearchWidget.tsx (68.96% branch) is below the 80% target due to untested hotel/car tab form paths and multi-city trip logic. These are lower-risk UI paths that don't affect the core flight search flow.

## Test Files Written

| Test File | Type | Tests |
|-----------|------|-------|
| src/utils/PriceCalculator.test.ts | Unit | 69 |
| src/components/search/SearchWidget.test.tsx | Component | 19 |
| src/pages/SearchResultsPage.test.tsx | Component/Integration | 20 |
| src/components/results/FlightSearchCard.test.tsx | Component | 28 |
| src/components/search/AirportPicker.test.tsx | Component | 9 |
| src/components/navigation/GlobalNav.test.tsx | Component | 6 |
| src/components/hero/PromoSection.test.tsx | Component | 10 |
| src/components/common/Footer.test.tsx | Component | 7 |
| src/lib/utils.test.ts | Unit | 5 |
| src/pages/HomePage.test.tsx | Component | 5 |
| src/App.test.tsx | Component | 2 |
| src/constants/airports.test.ts | Unit | 4 |
| cypress/e2e/home-page.cy.ts | E2E | 9 |
| cypress/e2e/flight-search-flow.cy.ts | E2E | 8 |
| cypress/e2e/search-results.cy.ts | E2E | 17 |
| **Total** | | **218** |

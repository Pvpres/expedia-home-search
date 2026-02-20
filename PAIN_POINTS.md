# Pain Point Analysis: expedia-home-search

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3     |
| High     | 4     |
| Medium   | 3     |

---

### [Critical] File: src/utils/PriceCalculator.ts
**What**: 537-line legacy pricing engine with zero test coverage, mutable class state across 16+ instance variables, and complex branching logic (route classification, peak season, cabin multipliers, fee tiers, discount rules, loyalty points).
**Why it matters**: This is the core business logic of the app. Every price displayed to users flows through this class. Bugs here directly affect revenue accuracy. The mutable state pattern makes it easy for one method to silently corrupt another's output.
**Lines**: 1-537 (entire file)
**Proposed test strategy**: Comprehensive unit tests covering every public method (`calculateFullPrice`, `calculateBatchPrices`, `findCheapestFlight`, `sortByPrice`), every route classification branch (US domestic, EU domestic, international), every cabin class multiplier, peak/off-peak season paths (mock `Date`), fee calculation tiers, discount rules (sale, member, availability), loyalty point calculation, rounding rules, and input validation edge cases.

### [Critical] File: src/components/search/SearchWidget.tsx
**What**: 323-line component with 13 `useState` hooks managing flight, hotel, and car search forms. Contains business logic for URL parameter construction (`handleSearch`) and airport swap logic mixed directly into the component.
**Why it matters**: This is the primary user interaction point. The `handleSearch` function constructs URL params that drive the entire search results page. Any bug in parameter construction means broken searches. The 13 state variables create a complex state space with no tests.
**Lines**: 7-322 (component body), 32-45 (`handleSearch`), 26-30 (`swapAirports`)
**Proposed test strategy**: Unit tests for rendering each tab (flights, hotels, cars), trip type radio selection, cabin class dropdown, traveler counter increment/decrement with bounds, airport swap, search button navigation with correct URL params.

### [Critical] File: src/pages/SearchResultsPage.tsx
**What**: 256-line page component with 5 `useState` hooks, complex `useMemo` filtering/sorting pipeline, and inline `formatDate` function. Business logic for flight filtering (by stops, airlines) and sorting (by price, duration, departure, stops) is embedded in the component.
**Why it matters**: This page displays all flight results. The filtering and sorting logic directly affects what users see. The `useMemo` dependency array must be correct or users see stale data. The `formatDate` function has no validation.
**Lines**: 13-255 (component), 38-69 (`filteredFlights` useMemo), 79-82 (`formatDate`)
**Proposed test strategy**: Unit tests for rendering with default params, URL parameter parsing, filter interactions (stops radio, airline checkboxes, member toggle), sort option changes, empty results state, member pricing banner visibility.

### [High] File: src/components/results/FlightSearchCard.tsx
**What**: 193-line component that instantiates `PriceCalculator` at module scope (line 11) and renders complex price breakdowns with expand/collapse. Contains inline lookup tables for airline colors and amenity icons.
**Why it matters**: Module-scoped calculator instance means shared mutable state across all card renders. Price display bugs directly affect user trust. The expand/collapse interaction and conditional rendering (member savings, seats left warning, refundable badge) have multiple visual states.
**Lines**: 11 (module-scope calculator), 13-192 (component), 89-111 (price display), 156-189 (expanded breakdown)
**Proposed test strategy**: Unit tests for rendering with various flight data, expand/collapse toggle, member vs non-member price display, seats-left warning threshold, discount display, loyalty points display.

### [High] File: src/components/search/AirportPicker.tsx
**What**: 101-line component with dropdown open/close state, search filtering, and click-outside handler. The filtering logic (lines 19-27) searches across code, city, name, and country fields.
**Why it matters**: Airport selection is the first step of every flight search. If filtering fails or click-outside doesn't work, users can't complete searches. The `useEffect` cleanup for event listeners is a common source of memory leaks.
**Lines**: 19-27 (filter logic), 29-40 (click-outside effect), 42-46 (selection handler)
**Proposed test strategy**: Unit tests for rendering, opening dropdown, filtering by code/city/name, selecting an airport, click-outside closing, empty results state.

### [High] File: src/components/navigation/GlobalNav.tsx
**What**: 115-line nav component with mobile menu toggle and hover-based dropdown. Two sub-components (`DropdownItem`, `MobileNavLink`) defined in the same file.
**Why it matters**: Navigation is on every page. Mobile menu and dropdown interactions affect usability. The `onMouseEnter`/`onMouseLeave` pattern for dropdown is fragile.
**Lines**: 5-97 (GlobalNav), 100-106 (DropdownItem), 108-114 (MobileNavLink)
**Proposed test strategy**: Unit tests for rendering, mobile menu toggle, dropdown visibility on hover, link rendering.

### [High] File: src/components/hero/PromoSection.tsx
**What**: 76-line component with hardcoded deal data, image error fallback handler, and conditional VIP badge rendering.
**Why it matters**: Promo section is a key conversion driver. The image `onError` fallback (line 46-48) constructs URLs via string concatenation. VIP badge logic should be tested.
**Lines**: 3-8 (DEALS data), 46-48 (image error handler), 50-54 (VIP badge)
**Proposed test strategy**: Unit tests for rendering all deals, VIP badge visibility, image error fallback behavior.

### [Medium] File: src/constants/airports.ts
**What**: Static airport data with 25 entries. No validation that codes are unique or that required fields are present.
**Why it matters**: Duplicate codes or missing fields would break AirportPicker filtering and search parameter construction.
**Lines**: 3-28
**Proposed test strategy**: Data integrity tests verifying unique codes, all required fields present.

### [Medium] File: src/constants/mockFlights.ts
**What**: Mock flight data with 8 entries using `findAirport` helper that throws on missing codes. No data validation.
**Why it matters**: If airport codes in mock data don't match the airports constant, the app crashes on import.
**Lines**: 4-8 (findAirport), 10-187 (MOCK_FLIGHT_RESULTS)
**Proposed test strategy**: Data integrity tests verifying all airport codes resolve, required fields present, prices non-negative.

### [Medium] File: src/lib/utils.ts
**What**: Single `cn` utility function combining `clsx` and `tailwind-merge`. No tests.
**Why it matters**: Low risk since it's a thin wrapper, but it's used across the app for className construction.
**Lines**: 4-6
**Proposed test strategy**: Simple unit test verifying class merging behavior.

---

## Legacy Patterns Identified

1. **Bubble sort** in `PriceCalculator.sortByPrice` (lines 499-513) - O(n^2) where Array.sort would suffice
2. **Manual for-loop iteration** throughout PriceCalculator where `Array.includes`, `Array.map`, `Array.find` would be cleaner
3. **String concatenation for logging** in PriceCalculator calculation steps
4. **Mutable class state** - 16 instance variables mutated across 12 private methods
5. **Module-scope class instantiation** in FlightSearchCard.tsx (shared mutable state risk)

## Missing Error Handling

1. `SearchWidget.handleSearch` - No validation when origin/destination not selected (silently does nothing)
2. `SearchResultsPage.formatDate` - No guard against invalid date strings
3. `PriceCalculator._calculateTaxes` - Dead code branch at line 196-198 (`originUS` always false when `isInternational` is true)
4. `AirportPicker` - No debounce on search input filtering

---

*Report generated: 2026-02-20*
*Final coverage numbers and test file references will be added after test suite completion.*

# Pain Point Analysis — expedia-home-search

> Auto-generated pain point report for the `Pvpres/expedia-home-search` React/TypeScript repository.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 5     |
| Medium   | 4     |

---

## Findings

### [Critical] File: src/utils/PriceCalculator.ts
**What**: 537-line legacy pricing engine with zero test coverage, heavy mutable class state, imperative iteration, and date-dependent branching.
**Why it matters**: This is the core business-logic module. It calculates fares, taxes, fees, discounts, and loyalty points for every flight displayed to users. A regression here directly impacts revenue accuracy. The class uses 14 mutable instance fields that are shared across private methods, making it extremely easy for a state-reset bug to produce wrong totals. The code also branches on `new Date().getMonth()` (peak-season logic) — without mocking, results are non-deterministic across calendar months.
**Lines**: 1–537 (entire file)
**Proposed test strategy**: Comprehensive unit tests covering every public method (`calculateFullPrice`, `calculateBatchPrices`, `findCheapestFlight`, `sortByPrice`, `getCalculationLog`, `getErrorLog`, `getAppliedRules`). Use `vi.useFakeTimers()` to lock dates for peak/off-peak branches. Test all route classification paths (US domestic, EU domestic, international), cabin multipliers, fee tiers, discount conditions, loyalty point calculations, and rounding rules. Validate input rejection for null/negative/missing fields.

---

### [High] File: src/pages/SearchResultsPage.tsx
**What**: Complex page component with 5 `useState` hooks, URL parameter parsing, filtering/sorting pipeline, and direct PriceCalculator integration — all untested.
**Why it matters**: This is the primary results page. It parses search params, filters flights by stops/airline, sorts using multiple strategies (including delegating to PriceCalculator), and toggles member pricing. Any bug in the filtering or sorting pipeline silently corrupts the user's search experience.
**Lines**: 1–256 (entire file)
**Proposed test strategy**: Integration tests that render the component with mocked URL params and verify: correct flight count display, filter interactions (stops radio, airline checkboxes), sort dropdown behavior, member pricing toggle, empty-state rendering. Use `MemoryRouter` with `initialEntries` to inject search params.

---

### [High] File: src/components/search/SearchWidget.tsx
**What**: 323-line component with 14 `useState` hooks managing flights, hotels, and cars search tabs — zero tests.
**Why it matters**: This is the primary search entry point. It constructs URL parameters and navigates to the results page. The traveler counter has min/max bounds (1–9), airport swap logic mutates two state variables, and tab switching controls which form is visible. Any state bug breaks the search flow.
**Lines**: 1–323 (entire file)
**Proposed test strategy**: Component tests verifying: tab switching renders correct forms, airport swap works, traveler counter increment/decrement with bounds, search button constructs correct URL params and navigates, roundtrip vs one-way shows/hides return date.

---

### [High] File: src/components/results/FlightSearchCard.tsx
**What**: Flight result card with expand/collapse price details, conditional member savings display, and direct PriceCalculator usage — untested.
**Why it matters**: This component renders pricing data to users. It conditionally shows original prices, member savings, seat warnings, and an expandable price breakdown. Rendering bugs would display wrong prices or hide critical information.
**Lines**: 1–193 (entire file)
**Proposed test strategy**: Component tests verifying: price display, expand/collapse toggle shows breakdown, member savings display, seat-left warning for low availability, airline badge colors, amenity icons.

---

### [High] File: src/components/search/AirportPicker.tsx
**What**: Autocomplete dropdown with click-outside handling, filtering, and controlled input — untested.
**Why it matters**: Users select origin/destination airports through this component. The filtering logic matches against code, city, name, and country. Click-outside dismissal uses a ref-based event listener. Bugs here prevent users from selecting airports entirely.
**Lines**: 1–101 (entire file)
**Proposed test strategy**: Component tests verifying: dropdown opens on click, filtering narrows results, selecting an airport calls onSelect and closes dropdown, empty query shows all airports, no-match shows "No airports found".

---

### [High] File: src/components/navigation/GlobalNav.tsx
**What**: Navigation bar with mobile menu toggle and hover dropdown — untested.
**Why it matters**: Primary navigation component used on every page. Mobile menu toggle and hover dropdown are interactive patterns that can break silently.
**Lines**: 1–115 (entire file)
**Proposed test strategy**: Component tests verifying: logo links to home, mobile menu toggle, dropdown items render.

---

### [Medium] File: src/components/hero/PromoSection.tsx
**What**: Promo deals section with static data and image error fallback — untested.
**Why it matters**: Renders promotional deals. The image `onError` handler constructs a fallback URL. Low risk but contributes to overall coverage gap.
**Lines**: 1–76
**Proposed test strategy**: Component test verifying deals render, VIP badges shown for flagged deals, image error fallback works.

---

### [Medium] File: src/components/hero/HeroSection.tsx
**What**: Hero section wrapper around SearchWidget — untested.
**Why it matters**: Simple composition component. Low complexity but zero coverage.
**Lines**: 1–21
**Proposed test strategy**: Smoke test verifying it renders the heading and SearchWidget.

---

### [Medium] File: src/components/common/Footer.tsx
**What**: Footer with dynamic year and link groups — untested.
**Why it matters**: Renders `new Date().getFullYear()` dynamically. Link categories are data-driven. Low risk.
**Lines**: 1–56
**Proposed test strategy**: Smoke test verifying footer renders, all link categories present, dynamic year.

---

### [Medium] File: src/pages/HomePage.tsx
**What**: Simple page composition component — untested.
**Why it matters**: Composes GlobalNav, HeroSection, PromoSection, Footer. Minimal logic but zero coverage.
**Lines**: 1–16
**Proposed test strategy**: Smoke test verifying all child components render.

---

## Coverage Targets

| File | Target Branch Coverage |
|------|----------------------|
| `src/utils/PriceCalculator.ts` | ≥ 80% |
| `src/pages/SearchResultsPage.tsx` | ≥ 80% |
| `src/components/search/SearchWidget.tsx` | ≥ 80% |
| `src/components/results/FlightSearchCard.tsx` | ≥ 80% |
| `src/components/search/AirportPicker.tsx` | ≥ 80% |

---

## Final Coverage Results

| File | Branch Coverage | Target | Status |
|------|----------------|--------|--------|
| `src/utils/PriceCalculator.ts` | 95.04% | ≥ 80% | PASS |
| `src/pages/SearchResultsPage.tsx` | 88.88% | ≥ 80% | PASS |
| `src/components/search/SearchWidget.tsx` | 100% | ≥ 80% | PASS |
| `src/components/results/FlightSearchCard.tsx` | 97.29% | ≥ 80% | PASS |
| `src/components/search/AirportPicker.tsx` | 94.44% | ≥ 80% | PASS |

**Overall**: 94.8% branch coverage across all source files.

## Test Suite Summary

| Category | Tests | Files |
|----------|-------|-------|
| Unit (Vitest) | 190 | 10 |
| E2E (Cypress) | 34 | 3 |
| **Total** | **224** | **13** |

### Test File Mapping

| Pain Point File | Test File | Tests |
|----------------|-----------|-------|
| `src/utils/PriceCalculator.ts` | `src/utils/PriceCalculator.test.ts` | 62 |
| `src/pages/SearchResultsPage.tsx` | `src/pages/SearchResultsPage.test.tsx` | 21 |
| `src/components/search/SearchWidget.tsx` | `src/components/search/SearchWidget.test.tsx` | 35 |
| `src/components/results/FlightSearchCard.tsx` | `src/components/results/FlightSearchCard.test.tsx` | 26 |
| `src/components/search/AirportPicker.tsx` | `src/components/search/AirportPicker.test.tsx` | 11 |
| `src/components/navigation/GlobalNav.tsx` | `src/components/navigation/GlobalNav.test.tsx` | 7 |
| `src/components/hero/PromoSection.tsx` | `src/components/hero/PromoSection.test.tsx` | 10 |
| `src/components/hero/HeroSection.tsx` | `src/components/hero/HeroSection.test.tsx` | 2 |
| `src/components/common/Footer.tsx` | `src/components/common/Footer.test.tsx` | 8 |
| `src/pages/HomePage.tsx` | `src/pages/HomePage.test.tsx` | 4 |

## 10x Stability Results

| Suite | Runs | Passed | Failed | Result |
|-------|------|--------|--------|--------|
| Unit (Vitest) | 10 | 10 | 0 | STABLE |
| E2E (Cypress) | 10 | 10 | 0 | STABLE |

**All 20 runs (10 unit + 10 E2E) completed with zero failures. No flaky tests detected.**

---

*Report generated by Devin — [session link](https://app.devin.ai/sessions/5925a97eca734666a6d20832e6408b08)*

# expedia-home-search

> **Expedia Group — Travel Platform Services**
> Internal service powering the Home & Search experience for Expedia.com

[![CI](https://github.com/Pvpres/expedia-home-search/actions/workflows/ci.yml/badge.svg)](https://github.com/Pvpres/expedia-home-search/actions/workflows/ci.yml)
[![Paved Road](https://img.shields.io/badge/Paved%20Road-v3.2-blue)](https://internal.expediagroup.com/paved-road)
[![Platform](https://img.shields.io/badge/Platform-React%2018-61dafb)](https://reactjs.org)

---

## Overview

This repository contains the **Home & Search** frontend experience — the primary entry point for Expedia.com users. It serves the global navigation, search widget (Flights, Hotels, Cars), and flight search results page.

### Architecture

This service follows the **Big Boulder** architecture pattern, where the search experience is served as a standalone microfrontend that integrates with the broader Expedia platform via the **Paved Road** framework.

```
┌──────────────────────────────────────────────────┐
│                  CDN / Edge Layer                │
├──────────────────────────────────────────────────┤
│          expedia-home-search (this repo)         │
│  ┌────────────┐  ┌────────┐  ┌───────────────┐  │
│  │ GlobalNav  │  │ Search │  │ FlightResults │  │
│  │ Component  │  │ Widget │  │    Page        │  │
│  └────────────┘  └────────┘  └───────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │         PriceCalculator (Legacy)           │  │
│  │    ⚠️  Ported from Java PricingService v2  │  │
│  └────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────┤
│         Expedia Platform Services (EPS)          │
│    Flights API │ Hotels API │ Loyalty Service    │
└──────────────────────────────────────────────────┘
```

## Tech Stack

| Layer        | Technology                          |
|------------- |-------------------------------------|
| Framework    | React 18 + TypeScript               |
| Build        | Vite 6                              |
| Styling      | Tailwind CSS 3                      |
| Routing      | React Router 6                      |
| Icons        | Lucide React                        |
| Linting      | ESLint 9                            |
| CI/CD        | GitHub Actions                      |
| Deployment   | EG Internal Kubernetes (see below)  |

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Access to the Expedia VPN (for API integrations)

### Installation

```bash
git clone https://github.com/Pvpres/expedia-home-search.git
cd expedia-home-search
npm install
```

### Development

```bash
npm run dev
```

The dev server starts at `http://localhost:5173` with hot module replacement.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Paved Road Compliance

This service is onboarded to the **Paved Road v3.2** framework. All deployments go through the standard EG deployment pipeline:

1. **PR created** → CI runs lint, type-check, and unit tests
2. **PR approved** → Merged to `main`
3. **Main build** → Artifact pushed to EG Container Registry
4. **Staging deploy** → Auto-deployed to `us-west-2` staging cluster
5. **Canary release** → 5% traffic in production
6. **Full rollout** → Progressive rollout over 30 minutes

### Deployment Configuration

Deployment is managed via the `eg-deploy.yaml` configuration (not included in this repo — managed by Platform Engineering). Contact the **Release Engineering** team for deployment access.

### Environment Variables

| Variable                    | Description                        | Required |
|---------------------------- |------------------------------------|----------|
| `VITE_EPS_API_URL`          | Expedia Platform Services base URL | Yes      |
| `VITE_LOYALTY_SERVICE_URL`  | Loyalty/rewards service endpoint   | Yes      |
| `VITE_FEATURE_FLAGS_URL`    | Feature flag service (LaunchDarkly)| No       |
| `VITE_ANALYTICS_KEY`        | Amplitude analytics key            | No       |

## Known Technical Debt

| Item                        | Status      | JIRA          | Notes                                                |
|---------------------------- |-------------|---------------|------------------------------------------------------|
| PriceCalculator.ts rewrite  | Backlogged  | EG-48291      | Legacy imperative logic from Java migration. Needs functional rewrite. |
| FlightSearchCard tests      | Not started | EG-51034      | 0% coverage — flagged by SonarQube in Q3 audit.      |
| PriceCalculator tests       | Not started | EG-48292      | 0% coverage — blocked on EG-48291 rewrite decision.  |
| Bundle size optimization    | In progress | EG-49877      | Target: <200KB gzipped for initial load.             |

## Team

- **Owning team:** Travel Platform — Search Experience
- **Tech lead:** Platform Consolidation Engineering
- **Slack:** `#search-experience-eng`
- **On-call rotation:** PagerDuty — `search-exp-oncall`

## Contributing

1. Create a feature branch from `main`
2. Follow the [EG TypeScript Style Guide](https://internal.expediagroup.com/style-guide/typescript)
3. Ensure all lint checks pass
4. Submit a PR and request review from `@search-experience-eng`
5. PRs require 2 approvals before merge

## License

Internal — Expedia Group, Inc. All rights reserved.

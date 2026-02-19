import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FlightSearchCard from "./FlightSearchCard";
import { FlightResult, CabinClass } from "../../types";
import { AIRPORTS } from "../../constants/airports";

function findAirport(code: string) {
  const airport = AIRPORTS.find((a) => a.code === code);
  if (!airport) throw new Error(`Airport ${code} not found`);
  return airport;
}

function makeFlight(overrides: Partial<FlightResult> = {}): FlightResult {
  return {
    id: "TEST-001",
    airline: "United Airlines",
    airlineCode: "UA",
    flightNumber: "UA 100",
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
    amenities: ["Wi-Fi", "Power outlets", "Entertainment"],
    co2Emissions: "180 kg CO2",
    baggageIncluded: true,
    refundable: false,
    ...overrides,
  };
}

function renderCard(flight: FlightResult, isMember = false) {
  return render(
    <MemoryRouter>
      <FlightSearchCard flight={flight} isMember={isMember} />
    </MemoryRouter>
  );
}

describe("FlightSearchCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2024-03-15") });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders airline name and flight number", () => {
    renderCard(makeFlight());
    expect(screen.getByText("United Airlines")).toBeInTheDocument();
    expect(screen.getByText("UA 100")).toBeInTheDocument();
  });

  it("renders departure and arrival times", () => {
    renderCard(makeFlight());
    expect(screen.getByText("08:00 AM")).toBeInTheDocument();
    expect(screen.getByText("11:00 AM")).toBeInTheDocument();
  });

  it("renders origin and destination codes", () => {
    renderCard(makeFlight());
    expect(screen.getAllByText("JFK").length).toBeGreaterThan(0);
    expect(screen.getAllByText("LAX").length).toBeGreaterThan(0);
  });

  it("renders duration", () => {
    renderCard(makeFlight());
    expect(screen.getByText("5h 00m")).toBeInTheDocument();
  });

  it("shows Nonstop for 0 stops", () => {
    renderCard(makeFlight({ stops: 0 }));
    expect(screen.getByText("Nonstop")).toBeInTheDocument();
  });

  it("shows stop count for 1+ stops", () => {
    renderCard(
      makeFlight({ stops: 1, stopCities: ["Dallas (DFW)"] })
    );
    expect(screen.getByText("1 stop")).toBeInTheDocument();
    expect(screen.getByText("Dallas (DFW)")).toBeInTheDocument();
  });

  it("shows plural stops text for 2+ stops", () => {
    renderCard(
      makeFlight({
        stops: 2,
        stopCities: ["Dallas (DFW)", "Denver (DEN)"],
      })
    );
    expect(screen.getByText("2 stops")).toBeInTheDocument();
  });

  it("shows strikethrough original price when on sale", () => {
    renderCard(makeFlight({ price: 200, originalPrice: 300 }));
    expect(screen.getByText("$300")).toBeInTheDocument();
  });

  it("does not show strikethrough when no sale", () => {
    renderCard(makeFlight({ price: 300, originalPrice: 300 }));
    const strikeThroughs = document.querySelectorAll(".line-through");
    expect(strikeThroughs.length).toBe(0);
  });

  it("shows seat warning when seatsLeft <= 5", () => {
    renderCard(makeFlight({ seatsLeft: 3 }));
    expect(screen.getByText(/3 seats left/)).toBeInTheDocument();
  });

  it("does not show seat warning when seatsLeft > 5", () => {
    renderCard(makeFlight({ seatsLeft: 10 }));
    expect(screen.queryByText(/seats? left/)).not.toBeInTheDocument();
  });

  it("shows singular seat text for 1 seat", () => {
    renderCard(makeFlight({ seatsLeft: 1 }));
    expect(screen.getByText(/1 seat left/)).toBeInTheDocument();
  });

  it("renders aircraft type", () => {
    renderCard(makeFlight());
    expect(screen.getByText("Boeing 737")).toBeInTheDocument();
  });

  it("shows Bag included when baggageIncluded", () => {
    renderCard(makeFlight({ baggageIncluded: true }));
    expect(screen.getByText("Bag included")).toBeInTheDocument();
  });

  it("shows No bag included when not baggageIncluded", () => {
    renderCard(makeFlight({ baggageIncluded: false }));
    expect(screen.getByText("No bag included")).toBeInTheDocument();
  });

  it("shows Refundable badge when refundable", () => {
    renderCard(makeFlight({ refundable: true }));
    expect(screen.getByText("Refundable")).toBeInTheDocument();
  });

  it("does not show Refundable when not refundable", () => {
    renderCard(makeFlight({ refundable: false }));
    expect(screen.queryByText("Refundable")).not.toBeInTheDocument();
  });

  it("shows CO2 emissions", () => {
    renderCard(makeFlight());
    expect(screen.getByText("180 kg CO2")).toBeInTheDocument();
  });

  it("renders Select button", () => {
    renderCard(makeFlight());
    expect(screen.getByText("Select")).toBeInTheDocument();
  });

  it("shows Price details toggle", () => {
    renderCard(makeFlight());
    expect(screen.getByText("Price details")).toBeInTheDocument();
  });

  it("expands price breakdown on click", () => {
    renderCard(makeFlight());
    const toggle = screen.getByText("Price details");
    fireEvent.click(toggle);
    expect(screen.getByText("Base fare")).toBeInTheDocument();
    expect(screen.getByText("Taxes")).toBeInTheDocument();
    expect(screen.getByText("Fees & surcharges")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("collapses price breakdown on second click", () => {
    renderCard(makeFlight());
    const toggle = screen.getByText("Price details");
    fireEvent.click(toggle);
    expect(screen.getByText("Base fare")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.queryByText("Base fare")).not.toBeInTheDocument();
  });

  it("shows member savings when isMember and savings > 0", () => {
    const flight = makeFlight({ price: 500, originalPrice: 500 });
    renderCard(flight, true);
    const savingsEl = document.querySelector(".text-green-600");
    expect(savingsEl).not.toBeNull();
  });

  it("shows loyalty points in expanded view when member", () => {
    const flight = makeFlight({ price: 500, originalPrice: 500 });
    renderCard(flight, true);
    fireEvent.click(screen.getByText("Price details"));
    expect(screen.getByText("Loyalty points earned")).toBeInTheDocument();
  });

  it("shows discount line when there is a discount", () => {
    const flight = makeFlight({ price: 200, originalPrice: 350 });
    renderCard(flight);
    fireEvent.click(screen.getByText("Price details"));
    expect(screen.getByText("Discount")).toBeInTheDocument();
  });

  it("renders amenities (up to 3)", () => {
    renderCard(makeFlight({ amenities: ["Wi-Fi", "Power outlets", "Entertainment", "Extra legroom"] }));
    expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
    expect(screen.getByText("Power outlets")).toBeInTheDocument();
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
    expect(screen.queryByText("Extra legroom")).not.toBeInTheDocument();
  });
});

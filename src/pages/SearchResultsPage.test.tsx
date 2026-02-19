import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchResultsPage from "./SearchResultsPage";

function renderPage(searchParams = "?origin=JFK&destination=LAX&depart=2026-03-15&return=2026-03-22&travelers=1&cabin=economy") {
  return render(
    <MemoryRouter initialEntries={[`/flights/search${searchParams}`]}>
      <SearchResultsPage />
    </MemoryRouter>
  );
}

describe("SearchResultsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2024-03-15") });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the page with nav and footer", () => {
    renderPage();
    expect(screen.getByText("Shop travel")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  it("displays origin and destination info", () => {
    renderPage();
    expect(screen.getByText(/New York/)).toBeInTheDocument();
    expect(screen.getByText(/Los Angeles/)).toBeInTheDocument();
  });

  it("displays traveler count", () => {
    renderPage();
    expect(screen.getByText(/1 traveler/)).toBeInTheDocument();
  });

  it("shows flight count", () => {
    renderPage();
    expect(screen.getByText(/flights? found/)).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    renderPage();
    expect(screen.getByDisplayValue("Price (lowest)")).toBeInTheDocument();
  });

  it("renders filter sections", () => {
    renderPage();
    expect(screen.getByText("Stops")).toBeInTheDocument();
    expect(screen.getByText("Airlines")).toBeInTheDocument();
    expect(screen.getByText("Membership")).toBeInTheDocument();
  });

  it("renders stop filter options", () => {
    renderPage();
    expect(screen.getByText("Any number of stops")).toBeInTheDocument();
    expect(screen.getByText("Nonstop only")).toBeInTheDocument();
    expect(screen.getByText("1 stop or fewer")).toBeInTheDocument();
  });

  it("renders flight cards", () => {
    renderPage();
    expect(screen.getAllByText("United Airlines").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Delta Air Lines").length).toBeGreaterThan(0);
  });

  it("filters flights by nonstop", () => {
    renderPage();
    const nonstopRadio = screen.getByLabelText("Nonstop only");
    fireEvent.click(nonstopRadio);
    const flightCount = screen.getByText(/flights? found/);
    expect(flightCount).toBeInTheDocument();
  });

  it("filters flights by 1 stop or fewer", () => {
    renderPage();
    const oneStopRadio = screen.getByLabelText("1 stop or fewer");
    fireEvent.click(oneStopRadio);
    expect(screen.getByText(/flights? found/)).toBeInTheDocument();
  });

  it("filters by airline checkbox", () => {
    renderPage();
    const spiritCheckbox = screen.getByLabelText("Spirit Airlines");
    fireEvent.click(spiritCheckbox);
    expect(screen.getByText(/flights? found/)).toBeInTheDocument();
  });

  it("toggles member pricing", () => {
    renderPage();
    const memberCheckbox = screen.getByLabelText("Show member prices");
    fireEvent.click(memberCheckbox);
    expect(
      screen.getByText(/Member prices shown/)
    ).toBeInTheDocument();
  });

  it("hides member banner when not toggled", () => {
    renderPage();
    expect(screen.queryByText(/Member prices shown/)).not.toBeInTheDocument();
  });

  it("changes sort option", () => {
    renderPage();
    const sortSelect = screen.getByDisplayValue("Price (lowest)");
    fireEvent.change(sortSelect, { target: { value: "duration" } });
    expect(screen.getByDisplayValue("Duration (shortest)")).toBeInTheDocument();
  });

  it("sorts by departure", () => {
    renderPage();
    const sortSelect = screen.getByDisplayValue("Price (lowest)");
    fireEvent.change(sortSelect, { target: { value: "departure" } });
    expect(
      screen.getByDisplayValue("Departure (earliest)")
    ).toBeInTheDocument();
  });

  it("sorts by stops", () => {
    renderPage();
    const sortSelect = screen.getByDisplayValue("Price (lowest)");
    fireEvent.change(sortSelect, { target: { value: "stops" } });
    expect(screen.getByDisplayValue("Stops (fewest)")).toBeInTheDocument();
  });

  it("shows empty state when all flights filtered out", () => {
    renderPage();
    const nonstopRadio = screen.getByLabelText("Nonstop only");
    fireEvent.click(nonstopRadio);
    const spiritCheckbox = screen.getByLabelText("Spirit Airlines");
    fireEvent.click(spiritCheckbox);
    expect(
      screen.getByText("No flights match your filters")
    ).toBeInTheDocument();
  });

  it("shows Modify search link", () => {
    renderPage();
    expect(screen.getByText("Modify search")).toBeInTheDocument();
  });

  it("shows cabin class from params", () => {
    renderPage();
    expect(screen.getByText(/economy/i)).toBeInTheDocument();
  });

  it("uses default params when none provided", () => {
    renderPage("");
    expect(screen.getByText(/flights? found/)).toBeInTheDocument();
  });

  it("displays plural travelers", () => {
    renderPage("?origin=JFK&destination=LAX&depart=2026-03-15&return=2026-03-22&travelers=3&cabin=economy");
    expect(screen.getByText(/3 travelers/)).toBeInTheDocument();
  });
});

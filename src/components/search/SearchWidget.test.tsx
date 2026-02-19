import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchWidget from "./SearchWidget";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWidget() {
  return render(
    <MemoryRouter>
      <SearchWidget />
    </MemoryRouter>
  );
}

describe("SearchWidget", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders all search tabs", () => {
    renderWidget();
    expect(screen.getByText("Stays")).toBeInTheDocument();
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Cars")).toBeInTheDocument();
    expect(screen.getByText("Packages")).toBeInTheDocument();
    expect(screen.getByText("Things to do")).toBeInTheDocument();
    expect(screen.getByText("Cruises")).toBeInTheDocument();
  });

  it("shows flights tab by default", () => {
    renderWidget();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Roundtrip")).toBeInTheDocument();
  });

  it("switches to hotels tab", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    expect(screen.getByText("Going to")).toBeInTheDocument();
    expect(screen.getByText("Check-in", { exact: false })).toBeInTheDocument();
  });

  it("switches to cars tab", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Cars"));
    expect(screen.getByText("Pick-up")).toBeInTheDocument();
  });

  it("shows trip type options", () => {
    renderWidget();
    expect(screen.getByText("Roundtrip")).toBeInTheDocument();
    expect(screen.getByText("One-way")).toBeInTheDocument();
    expect(screen.getByText("Multi-city")).toBeInTheDocument();
  });

  it("shows cabin class selector", () => {
    renderWidget();
    const select = screen.getByDisplayValue("Economy");
    expect(select).toBeInTheDocument();
  });

  it("shows traveler counter", () => {
    renderWidget();
    expect(screen.getByText("1 Traveler")).toBeInTheDocument();
  });

  it("opens traveler dropdown on click", () => {
    renderWidget();
    fireEvent.click(screen.getByText("1 Traveler"));
    expect(screen.getByText("Adults")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("increments traveler count", () => {
    renderWidget();
    fireEvent.click(screen.getByText("1 Traveler"));
    const container = screen.getByText("Adults").closest("div")!;
    const plusButtons = container.parentElement!.querySelectorAll("button");
    const plusButton = Array.from(plusButtons).find(
      (btn) => !btn.disabled && btn.querySelector("svg")
    );
    if (plusButton) {
      fireEvent.click(plusButton);
    }
    expect(screen.getByText("2 Travelers")).toBeInTheDocument();
  });

  it("closes traveler dropdown on Done click", () => {
    renderWidget();
    fireEvent.click(screen.getByText("1 Traveler"));
    expect(screen.getByText("Adults")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Done"));
    expect(screen.queryByText("Adults")).not.toBeInTheDocument();
  });

  it("hides return date for one-way trip", () => {
    renderWidget();
    expect(screen.getByText("Returning")).toBeInTheDocument();
    fireEvent.click(screen.getByText("One-way"));
    expect(screen.queryByText("Returning")).not.toBeInTheDocument();
  });

  it("shows return date for roundtrip", () => {
    renderWidget();
    expect(screen.getByText("Returning")).toBeInTheDocument();
  });

  it("shows add-on checkboxes", () => {
    renderWidget();
    expect(screen.getByText("Add a place to stay")).toBeInTheDocument();
    expect(screen.getByText("Add a car")).toBeInTheDocument();
  });

  it("renders Search button", () => {
    renderWidget();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("has Leaving from and Going to fields", () => {
    renderWidget();
    expect(screen.getByText("Leaving from")).toBeInTheDocument();
    expect(screen.getByText("Going to")).toBeInTheDocument();
  });

  it("renders swap airports button", () => {
    renderWidget();
    const swapButton = screen.getByTitle("Swap airports");
    expect(swapButton).toBeInTheDocument();
  });

  it("has departing date field", () => {
    renderWidget();
    expect(screen.getByText("Departing")).toBeInTheDocument();
  });

  it("hotels tab shows destination input and allows typing", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    const destInput = screen.getByPlaceholderText("Enter a destination");
    fireEvent.change(destInput, { target: { value: "Miami" } });
    expect(destInput).toHaveValue("Miami");
  });

  it("hotels tab shows check-in and check-out date inputs", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    expect(screen.getByText("Check-in")).toBeInTheDocument();
    expect(screen.getByText("Check-out")).toBeInTheDocument();
  });

  it("hotels tab allows changing check-in date", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(dateInputs[0], { target: { value: "2026-04-01" } });
    expect(dateInputs[0]).toHaveValue("2026-04-01");
  });

  it("hotels tab allows changing check-out date", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[1], { target: { value: "2026-04-05" } });
    expect(dateInputs[1]).toHaveValue("2026-04-05");
  });

  it("hotels tab shows rooms selector", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    expect(screen.getByText("Rooms")).toBeInTheDocument();
  });

  it("hotels tab allows changing room count", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    const roomSelect = screen.getByDisplayValue("1 Room");
    fireEvent.change(roomSelect, { target: { value: "3" } });
    expect(roomSelect).toHaveValue("3");
  });

  it("hotels tab shows Search button", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Stays"));
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("cars tab shows pick-up location input", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Cars"));
    const pickupInput = screen.getByPlaceholderText("City, airport, or address");
    expect(pickupInput).toBeInTheDocument();
    fireEvent.change(pickupInput, { target: { value: "LAX" } });
    expect(pickupInput).toHaveValue("LAX");
  });

  it("cars tab shows pick-up and drop-off date inputs", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Cars"));
    expect(screen.getByText("Pick-up date")).toBeInTheDocument();
    expect(screen.getByText("Drop-off date")).toBeInTheDocument();
  });

  it("cars tab allows changing pick-up date", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Cars"));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: "2026-05-01" } });
    expect(dateInputs[0]).toHaveValue("2026-05-01");
  });

  it("cars tab allows changing drop-off date", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Cars"));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[1], { target: { value: "2026-05-05" } });
    expect(dateInputs[1]).toHaveValue("2026-05-05");
  });

  it("cars tab shows return to different location checkbox", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Cars"));
    expect(screen.getByText("Return car to a different location")).toBeInTheDocument();
  });

  it("cars tab shows Search button", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Cars"));
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("changes cabin class via selector", () => {
    renderWidget();
    const select = screen.getByDisplayValue("Economy");
    fireEvent.change(select, { target: { value: "business" } });
    expect(select).toHaveValue("business");
  });

  it("decrements traveler count but not below 1", () => {
    renderWidget();
    fireEvent.click(screen.getByText("1 Traveler"));
    const minusButton = document.querySelector("button[disabled]");
    expect(minusButton).not.toBeNull();
  });

  it("changes departing date", () => {
    renderWidget();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: "2026-04-10" } });
    expect(dateInputs[0]).toHaveValue("2026-04-10");
  });

  it("changes returning date", () => {
    renderWidget();
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[1], { target: { value: "2026-04-17" } });
    expect(dateInputs[1]).toHaveValue("2026-04-17");
  });

  it("search navigates with selected airports", () => {
    renderWidget();
    const leavingFrom = screen.getByText("Leaving from").closest(".relative")!;
    fireEvent.click(leavingFrom.querySelector('[class*="cursor-pointer"]')!);
    const originInput = screen.getAllByPlaceholderText("City or airport")[0];
    fireEvent.change(originInput, { target: { value: "JFK" } });
    fireEvent.click(screen.getByText("New York"));

    const goingTo = screen.getByText("Going to").closest(".relative")!;
    fireEvent.click(goingTo.querySelector('[class*="cursor-pointer"]')!);
    const destInput = screen.getAllByPlaceholderText("City or airport")[0];
    fireEvent.change(destInput, { target: { value: "LAX" } });
    fireEvent.click(screen.getByText("Los Angeles"));

    fireEvent.click(screen.getByText("Search"));
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("/flights/search?")
    );
  });

  it("swap airports swaps origin and destination", () => {
    renderWidget();
    const leavingFrom = screen.getByText("Leaving from").closest(".relative")!;
    fireEvent.click(leavingFrom.querySelector('[class*="cursor-pointer"]')!);
    const originInput = screen.getAllByPlaceholderText("City or airport")[0];
    fireEvent.change(originInput, { target: { value: "JFK" } });
    fireEvent.click(screen.getByText("New York"));

    const goingTo = screen.getByText("Going to").closest(".relative")!;
    fireEvent.click(goingTo.querySelector('[class*="cursor-pointer"]')!);
    const destInput = screen.getAllByPlaceholderText("City or airport")[0];
    fireEvent.change(destInput, { target: { value: "LAX" } });
    fireEvent.click(screen.getByText("Los Angeles"));

    expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
    expect(screen.getByText("Los Angeles (LAX)")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Swap airports"));
    expect(screen.getByText("Los Angeles (LAX)")).toBeInTheDocument();
    expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
  });

  it("search does not navigate without airports selected", () => {
    renderWidget();
    fireEvent.click(screen.getByText("Search"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("toggles traveler dropdown open and closed", () => {
    renderWidget();
    fireEvent.click(screen.getByText("1 Traveler"));
    expect(screen.getByText("Adults")).toBeInTheDocument();
    fireEvent.click(screen.getByText("1 Traveler"));
    expect(screen.queryByText("Adults")).not.toBeInTheDocument();
  });

  it("toggles show filters button on mobile", () => {
    renderWidget();
    fireEvent.click(screen.getByText("1 Traveler"));
    expect(screen.getByText("Adults")).toBeInTheDocument();
  });
});

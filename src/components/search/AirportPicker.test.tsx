import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AirportPicker from "./AirportPicker";
import { Airport } from "../../types";

function renderPicker(
  props: Partial<{
    label: string;
    selected: Airport | null;
    onSelect: (airport: Airport) => void;
    placeholder: string;
  }> = {}
) {
  const defaultProps = {
    label: "Leaving from",
    selected: null,
    onSelect: vi.fn(),
    placeholder: "City or airport",
    ...props,
  };
  return {
    ...render(<AirportPicker {...defaultProps} />),
    onSelect: defaultProps.onSelect,
  };
}

describe("AirportPicker", () => {
  it("renders the label", () => {
    renderPicker({ label: "Going to" });
    expect(screen.getByText("Going to")).toBeInTheDocument();
  });

  it("shows placeholder when no airport selected", () => {
    renderPicker({ placeholder: "City or airport" });
    expect(screen.getByText("City or airport")).toBeInTheDocument();
  });

  it("shows selected airport city and code", () => {
    const jfk: Airport = {
      code: "JFK",
      city: "New York",
      name: "John F. Kennedy International Airport",
      country: "United States",
    };
    renderPicker({ selected: jfk });
    expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    renderPicker();
    const trigger = screen.getByText("City or airport");
    fireEvent.click(trigger);
    expect(screen.getByPlaceholderText("City or airport")).toBeInTheDocument();
  });

  it("filters airports by query", async () => {
    renderPicker();
    fireEvent.click(screen.getByText("City or airport"));
    const input = screen.getByPlaceholderText("City or airport");
    fireEvent.change(input, { target: { value: "Tokyo" } });
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.getByText("NRT")).toBeInTheDocument();
  });

  it("shows 'No airports found' for non-matching query", () => {
    renderPicker();
    fireEvent.click(screen.getByText("City or airport"));
    const input = screen.getByPlaceholderText("City or airport");
    fireEvent.change(input, { target: { value: "zzzznotexist" } });
    expect(screen.getByText("No airports found")).toBeInTheDocument();
  });

  it("calls onSelect when airport is clicked", () => {
    const { onSelect } = renderPicker();
    fireEvent.click(screen.getByText("City or airport"));
    const input = screen.getByPlaceholderText("City or airport");
    fireEvent.change(input, { target: { value: "JFK" } });
    const jfkButton = screen.getByText("New York");
    fireEvent.click(jfkButton);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: "JFK", city: "New York" })
    );
  });

  it("closes dropdown after selection", () => {
    renderPicker();
    fireEvent.click(screen.getByText("City or airport"));
    const input = screen.getByPlaceholderText("City or airport");
    fireEvent.change(input, { target: { value: "JFK" } });
    fireEvent.click(screen.getByText("New York"));
    expect(
      screen.queryByPlaceholderText("City or airport")
    ).not.toBeInTheDocument();
  });

  it("filters by airport code", () => {
    renderPicker();
    fireEvent.click(screen.getByText("City or airport"));
    const input = screen.getByPlaceholderText("City or airport");
    fireEvent.change(input, { target: { value: "LAX" } });
    expect(screen.getByText("Los Angeles")).toBeInTheDocument();
  });

  it("filters by country", () => {
    renderPicker();
    fireEvent.click(screen.getByText("City or airport"));
    const input = screen.getByPlaceholderText("City or airport");
    fireEvent.change(input, { target: { value: "Japan" } });
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
  });

  it("closes on click outside", () => {
    renderPicker();
    fireEvent.click(screen.getByText("City or airport"));
    expect(screen.getByPlaceholderText("City or airport")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(
      screen.queryByPlaceholderText("City or airport")
    ).not.toBeInTheDocument();
  });
});

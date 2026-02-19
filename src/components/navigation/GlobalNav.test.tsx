import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GlobalNav from "./GlobalNav";

function renderNav() {
  return render(
    <MemoryRouter>
      <GlobalNav />
    </MemoryRouter>
  );
}

describe("GlobalNav", () => {
  it("renders the expedia logo text", () => {
    renderNav();
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders navigation buttons", () => {
    renderNav();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("List your property")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Trips")).toBeInTheDocument();
  });

  it("renders Shop travel button", () => {
    renderNav();
    expect(screen.getByText("Shop travel")).toBeInTheDocument();
  });

  it("shows dropdown on hover of Shop travel", () => {
    renderNav();
    const shopTravel = screen.getByText("Shop travel");
    fireEvent.mouseEnter(shopTravel.closest("button")!);
    expect(screen.getByText("Stays")).toBeInTheDocument();
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Cars")).toBeInTheDocument();
    expect(screen.getByText("Packages")).toBeInTheDocument();
    expect(screen.getByText("Things to do")).toBeInTheDocument();
    expect(screen.getByText("Cruises")).toBeInTheDocument();
  });

  it("hides dropdown on mouse leave", () => {
    renderNav();
    const shopTravel = screen.getByText("Shop travel");
    const button = shopTravel.closest("button")!;
    fireEvent.mouseEnter(button);
    expect(screen.getByText("Stays")).toBeInTheDocument();
    fireEvent.mouseLeave(button);
    expect(screen.queryByText("Stays")).not.toBeInTheDocument();
  });

  it("renders user avatar", () => {
    renderNav();
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("toggles mobile menu", () => {
    renderNav();
    const menuButtons = document.querySelectorAll("button.lg\\:hidden");
    expect(menuButtons.length).toBeGreaterThan(0);
    fireEvent.click(menuButtons[0]);
    expect(screen.getAllByText("Shop travel").length).toBeGreaterThanOrEqual(1);
  });
});

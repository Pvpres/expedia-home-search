import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "./HeroSection";

describe("HeroSection", () => {
  it("renders the hero heading", () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );
    expect(
      screen.getByText("The one place you go to go places")
    ).toBeInTheDocument();
  });

  it("renders the SearchWidget", () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Stays")).toBeInTheDocument();
  });
});

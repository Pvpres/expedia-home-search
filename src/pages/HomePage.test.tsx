import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

describe("HomePage", () => {
  it("renders the GlobalNav", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByText("Shop travel")).toBeInTheDocument();
  });

  it("renders the hero section heading", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(
      screen.getByText("The one place you go to go places")
    ).toBeInTheDocument();
  });

  it("renders the promo section", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByText("Annual Vacation Sale")).toBeInTheDocument();
  });

  it("renders the footer", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Privacy policy")).toBeInTheDocument();
  });
});

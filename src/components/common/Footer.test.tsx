import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders all link category headers", () => {
    render(<Footer />);
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Policies")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("renders company links", () => {
    render(<Footer />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Jobs")).toBeInTheDocument();
  });

  it("renders explore links", () => {
    render(<Footer />);
    expect(
      screen.getByText("United States travel guide")
    ).toBeInTheDocument();
  });

  it("renders policies links", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of use")).toBeInTheDocument();
  });

  it("renders help links", () => {
    render(<Footer />);
    expect(screen.getByText("Use a coupon")).toBeInTheDocument();
  });

  it("renders dynamic year in copyright", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    const copyright = screen.getByText(new RegExp(year));
    expect(copyright).toBeInTheDocument();
  });

  it("renders the footer logo", () => {
    render(<Footer />);
    const svgs = document.querySelectorAll("footer svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders USD and United States selectors", () => {
    render(<Footer />);
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
  });
});

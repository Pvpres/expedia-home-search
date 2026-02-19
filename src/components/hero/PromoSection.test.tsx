import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PromoSection from "./PromoSection";

describe("PromoSection", () => {
  it("renders the annual vacation sale banner", () => {
    render(<PromoSection />);
    expect(screen.getByText("Annual Vacation Sale")).toBeInTheDocument();
  });

  it("renders member deals heading", () => {
    render(<PromoSection />);
    expect(
      screen.getByText("Members save up to 40% on select stays")
    ).toBeInTheDocument();
  });

  it("renders all deal cards", () => {
    render(<PromoSection />);
    expect(screen.getByText("Cancún Resort")).toBeInTheDocument();
    expect(screen.getByText("Paris Hotel")).toBeInTheDocument();
    expect(screen.getByText("Tokyo Stay")).toBeInTheDocument();
    expect(screen.getByText("London Suite")).toBeInTheDocument();
  });

  it("renders deal locations", () => {
    render(<PromoSection />);
    expect(screen.getByText("Mexico")).toBeInTheDocument();
    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Japan")).toBeInTheDocument();
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
  });

  it("renders deal prices", () => {
    render(<PromoSection />);
    expect(screen.getByText("$247")).toBeInTheDocument();
    expect(screen.getByText("$489")).toBeInTheDocument();
  });

  it("renders original prices with strikethrough", () => {
    render(<PromoSection />);
    expect(screen.getByText("$412")).toBeInTheDocument();
    expect(screen.getByText("$815")).toBeInTheDocument();
  });

  it("renders VIP badges for VIP deals", () => {
    render(<PromoSection />);
    const vipBadges = screen.getAllByText("VIP Access");
    expect(vipBadges.length).toBe(3);
  });

  it("renders See more deals button", () => {
    render(<PromoSection />);
    expect(screen.getByText("See more deals")).toBeInTheDocument();
  });

  it("renders deal images", () => {
    render(<PromoSection />);
    const images = document.querySelectorAll("img");
    expect(images.length).toBe(4);
  });

  it("renders heart/favorite buttons for each deal", () => {
    render(<PromoSection />);
    const heartButtons = document.querySelectorAll(
      "button.absolute.top-3.right-3"
    );
    expect(heartButtons.length).toBe(4);
  });
});

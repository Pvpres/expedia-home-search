describe("Flight Search Flow", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("selects origin airport", () => {
    cy.contains("Leaving from")
      .closest(".relative")
      .find('[class*="cursor-pointer"]')
      .click();
    cy.get('input[placeholder="City or airport"]').first().type("JFK");
    cy.contains("button", "New York").click();
    cy.contains("New York (JFK)").should("be.visible");
  });

  it("selects destination airport", () => {
    cy.contains("Going to")
      .closest(".relative")
      .find('[class*="cursor-pointer"]')
      .first()
      .click();
    cy.get('input[placeholder="City or airport"]').first().type("LAX");
    cy.contains("button", "Los Angeles").click();
    cy.contains("Los Angeles (LAX)").should("be.visible");
  });

  it("swaps airports", () => {
    cy.contains("Leaving from")
      .closest(".relative")
      .find('[class*="cursor-pointer"]')
      .click();
    cy.get('input[placeholder="City or airport"]').first().type("JFK");
    cy.contains("button", "New York").click();

    cy.contains("Going to")
      .closest(".relative")
      .find('[class*="cursor-pointer"]')
      .first()
      .click();
    cy.get('input[placeholder="City or airport"]').first().type("LAX");
    cy.contains("button", "Los Angeles").click();

    cy.get('button[title="Swap airports"]').click();
    cy.contains("Los Angeles (LAX)").should("be.visible");
    cy.contains("New York (JFK)").should("be.visible");
  });

  it("opens and uses traveler counter", () => {
    cy.contains("1 Traveler").click();
    cy.contains("Adults").should("be.visible");
    cy.contains("Done").should("be.visible");
  });

  it("selects trip type one-way", () => {
    cy.contains("One-way").click();
    cy.contains("Returning").should("not.exist");
  });

  it("selects roundtrip to show return date", () => {
    cy.contains("Roundtrip").click();
    cy.contains("Returning").should("be.visible");
  });

  it("navigates to search results when searching with airports selected", () => {
    cy.contains("Leaving from")
      .closest(".relative")
      .find('[class*="cursor-pointer"]')
      .click();
    cy.get('input[placeholder="City or airport"]').first().type("JFK");
    cy.contains("button", "New York").click();

    cy.contains("Going to")
      .closest(".relative")
      .find('[class*="cursor-pointer"]')
      .first()
      .click();
    cy.get('input[placeholder="City or airport"]').first().type("LAX");
    cy.contains("button", "Los Angeles").click();

    cy.contains("button", "Search").click();
    cy.url().should("include", "/flights/search");
    cy.url().should("include", "origin=JFK");
    cy.url().should("include", "destination=LAX");
  });
});

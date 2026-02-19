describe("Search Results Page", () => {
  beforeEach(() => {
    cy.visit(
      "/flights/search?origin=JFK&destination=LAX&depart=2026-03-15&return=2026-03-22&travelers=1&cabin=economy"
    );
  });

  it("renders flight results", () => {
    cy.get('[class*="bg-white rounded-xl border"]').should(
      "have.length.at.least",
      1
    );
  });

  it("displays origin and destination in header", () => {
    cy.contains("New York").should("be.visible");
    cy.contains("Los Angeles").should("be.visible");
  });

  it("displays flight count", () => {
    cy.contains(/\d+ flights? found/).should("be.visible");
  });

  it("shows filter panel with stops options", () => {
    cy.contains("Filters").should("exist");
    cy.contains("Any number of stops").should("exist");
    cy.contains("Nonstop only").should("exist");
    cy.contains("1 stop or fewer").should("exist");
  });

  it("shows airline filter checkboxes", () => {
    cy.contains("Airlines").should("exist");
    cy.contains("United Airlines").should("exist");
    cy.contains("Delta Air Lines").should("exist");
  });

  it("filters by nonstop only", () => {
    cy.contains("Nonstop only").click();
    cy.contains(/\d+ flights? found/).should("be.visible");
    cy.contains("Nonstop").should("exist");
  });

  it("filters by 1 stop or fewer", () => {
    cy.contains("1 stop or fewer").click();
    cy.contains(/\d+ flights? found/).should("be.visible");
  });

  it("filters by airline", () => {
    cy.contains("label", "Spirit Airlines").click();
    cy.contains(/\d+ flights? found/).should("be.visible");
  });

  it("toggles member pricing", () => {
    cy.contains("Show member prices").click();
    cy.contains("Member prices shown").should("be.visible");
  });

  it("changes sort to duration", () => {
    cy.get("select").select("duration");
    cy.get("select").should("have.value", "duration");
  });

  it("changes sort to departure", () => {
    cy.get("select").select("departure");
    cy.get("select").should("have.value", "departure");
  });

  it("changes sort to stops", () => {
    cy.get("select").select("stops");
    cy.get("select").should("have.value", "stops");
  });

  it("shows empty state when filters exclude all flights", () => {
    cy.contains("Nonstop only").click();
    cy.contains("label", "Spirit Airlines").click();
    cy.contains("No flights match your filters").should("be.visible");
  });

  it("expands price details on a flight card", () => {
    cy.contains("Price details").first().click();
    cy.contains("Base fare").should("be.visible");
    cy.contains("Taxes").should("be.visible");
    cy.contains("Fees & surcharges").should("be.visible");
    cy.contains("Total").should("be.visible");
  });

  it("collapses price details on second click", () => {
    cy.contains("Price details").first().click();
    cy.contains("Base fare").should("be.visible");
    cy.contains("Price details").first().click();
    cy.contains("Base fare").should("not.exist");
  });

  it("shows Modify search link", () => {
    cy.contains("Modify search").should("be.visible");
    cy.contains("Modify search").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("shows Select button on flight cards", () => {
    cy.contains("Select").should("be.visible");
  });

  it("handles direct URL navigation with default params", () => {
    cy.visit("/flights/search");
    cy.contains(/\d+ flights? found/).should("be.visible");
  });
});

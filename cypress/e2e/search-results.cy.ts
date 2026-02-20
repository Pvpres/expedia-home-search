describe('Search Results Page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/flights/search?origin=JFK&destination=LAX&depart=2026-03-15&return=2026-03-22&travelers=1&cabin=economy');
  });

  it('displays route information', () => {
    cy.contains('New York').should('be.visible');
    cy.contains('Los Angeles').should('be.visible');
  });

  it('displays flight count', () => {
    cy.contains(/\d+ flights? found/).should('be.visible');
  });

  it('displays flight cards with Select buttons', () => {
    cy.contains('button', 'Select').should('be.visible');
  });

  it('displays sort dropdown with price as default', () => {
    cy.get('select').should('have.value', 'price');
  });

  it('changes sort to duration', () => {
    cy.get('select').select('duration');
    cy.get('select').should('have.value', 'duration');
  });

  it('changes sort to departure', () => {
    cy.get('select').select('departure');
    cy.get('select').should('have.value', 'departure');
  });

  it('changes sort to stops', () => {
    cy.get('select').select('stops');
    cy.get('select').should('have.value', 'stops');
  });

  it('displays stop filter options', () => {
    cy.contains('Any number of stops').should('exist');
    cy.contains('Nonstop only').should('exist');
    cy.contains('1 stop or fewer').should('exist');
  });

  it('filters to nonstop only', () => {
    cy.contains('label', 'Nonstop only').click({ force: true });
    cy.contains('Nonstop').should('exist');
  });

  it('displays airline filter checkboxes', () => {
    cy.contains('Airlines').should('exist');
  });

  it('toggles member pricing', () => {
    cy.contains('label', 'Show member prices').click({ force: true });
    cy.contains('Member prices shown').should('be.visible');
  });

  it('shows modify search link', () => {
    cy.contains('Modify search').should('be.visible');
  });

  it('navigates back to home on modify search click', () => {
    cy.contains('Modify search').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('expands price details on flight card', () => {
    cy.contains('Price details').first().click();
    cy.contains('Base fare').should('be.visible');
    cy.contains('Taxes').should('be.visible');
    cy.contains('Total').should('be.visible');
  });

  it('collapses price details on second click', () => {
    cy.contains('Price details').first().click();
    cy.contains('Base fare').should('be.visible');
    cy.contains('Price details').first().click();
    cy.contains('Base fare').should('not.exist');
  });

  it('shows traveler info from URL params', () => {
    cy.contains('1 traveler').should('be.visible');
  });

  it('handles direct URL navigation with query params', () => {
    cy.visit('/flights/search?origin=SFO&destination=LAX&travelers=2&cabin=business');
    cy.contains('San Francisco').should('be.visible');
    cy.contains('2 travelers').should('be.visible');
  });
});

describe('Flight Search Flow', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/');
  });

  it('opens airport picker and selects origin', () => {
    cy.contains('Leaving from').closest('.relative').click();
    cy.get('input[placeholder="City or airport"]').first().type('New York');
    cy.contains('button', 'New York').first().click();
    cy.contains('New York (JFK)').should('be.visible');
  });

  it('opens airport picker and selects destination', () => {
    cy.contains('Going to').closest('.relative').click();
    cy.get('input[placeholder="City or airport"]').first().type('Los Angeles');
    cy.contains('button', 'Los Angeles').first().click();
    cy.contains('Los Angeles (LAX)').should('be.visible');
  });

  it('allows swap airports button click', () => {
    cy.get('button[title="Swap airports"]').should('be.visible').click();
  });

  it('shows trip type options', () => {
    cy.contains('Roundtrip').should('be.visible');
    cy.contains('One-way').should('be.visible');
    cy.contains('Multi-city').should('be.visible');
  });

  it('hides return date when one-way is selected', () => {
    cy.contains('Returning').should('be.visible');
    cy.contains('One-way').click();
    cy.contains('Returning').should('not.exist');
  });

  it('shows cabin class selector', () => {
    cy.get('select').first().should('have.value', 'economy');
  });

  it('opens traveler picker and shows adults label', () => {
    cy.contains('1 Traveler').click();
    cy.contains('Adults').should('be.visible');
    cy.contains('Done').should('be.visible');
  });

  it('navigates to search results when origin and destination are set', () => {
    cy.contains('Leaving from').closest('.relative').click();
    cy.get('input[placeholder="City or airport"]').first().type('JFK');
    cy.contains('button', 'New York').first().click();

    cy.contains('Going to').closest('.relative').click();
    cy.get('input[placeholder="City or airport"]').first().type('LAX');
    cy.contains('button', 'Los Angeles').first().click();

    cy.contains('button', 'Search').click();
    cy.url().should('include', '/flights/search');
    cy.url().should('include', 'origin=JFK');
    cy.url().should('include', 'destination=LAX');
  });
});

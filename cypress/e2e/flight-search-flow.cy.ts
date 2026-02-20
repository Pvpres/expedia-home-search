describe('Flight Search Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('selects origin airport', () => {
    cy.contains('Leaving from').parent().parent().click();
    cy.get('input[placeholder="City or airport"]').first().type('New York');
    cy.contains('JFK').click();
    cy.contains('New York (JFK)').should('be.visible');
  });

  it('selects destination airport', () => {
    cy.contains('Going to').parent().parent().click();
    cy.get('input[placeholder="City or airport"]').first().type('Los Angeles');
    cy.contains('LAX').click();
    cy.contains('Los Angeles (LAX)').should('be.visible');
  });

  it('swaps airports', () => {
    cy.contains('Leaving from').parent().parent().click();
    cy.get('input[placeholder="City or airport"]').first().type('JFK');
    cy.contains('New York').click();

    cy.contains('Going to').parent().parent().click();
    cy.get('input[placeholder="City or airport"]').first().type('LAX');
    cy.contains('Los Angeles').click();

    cy.get('button[title="Swap airports"]').click();
    cy.contains('Los Angeles (LAX)').should('be.visible');
  });

  it('opens and uses traveler counter', () => {
    cy.contains('1 Traveler').click();
    cy.contains('Adults').should('be.visible');
    cy.contains('Done').should('be.visible');
  });

  it('selects trip type', () => {
    cy.contains('One-way').click();
    cy.get('input[value="oneway"]').should('be.checked');
  });

  it('hides return date for one-way', () => {
    cy.contains('Returning').should('be.visible');
    cy.contains('One-way').click();
    cy.contains('Returning').should('not.exist');
  });

  it('completes full search flow and navigates to results', () => {
    cy.contains('Leaving from').parent().parent().click();
    cy.get('input[placeholder="City or airport"]').first().type('JFK');
    cy.contains('New York').click();

    cy.contains('Going to').parent().parent().click();
    cy.get('input[placeholder="City or airport"]').first().type('LAX');
    cy.contains('Los Angeles').click();

    cy.contains('Search').click();
    cy.url().should('include', '/flights/search');
    cy.url().should('include', 'origin=JFK');
    cy.url().should('include', 'destination=LAX');
  });
});

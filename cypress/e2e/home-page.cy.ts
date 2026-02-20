describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the navigation bar with Expedia logo', () => {
    cy.get('header').should('be.visible');
    cy.contains('expedia').should('exist');
  });

  it('renders the hero heading', () => {
    cy.contains('The one place you go to go places').should('be.visible');
  });

  it('renders the search widget with all tabs', () => {
    cy.contains('Stays').should('be.visible');
    cy.contains('Flights').should('be.visible');
    cy.contains('Cars').should('be.visible');
    cy.contains('Packages').should('be.visible');
    cy.contains('Things to do').should('be.visible');
    cy.contains('Cruises').should('be.visible');
  });

  it('renders the promo section', () => {
    cy.contains('Annual Vacation Sale').should('be.visible');
    cy.contains('Members save up to 40% on select stays').should('be.visible');
  });

  it('renders deal cards', () => {
    cy.contains('Cancún Resort').should('be.visible');
    cy.contains('Paris Hotel').should('be.visible');
    cy.contains('Tokyo Stay').should('be.visible');
    cy.contains('London Suite').should('be.visible');
  });

  it('renders the footer', () => {
    cy.contains('Company').should('exist');
    cy.contains('Privacy policy').should('exist');
  });

  it('defaults to flights tab', () => {
    cy.contains('Leaving from').should('be.visible');
    cy.contains('Going to').should('be.visible');
  });

  it('switches to Stays tab', () => {
    cy.contains('button', 'Stays').click();
    cy.contains('Check-in').should('be.visible');
    cy.contains('Check-out').should('be.visible');
  });

  it('switches to Cars tab', () => {
    cy.contains('button', 'Cars').click();
    cy.contains('Pick-up').should('be.visible');
    cy.contains('Drop-off date').should('be.visible');
  });
});

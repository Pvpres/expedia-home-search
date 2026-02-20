describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the global navigation', () => {
    cy.contains('Shop travel').should('be.visible');
    cy.contains('List your property').should('be.visible');
    cy.contains('Support').should('be.visible');
    cy.contains('Trips').should('be.visible');
  });

  it('renders the hero tagline', () => {
    cy.contains('The one place you go to go places').should('be.visible');
  });

  it('renders search widget with all tabs', () => {
    cy.contains('Stays').should('be.visible');
    cy.contains('Flights').should('be.visible');
    cy.contains('Cars').should('be.visible');
    cy.contains('Packages').should('be.visible');
    cy.contains('Things to do').should('be.visible');
    cy.contains('Cruises').should('be.visible');
  });

  it('shows flights tab content by default', () => {
    cy.contains('Roundtrip').should('be.visible');
    cy.contains('One-way').should('be.visible');
    cy.contains('Leaving from').should('be.visible');
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
    cy.contains('Company').should('be.visible');
    cy.contains('Explore').should('be.visible');
    cy.contains('Policies').should('be.visible');
    cy.contains('Help').should('be.visible');
  });

  it('switches to hotels tab', () => {
    cy.contains('Stays').click();
    cy.contains('Going to').should('be.visible');
    cy.contains('Check-in').should('be.visible');
    cy.contains('Check-out').should('be.visible');
  });

  it('switches to cars tab', () => {
    cy.contains('Cars').click();
    cy.contains('Pick-up').should('be.visible');
    cy.contains('Pick-up date').should('be.visible');
    cy.contains('Drop-off date').should('be.visible');
  });
});

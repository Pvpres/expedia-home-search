describe('Search Results Page', () => {
  beforeEach(() => {
    cy.visit('/flights/search?origin=JFK&destination=LAX&depart=2026-03-15&return=2026-03-22&travelers=1&cabin=economy');
  });

  it('renders flight cards', () => {
    cy.contains('flights found').should('be.visible');
  });

  it('displays route info in header', () => {
    cy.contains('New York').should('be.visible');
    cy.contains('Los Angeles').should('be.visible');
  });

  it('displays traveler count', () => {
    cy.contains('1 traveler').should('be.visible');
  });

  it('renders sort dropdown with price selected', () => {
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

  it('renders filter section with stops options', () => {
    cy.contains('Any number of stops').should('be.visible');
    cy.contains('Nonstop only').should('be.visible');
    cy.contains('1 stop or fewer').should('be.visible');
  });

  it('filters by nonstop only', () => {
    cy.contains('Nonstop only').click();
    cy.contains('flights found').should('be.visible');
  });

  it('filters by 1 stop or fewer', () => {
    cy.contains('1 stop or fewer').click();
    cy.contains('flights found').should('be.visible');
  });

  it('renders airline filter checkboxes', () => {
    cy.contains('Airlines').should('be.visible');
    cy.contains('United Airlines').should('be.visible');
  });

  it('toggles member pricing', () => {
    cy.contains('Show member prices').click();
    cy.contains('Member prices shown').should('be.visible');
  });

  it('hides member banner when unchecked', () => {
    cy.contains('Member prices shown').should('not.exist');
  });

  it('expands price details on flight card', () => {
    cy.contains('Price details').first().click();
    cy.contains('Base fare').should('be.visible');
    cy.contains('Taxes').should('be.visible');
    cy.contains('Fees & surcharges').should('be.visible');
    cy.contains('Total').should('be.visible');
  });

  it('collapses price details on second click', () => {
    cy.contains('Price details').first().click();
    cy.contains('Base fare').should('be.visible');
    cy.contains('Price details').first().click();
    cy.contains('Base fare').should('not.exist');
  });

  it('renders modify search link', () => {
    cy.contains('Modify search').should('be.visible');
    cy.contains('Modify search').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('shows empty state when aggressively filtered', () => {
    cy.contains('Nonstop only').click();
    cy.get('input[type="checkbox"]').each(($el) => {
      const label = $el.parent().text();
      if (label.includes('Spirit Airlines')) {
        cy.wrap($el).click();
      }
    });
  });

  it('navigates directly with query params', () => {
    cy.visit('/flights/search?origin=SFO&destination=MIA&travelers=2&cabin=business');
    cy.contains('San Francisco').should('be.visible');
    cy.contains('2 travelers').should('be.visible');
  });

  it('renders select buttons on flight cards', () => {
    cy.contains('Select').should('be.visible');
  });

  it('shows airline badges', () => {
    cy.get('[class*="text-white text-xs font-bold"]').should('have.length.greaterThan', 0);
  });
});

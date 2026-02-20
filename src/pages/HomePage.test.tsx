import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('renders the hero heading', () => {
    renderHome();
    expect(screen.getByText('The one place you go to go places')).toBeInTheDocument();
  });

  it('renders the search widget', () => {
    renderHome();
    expect(screen.getByText('Flights')).toBeInTheDocument();
    expect(screen.getByText('Stays')).toBeInTheDocument();
  });

  it('renders the promo section', () => {
    renderHome();
    expect(screen.getByText('Annual Vacation Sale')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    renderHome();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('renders navigation', () => {
    renderHome();
    const expediaElements = screen.getAllByText('expedia');
    expect(expediaElements.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

function renderHome() {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>,
  );
}

describe('HomePage', () => {
  it('renders the navigation', () => {
    renderHome();
    expect(screen.getByText('Shop travel')).toBeInTheDocument();
  });

  it('renders the hero section', () => {
    renderHome();
    expect(screen.getByText('The one place you go to go places')).toBeInTheDocument();
  });

  it('renders the promo section', () => {
    renderHome();
    expect(screen.getByText('Annual Vacation Sale')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    renderHome();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('renders the search widget with tabs', () => {
    renderHome();
    expect(screen.getByText('Flights')).toBeInTheDocument();
    expect(screen.getByText('Stays')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from './HeroSection';

function renderHero() {
  return render(
    <BrowserRouter>
      <HeroSection />
    </BrowserRouter>,
  );
}

describe('HeroSection', () => {
  it('renders the tagline heading', () => {
    renderHero();
    expect(screen.getByText('The one place you go to go places')).toBeInTheDocument();
  });

  it('renders the search widget', () => {
    renderHero();
    expect(screen.getByText('Flights')).toBeInTheDocument();
  });
});

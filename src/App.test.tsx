import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders home page at root route', () => {
    render(<App />);
    expect(screen.getByText('The one place you go to go places')).toBeInTheDocument();
  });

  it('renders search widget on home page', () => {
    render(<App />);
    expect(screen.getByText('Flights')).toBeInTheDocument();
  });
});

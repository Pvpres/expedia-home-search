import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders footer categories', () => {
    render(<Footer />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('renders company links', () => {
    render(<Footer />);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
  });

  it('renders policy links', () => {
    render(<Footer />);
    expect(screen.getByText('Privacy policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of use')).toBeInTheDocument();
  });

  it('renders the expedia text in footer', () => {
    render(<Footer />);
    expect(screen.getByText('expedia')).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('renders United States locale', () => {
    render(<Footer />);
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('renders USD currency', () => {
    render(<Footer />);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});

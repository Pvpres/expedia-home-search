import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromoSection from './PromoSection';

describe('PromoSection', () => {
  it('renders the annual vacation sale banner', () => {
    render(<PromoSection />);
    expect(screen.getByText('Annual Vacation Sale')).toBeInTheDocument();
  });

  it('renders member savings heading', () => {
    render(<PromoSection />);
    expect(screen.getByText('Members save up to 40% on select stays')).toBeInTheDocument();
  });

  it('renders all deal cards', () => {
    render(<PromoSection />);
    expect(screen.getByText('Cancún Resort')).toBeInTheDocument();
    expect(screen.getByText('Paris Hotel')).toBeInTheDocument();
    expect(screen.getByText('Tokyo Stay')).toBeInTheDocument();
    expect(screen.getByText('London Suite')).toBeInTheDocument();
  });

  it('renders deal prices', () => {
    render(<PromoSection />);
    expect(screen.getByText('$247')).toBeInTheDocument();
    expect(screen.getByText('$489')).toBeInTheDocument();
  });

  it('renders VIP badges for VIP deals', () => {
    render(<PromoSection />);
    const vipBadges = screen.getAllByText('VIP Access');
    expect(vipBadges).toHaveLength(3);
  });

  it('does not render VIP badge for non-VIP deal', () => {
    const { container } = render(<PromoSection />);
    const cards = container.querySelectorAll('.group');
    expect(cards.length).toBe(4);
  });

  it('renders see more deals button', () => {
    render(<PromoSection />);
    expect(screen.getByText('See more deals')).toBeInTheDocument();
  });

  it('renders deal images', () => {
    render(<PromoSection />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(4);
  });
});

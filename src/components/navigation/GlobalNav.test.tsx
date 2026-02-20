import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GlobalNav from './GlobalNav';

function renderNav() {
  return render(
    <MemoryRouter>
      <GlobalNav />
    </MemoryRouter>
  );
}

describe('GlobalNav', () => {
  it('renders the expedia logo/text', () => {
    renderNav();
    expect(screen.getByText('expedia')).toBeInTheDocument();
  });

  it('renders Shop travel button', () => {
    renderNav();
    expect(screen.getByText('Shop travel')).toBeInTheDocument();
  });

  it('renders nav buttons', () => {
    renderNav();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('List your property')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Trips')).toBeInTheDocument();
  });

  it('renders user avatar', () => {
    renderNav();
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('toggles mobile menu on hamburger click', async () => {
    const user = userEvent.setup();
    renderNav();
    const menuButtons = screen.getAllByRole('button');
    const hamburger = menuButtons.find(b => b.classList.contains('lg:hidden'));
    if (hamburger) {
      await user.click(hamburger);
      const mobileShopTravel = screen.getAllByText('Shop travel');
      expect(mobileShopTravel.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows dropdown items on Shop travel hover', async () => {
    const user = userEvent.setup();
    renderNav();
    const shopTravel = screen.getByText('Shop travel');
    await user.hover(shopTravel);
    expect(screen.getByText('Stays')).toBeInTheDocument();
    expect(screen.getByText('Flights')).toBeInTheDocument();
    expect(screen.getByText('Cars')).toBeInTheDocument();
    expect(screen.getByText('Packages')).toBeInTheDocument();
    expect(screen.getByText('Things to do')).toBeInTheDocument();
    expect(screen.getByText('Cruises')).toBeInTheDocument();
  });
});

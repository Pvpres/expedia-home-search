import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GlobalNav from './GlobalNav';

function renderNav() {
  return render(
    <BrowserRouter>
      <GlobalNav />
    </BrowserRouter>,
  );
}

describe('GlobalNav', () => {
  it('renders the expedia logo link', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders desktop nav buttons', () => {
    renderNav();
    expect(screen.getByText('Shop travel')).toBeInTheDocument();
    expect(screen.getByText('List your property')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Trips')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('toggles mobile menu on button click', () => {
    renderNav();
    const menuButtons = screen.getAllByRole('button');
    const mobileToggle = menuButtons.find(
      btn => btn.className.includes('lg:hidden') && btn.className.includes('text-gray-800'),
    );
    expect(mobileToggle).toBeTruthy();
    fireEvent.click(mobileToggle!);
    const mobileLinks = screen.getAllByText('Shop travel');
    expect(mobileLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('closes mobile menu on second click', () => {
    renderNav();
    const menuButtons = screen.getAllByRole('button');
    const mobileToggle = menuButtons.find(
      btn => btn.className.includes('lg:hidden') && btn.className.includes('text-gray-800'),
    );
    fireEvent.click(mobileToggle!);
    fireEvent.click(mobileToggle!);
    const shopLinks = screen.getAllByText('Shop travel');
    expect(shopLinks).toHaveLength(1);
  });

  it('renders user avatar initial', () => {
    renderNav();
    expect(screen.getByText('P')).toBeInTheDocument();
  });
});

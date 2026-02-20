import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SearchWidget from './SearchWidget';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWidget() {
  return render(
    <MemoryRouter>
      <SearchWidget />
    </MemoryRouter>
  );
}

describe('SearchWidget', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('tab switching', () => {
    it('renders all search tabs', () => {
      renderWidget();
      expect(screen.getByText('Stays')).toBeInTheDocument();
      expect(screen.getByText('Flights')).toBeInTheDocument();
      expect(screen.getByText('Cars')).toBeInTheDocument();
      expect(screen.getByText('Packages')).toBeInTheDocument();
      expect(screen.getByText('Things to do')).toBeInTheDocument();
      expect(screen.getByText('Cruises')).toBeInTheDocument();
    });

    it('shows flights tab content by default', () => {
      renderWidget();
      expect(screen.getByText('Leaving from')).toBeInTheDocument();
      expect(screen.getByText('Going to')).toBeInTheDocument();
    });

    it('switches to hotels tab', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('Stays'));
      expect(screen.getByText('Check-in')).toBeInTheDocument();
      expect(screen.getByText('Check-out')).toBeInTheDocument();
    });

    it('switches to cars tab', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('Cars'));
      expect(screen.getByText('Pick-up')).toBeInTheDocument();
      expect(screen.getByText('Pick-up date')).toBeInTheDocument();
      expect(screen.getByText('Drop-off date')).toBeInTheDocument();
    });
  });

  describe('flight search form', () => {
    it('renders trip type radio buttons', () => {
      renderWidget();
      expect(screen.getByText('Roundtrip')).toBeInTheDocument();
      expect(screen.getByText('One-way')).toBeInTheDocument();
      expect(screen.getByText('Multi-city')).toBeInTheDocument();
    });

    it('renders cabin class dropdown', () => {
      renderWidget();
      expect(screen.getByDisplayValue('Economy')).toBeInTheDocument();
    });

    it('shows return date for roundtrip', () => {
      renderWidget();
      expect(screen.getByText('Returning')).toBeInTheDocument();
    });

    it('hides return date for one-way', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('One-way'));
      expect(screen.queryByText('Returning')).not.toBeInTheDocument();
    });

    it('renders traveler counter button', () => {
      renderWidget();
      expect(screen.getByText('1 Traveler')).toBeInTheDocument();
    });

    it('opens traveler dropdown on click', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('1 Traveler'));
      expect(screen.getByText('Adults')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('increments traveler count', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('1 Traveler'));
      const dropdown = screen.getByText('Adults').closest('div')!.parentElement!;
      const plusButtons = within(dropdown).getAllByRole('button');
      const plusButton = plusButtons.find(b => !b.hasAttribute('disabled') && b.querySelector('svg'));
      if (plusButton) {
        await user.click(plusButton);
      }
      expect(screen.getByText('2 Travelers')).toBeInTheDocument();
    });

    it('renders search button', () => {
      renderWidget();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('renders add-on checkboxes', () => {
      renderWidget();
      expect(screen.getByText('Add a place to stay')).toBeInTheDocument();
      expect(screen.getByText('Add a car')).toBeInTheDocument();
    });

    it('renders swap airports button', () => {
      renderWidget();
      expect(screen.getByTitle('Swap airports')).toBeInTheDocument();
    });
  });

  describe('cabin class selection', () => {
    it('allows changing cabin class', async () => {
      const user = userEvent.setup();
      renderWidget();
      const select = screen.getByDisplayValue('Economy');
      await user.selectOptions(select, 'business');
      expect(screen.getByDisplayValue('Business')).toBeInTheDocument();
    });
  });

  describe('hotel search tab', () => {
    it('renders hotel destination input', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('Stays'));
      expect(screen.getByPlaceholderText('Enter a destination')).toBeInTheDocument();
    });

    it('renders rooms dropdown', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('Stays'));
      expect(screen.getByDisplayValue('1 Room')).toBeInTheDocument();
    });
  });

  describe('car search tab', () => {
    it('renders car pickup input', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('Cars'));
      expect(screen.getByPlaceholderText('City, airport, or address')).toBeInTheDocument();
    });

    it('renders return to different location checkbox', async () => {
      const user = userEvent.setup();
      renderWidget();
      await user.click(screen.getByText('Cars'));
      expect(screen.getByText('Return car to a different location')).toBeInTheDocument();
    });
  });
});

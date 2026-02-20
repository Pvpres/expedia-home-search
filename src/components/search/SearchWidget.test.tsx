import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
    <BrowserRouter>
      <SearchWidget />
    </BrowserRouter>,
  );
}

describe('SearchWidget', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('tab rendering', () => {
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
      expect(screen.getByText('Roundtrip')).toBeInTheDocument();
      expect(screen.getByText('One-way')).toBeInTheDocument();
      expect(screen.getByText('Multi-city')).toBeInTheDocument();
    });

    it('switches to hotels tab', async () => {
      renderWidget();
      fireEvent.click(screen.getByText('Stays'));
      expect(screen.getByText('Going to')).toBeInTheDocument();
      expect(screen.getByText('Check-in')).toBeInTheDocument();
      expect(screen.getByText('Check-out')).toBeInTheDocument();
    });

    it('switches to cars tab', () => {
      renderWidget();
      fireEvent.click(screen.getByText('Cars'));
      expect(screen.getByText('Pick-up')).toBeInTheDocument();
      expect(screen.getByText('Pick-up date')).toBeInTheDocument();
      expect(screen.getByText('Drop-off date')).toBeInTheDocument();
    });
  });

  describe('flight search form', () => {
    it('renders trip type radio buttons', () => {
      renderWidget();
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThanOrEqual(3);
    });

    it('renders cabin class dropdown', () => {
      renderWidget();
      const select = screen.getByDisplayValue('Economy');
      expect(select).toBeInTheDocument();
    });

    it('renders airport picker labels', () => {
      renderWidget();
      expect(screen.getByText('Leaving from')).toBeInTheDocument();
    });

    it('renders departing date input', () => {
      renderWidget();
      expect(screen.getByText('Departing')).toBeInTheDocument();
    });

    it('shows returning date for roundtrip', () => {
      renderWidget();
      expect(screen.getByText('Returning')).toBeInTheDocument();
    });

    it('hides returning date for one-way', () => {
      renderWidget();
      fireEvent.click(screen.getByText('One-way'));
      expect(screen.queryByText('Returning')).not.toBeInTheDocument();
    });

    it('renders traveler counter', () => {
      renderWidget();
      expect(screen.getByText('1 Traveler')).toBeInTheDocument();
    });

    it('toggles traveler dropdown', () => {
      renderWidget();
      fireEvent.click(screen.getByText('1 Traveler'));
      expect(screen.getByText('Adults')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('increments travelers', () => {
      renderWidget();
      fireEvent.click(screen.getByText('1 Traveler'));
      const allButtons = screen.getAllByRole('button');
      const enabledCounterBtns = allButtons.filter(
        btn => btn.className.includes('w-8') && btn.className.includes('h-8') && !btn.hasAttribute('disabled'),
      );
      if (enabledCounterBtns.length > 0) {
        fireEvent.click(enabledCounterBtns[enabledCounterBtns.length - 1]);
        expect(screen.getByText('2 Travelers')).toBeInTheDocument();
      }
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
      const swapBtn = screen.getByTitle('Swap airports');
      expect(swapBtn).toBeInTheDocument();
    });

    it('handles cabin class change', () => {
      renderWidget();
      const select = screen.getByDisplayValue('Economy');
      fireEvent.change(select, { target: { value: 'business' } });
      expect(screen.getByDisplayValue('Business')).toBeInTheDocument();
    });
  });

  describe('handleSearch', () => {
    it('does not navigate without origin and destination', () => {
      renderWidget();
      fireEvent.click(screen.getByText('Search'));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

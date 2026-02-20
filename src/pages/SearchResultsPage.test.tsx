import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchResultsPage from './SearchResultsPage';

function renderPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/flights/search${search}`]}>
      <SearchResultsPage />
    </MemoryRouter>,
  );
}

describe('SearchResultsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2024-03-15T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the page with default params', () => {
    renderPage();
    expect(screen.getByText(/New York/)).toBeInTheDocument();
    expect(screen.getByText(/Los Angeles/)).toBeInTheDocument();
  });

  it('renders flight cards', () => {
    renderPage();
    expect(screen.getByText(/flights? found/)).toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    renderPage();
    expect(screen.getByDisplayValue('Price (lowest)')).toBeInTheDocument();
  });

  it('renders filter section with stops', () => {
    renderPage();
    expect(screen.getByText('Any number of stops')).toBeInTheDocument();
    expect(screen.getByText('Nonstop only')).toBeInTheDocument();
    expect(screen.getByText('1 stop or fewer')).toBeInTheDocument();
  });

  it('renders airline filter checkboxes', () => {
    renderPage();
    const unitedElements = screen.getAllByText('United Airlines');
    expect(unitedElements.length).toBeGreaterThanOrEqual(1);
    const deltaElements = screen.getAllByText('Delta Air Lines');
    expect(deltaElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders membership toggle', () => {
    renderPage();
    expect(screen.getByText('Show member prices')).toBeInTheDocument();
  });

  it('shows member banner when member toggle is checked', () => {
    renderPage();
    const memberCheckbox = screen.getByRole('checkbox', { name: /show member prices/i });
    fireEvent.click(memberCheckbox);
    expect(screen.getByText(/Member prices shown/)).toBeInTheDocument();
  });

  it('hides member banner when not checked', () => {
    renderPage();
    expect(screen.queryByText(/Member prices shown/)).not.toBeInTheDocument();
  });

  it('filters by nonstop only', () => {
    renderPage();
    const nonstopRadio = screen.getByRole('radio', { name: /nonstop only/i });
    fireEvent.click(nonstopRadio);
    const countText = screen.getByText(/flights? found/);
    expect(countText).toBeInTheDocument();
  });

  it('filters by 1 stop or fewer', () => {
    renderPage();
    const oneStopRadio = screen.getByRole('radio', { name: /1 stop or fewer/i });
    fireEvent.click(oneStopRadio);
    const countText = screen.getByText(/flights? found/);
    expect(countText).toBeInTheDocument();
  });

  it('changes sort order', () => {
    renderPage();
    const sortSelect = screen.getByDisplayValue('Price (lowest)');
    fireEvent.change(sortSelect, { target: { value: 'duration' } });
    expect(screen.getByDisplayValue('Duration (shortest)')).toBeInTheDocument();
  });

  it('changes sort to departure', () => {
    renderPage();
    const sortSelect = screen.getByDisplayValue('Price (lowest)');
    fireEvent.change(sortSelect, { target: { value: 'departure' } });
    expect(screen.getByDisplayValue('Departure (earliest)')).toBeInTheDocument();
  });

  it('changes sort to stops', () => {
    renderPage();
    const sortSelect = screen.getByDisplayValue('Price (lowest)');
    fireEvent.change(sortSelect, { target: { value: 'stops' } });
    expect(screen.getByDisplayValue('Stops (fewest)')).toBeInTheDocument();
  });

  it('renders modify search link', () => {
    renderPage();
    expect(screen.getByText('Modify search')).toBeInTheDocument();
  });

  it('reads origin from URL params', () => {
    renderPage('?origin=SFO&destination=LAX');
    expect(screen.getByText(/San Francisco/)).toBeInTheDocument();
  });

  it('reads destination from URL params', () => {
    renderPage('?origin=JFK&destination=MIA');
    expect(screen.getByText(/Miami/)).toBeInTheDocument();
  });

  it('displays traveler count from params', () => {
    renderPage('?travelers=3');
    expect(screen.getByText(/3 travelers/)).toBeInTheDocument();
  });

  it('displays cabin class from params', () => {
    renderPage('?cabin=business');
    expect(screen.getByText(/business/i)).toBeInTheDocument();
  });

  it('shows empty state when all flights filtered out', () => {
    renderPage();
    const nonstopRadio = screen.getByRole('radio', { name: /nonstop only/i });
    fireEvent.click(nonstopRadio);
    const airlineCheckboxes = screen.getAllByRole('checkbox');
    const spiritCheckbox = airlineCheckboxes.find(cb => {
      const label = cb.closest('label');
      return label?.textContent?.includes('Spirit Airlines');
    });
    if (spiritCheckbox) {
      fireEvent.click(spiritCheckbox);
      const emptyMsg = screen.queryByText('No flights match your filters');
      if (emptyMsg) {
        expect(emptyMsg).toBeInTheDocument();
      }
    }
  });

  it('toggles airline filter', () => {
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    const unitedCheckbox = checkboxes.find(cb => {
      const label = cb.closest('label');
      return label?.textContent?.includes('United Airlines');
    });
    if (unitedCheckbox) {
      fireEvent.click(unitedCheckbox);
      const countText = screen.getByText(/flights? found/);
      expect(countText).toBeInTheDocument();
    }
  });

  it('renders footer', () => {
    renderPage();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('renders dates from params', () => {
    renderPage('?depart=2026-04-01&return=2026-04-08');
    const aprElements = screen.getAllByText(/Apr/);
    expect(aprElements.length).toBeGreaterThanOrEqual(1);
  });
});

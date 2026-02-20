import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AirportPicker from './AirportPicker';

function renderPicker(props: Partial<Parameters<typeof AirportPicker>[0]> = {}) {
  const defaultProps = {
    label: 'Leaving from',
    selected: null,
    onSelect: vi.fn(),
    placeholder: 'City or airport',
    ...props,
  };
  return { ...render(<AirportPicker {...defaultProps} />), onSelect: defaultProps.onSelect };
}

describe('AirportPicker', () => {
  it('renders label', () => {
    renderPicker({ label: 'Going to' });
    expect(screen.getByText('Going to')).toBeInTheDocument();
  });

  it('shows placeholder when no airport selected', () => {
    renderPicker({ placeholder: 'City or airport' });
    expect(screen.getByText('City or airport')).toBeInTheDocument();
  });

  it('shows selected airport display', () => {
    const jfk = { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'United States' };
    renderPicker({ selected: jfk });
    expect(screen.getByText('New York (JFK)')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByText('City or airport'));
    expect(screen.getByPlaceholderText('City or airport')).toBeInTheDocument();
  });

  it('filters airports by search query', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    await user.type(input, 'New York');
    expect(screen.getByText('JFK')).toBeInTheDocument();
  });

  it('shows no airports found for no match', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    await user.type(input, 'xyznoairport');
    expect(screen.getByText('No airports found')).toBeInTheDocument();
  });

  it('calls onSelect when airport is clicked', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPicker();
    await user.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    await user.type(input, 'JFK');
    const jfkButton = screen.getByText('New York').closest('button')!;
    await user.click(jfkButton);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'JFK', city: 'New York' })
    );
  });

  it('filters by country', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    await user.type(input, 'Japan');
    expect(screen.getByText('NRT')).toBeInTheDocument();
  });

  it('filters by airport name', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    await user.type(input, 'Heathrow');
    expect(screen.getByText('LHR')).toBeInTheDocument();
  });
});

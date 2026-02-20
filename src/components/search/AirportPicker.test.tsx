import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AirportPicker from './AirportPicker';

describe('AirportPicker', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders the label', () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    expect(screen.getByText('Leaving from')).toBeInTheDocument();
  });

  it('shows placeholder when no airport selected', () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    expect(screen.getByText('City or airport')).toBeInTheDocument();
  });

  it('shows selected airport', () => {
    const airport = { code: 'JFK', city: 'New York', name: 'JFK Airport', country: 'United States' };
    render(
      <AirportPicker label="Leaving from" selected={airport} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    expect(screen.getByText('New York (JFK)')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    const trigger = screen.getByText('City or airport');
    fireEvent.click(trigger);
    expect(screen.getByPlaceholderText('City or airport')).toBeInTheDocument();
  });

  it('filters airports by city name', async () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    fireEvent.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    fireEvent.change(input, { target: { value: 'New York' } });
    await waitFor(() => {
      expect(screen.getByText('JFK')).toBeInTheDocument();
    });
  });

  it('filters airports by code', async () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    fireEvent.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    fireEvent.change(input, { target: { value: 'LAX' } });
    await waitFor(() => {
      expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    });
  });

  it('shows no results for invalid query', async () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    fireEvent.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    fireEvent.change(input, { target: { value: 'ZZZZZZZ' } });
    await waitFor(() => {
      expect(screen.getByText('No airports found')).toBeInTheDocument();
    });
  });

  it('calls onSelect when an airport is clicked', async () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    fireEvent.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    fireEvent.change(input, { target: { value: 'JFK' } });
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('New York'));
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'JFK', city: 'New York' }),
    );
  });

  it('filters by country name', async () => {
    render(
      <AirportPicker label="Leaving from" selected={null} onSelect={mockOnSelect} placeholder="City or airport" />,
    );
    fireEvent.click(screen.getByText('City or airport'));
    const input = screen.getByPlaceholderText('City or airport');
    fireEvent.change(input, { target: { value: 'Japan' } });
    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });
});

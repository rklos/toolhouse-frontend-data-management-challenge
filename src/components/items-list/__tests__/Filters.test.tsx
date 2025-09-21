import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Filters } from '../Filters';

describe('Filters Component - Filtering Logic', () => {
  const mockOnSearch = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input and status select', () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should have correct status options', () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    const options = Array.from(statusSelect.querySelectorAll('option')).map(option => option.textContent);
    
    expect(options).toEqual(['All', 'Active', 'Archived', 'Draft']);
  });

  it('should call onSearch with debounced input after typing', async () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search');
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward timers by 500ms (debounce delay)
    vi.advanceTimersByTime(1000);

    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('should debounce multiple rapid input changes', async () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search');
    
    // Type multiple characters rapidly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Fast-forward timers
    vi.advanceTimersByTime(500);
    
    // Should only call once with the final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('should call onSearch with empty string when input is cleared', async () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search');
    
    // First type something
    fireEvent.change(searchInput, { target: { value: 'test' } });
    vi.advanceTimersByTime(500);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test');
    
    // Clear the input
    fireEvent.change(searchInput, { target: { value: '' } });
    vi.advanceTimersByTime(500);
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should call onStatusChange immediately when status is selected', () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    expect(mockOnStatusChange).toHaveBeenCalledWith('active');
  });

  it('should call onStatusChange with empty string when "All" is selected', () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    
    fireEvent.change(statusSelect, { target: { value: '' } });
    
    expect(mockOnStatusChange).toHaveBeenCalledWith('');
  });

  it('should handle all status options correctly', () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    
    // Test each status option
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    expect(mockOnStatusChange).toHaveBeenCalledWith('active');
    
    fireEvent.change(statusSelect, { target: { value: 'archived' } });
    expect(mockOnStatusChange).toHaveBeenCalledWith('archived');
    
    fireEvent.change(statusSelect, { target: { value: 'draft' } });
    expect(mockOnStatusChange).toHaveBeenCalledWith('draft');
  });

  it('should not interfere with each other when both search and status change', async () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search');
    const statusSelect = screen.getByRole('combobox');
    
    // Change search
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Change status
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    // Status should be called immediately
    expect(mockOnStatusChange).toHaveBeenCalledWith('active');
    
    // Search should be debounced
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(500);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('should handle special characters in search input', async () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search');
    
    fireEvent.change(searchInput, { target: { value: 'test@#$%^&*()' } });
    vi.advanceTimersByTime(500);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test@#$%^&*()');
  });

  it('should handle very long search input', async () => {
    render(
      <Filters
        onSearch={mockOnSearch}
        onStatusChange={mockOnStatusChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search');
    const longString = 'a'.repeat(1000);
    
    fireEvent.change(searchInput, { target: { value: longString } });
    vi.advanceTimersByTime(500);
    
    expect(mockOnSearch).toHaveBeenCalledWith(longString);
  });
});

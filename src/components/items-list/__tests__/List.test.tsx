import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { List } from '../List';
import type { Item } from '../../../api/items';

// Mock data for testing
const mockItems: Item[] = [
  {
    id: '1',
    name: 'Apple',
    description: 'A red fruit',
    status: 'active',
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Banana',
    description: 'A yellow fruit',
    status: 'active',
    createdAt: '2023-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Cherry',
    description: 'A small red fruit',
    status: 'draft',
    createdAt: '2023-01-03T00:00:00.000Z',
  },
];

describe('List Component - Sorting Logic', () => {
  const mockOnSave = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render items in the correct order initially', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const nameCells = screen.getAllByRole('textbox');
    expect(nameCells[0]).toHaveValue('Apple');
    expect(nameCells[2]).toHaveValue('Banana');
    expect(nameCells[4]).toHaveValue('Cherry');
  });

  it('should call onSort with name:desc when clicking name header for the first time', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const nameHeader = screen.getByText('Name', { exact: false });
    fireEvent.click(nameHeader);

    expect(mockOnSort).toHaveBeenCalledWith('name:desc');
  });

  it('should toggle from desc to asc when clicking name header twice', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const nameHeader = screen.getByText('Name', { exact: false });
    
    // First click - should be asc
    fireEvent.click(nameHeader);
    expect(mockOnSort).toHaveBeenCalledWith('name:desc');
    
    // Second click - should be desc
    fireEvent.click(nameHeader);
    expect(mockOnSort).toHaveBeenCalledWith('name:asc');
  });

  it('should toggle from asc to desc when clicking name header three times', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const nameHeader = screen.getByText('Name', { exact: false });
    
    // First click - asc
    fireEvent.click(nameHeader);
    expect(mockOnSort).toHaveBeenCalledWith('name:desc');
    
    // Second click - desc
    fireEvent.click(nameHeader);
    expect(mockOnSort).toHaveBeenCalledWith('name:asc');
    
    // Third click - asc again
    fireEvent.click(nameHeader);
    expect(mockOnSort).toHaveBeenCalledWith('name:desc');
  });

  it('should call onSort with createdAt:asc when clicking createdAt header', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const createdAtHeader = screen.getByText('Created At');
    fireEvent.click(createdAtHeader);

    expect(mockOnSort).toHaveBeenCalledWith('createdAt:asc');
  });

  it('should show sort indicators correctly', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const nameHeader = screen.getByText('Name', { exact: false });

    expect(nameHeader.textContent).toBe('Name ▲');
    
    // After click - should show desc indicator
    fireEvent.click(nameHeader);
    expect(nameHeader.textContent).toBe('Name ▼');
  });

  it('should switch sort field when clicking different header', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const nameHeader = screen.getByText('Name', { exact: false });
    const createdAtHeader = screen.getByText('Created At');
    
    // Click name header first
    fireEvent.click(nameHeader);
    expect(mockOnSort).toHaveBeenCalledWith('name:desc');
    
    // Click createdAt header - should switch to createdAt:asc
    fireEvent.click(createdAtHeader);
    expect(mockOnSort).toHaveBeenCalledWith('createdAt:asc');
  });

  it('should not show sort indicators for non-sortable columns', () => {
    render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const descriptionHeader = screen.getByText('Description');
    const statusHeader = screen.getByText('Status');
    
    expect(descriptionHeader.textContent).toBe('Description');
    expect(statusHeader.textContent).toBe('Status');
  });

  it('should maintain sort state when items change', () => {
    const { rerender } = render(
      <List
        items={mockItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    const nameHeader = screen.getByText('Name', { exact: false });
    fireEvent.click(nameHeader);
    expect(nameHeader.textContent).toBe('Name ▼');

    // Rerender with different items
    const newItems = [...mockItems, {
      id: '4',
      name: 'Date',
      description: 'A sweet fruit',
      status: 'active' as 'active' | 'archived' | 'draft',
      createdAt: '2023-01-04T00:00:00.000Z',
    }];

    rerender(
      <List
        items={newItems}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onSort={mockOnSort}
      />
    );

    // Sort indicator should still be there
    expect(nameHeader.textContent).toBe('Name ▼');
  });
});

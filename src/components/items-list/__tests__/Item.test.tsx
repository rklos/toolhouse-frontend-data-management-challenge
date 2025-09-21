import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Item } from '../Item';
import type { Item as ItemModel } from '../../../api/items';

// Mock the click outside hook
vi.mock('../../../hooks/use-click-outside', () => ({
  useClickOutside: () => ({
    ref: { current: null },
    focused: false,
    blur: vi.fn(),
  }),
}));

// Mock data for testing
const mockItem: ItemModel = {
  id: '1',
  name: 'Test Item',
  description: 'Test description',
  status: 'active',
  createdAt: '2023-01-01T00:00:00.000Z',
};

describe('Item Component - Optimistic Updates', () => {
  const mockOnSave = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render item with initial values', () => {
    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01T00:00:00.000Z')).toBeInTheDocument();
  });

  it('should update local state when input values change', () => {
    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Item');
    const descriptionInput = screen.getByDisplayValue('Test description');

    fireEvent.change(nameInput, { target: { value: 'Updated Item' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    expect(nameInput).toHaveValue('Updated Item');
    expect(descriptionInput).toHaveValue('Updated description');
  });

  it('should not call onSave when no changes are made', async () => {
    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // Trigger save without making changes (by pressing Enter)
    const nameInput = screen.getByDisplayValue('Test Item');
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('should call onSave with correct payload when changes are made and Enter is pressed', async () => {
    mockOnSave.mockResolvedValue(true);

    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(nameInput, { target: { value: 'Updated Item' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        name: 'Updated Item',
      });
    });
  });

  it('should call onSave with partial changes when only one field is modified', async () => {
    mockOnSave.mockResolvedValue(true);

    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const descriptionInput = screen.getByDisplayValue('Test description');
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    fireEvent.keyUp(descriptionInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        description: 'Updated description',
      });
    });
  });

  it('should revert changes when onSave returns false (failure)', async () => {
    mockOnSave.mockResolvedValue(false);

    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Item');
    const descriptionInput = screen.getByDisplayValue('Test description');

    // Make changes
    fireEvent.change(nameInput, { target: { value: 'Failed Update' } });
    fireEvent.change(descriptionInput, { target: { value: 'Failed Description' } });

    expect(nameInput).toHaveValue('Failed Update');
    expect(descriptionInput).toHaveValue('Failed Description');

    // Trigger save
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      // Values should be reverted to original
      expect(nameInput).toHaveValue('Test Item');
      expect(descriptionInput).toHaveValue('Test description');
    });
  });

  it('should keep changes when onSave returns true (success)', async () => {
    mockOnSave.mockResolvedValue(true);

    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Item');
    const descriptionInput = screen.getByDisplayValue('Test description');

    // Make changes
    fireEvent.change(nameInput, { target: { value: 'Successful Update' } });
    fireEvent.change(descriptionInput, { target: { value: 'Successful Description' } });

    // Trigger save
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      // Values should be kept
      expect(nameInput).toHaveValue('Successful Update');
      expect(descriptionInput).toHaveValue('Successful Description');
    });
  });

  it('should handle multiple field changes in a single save', async () => {
    mockOnSave.mockResolvedValue(true);

    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Item');
    const descriptionInput = screen.getByDisplayValue('Test description');

    // Make changes to both fields
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

    // Trigger save
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        name: 'Updated Name',
        description: 'Updated Description',
      });
    });
  });

  it('should handle save failure and then subsequent successful save', async () => {
    // First call fails, second succeeds
    mockOnSave
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Item');

    // First attempt - failure
    fireEvent.change(nameInput, { target: { value: 'First Attempt' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(nameInput).toHaveValue('Test Item'); // Reverted
    });

    // Second attempt - success
    fireEvent.change(nameInput, { target: { value: 'Second Attempt' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(nameInput).toHaveValue('Second Attempt'); // Kept
    });

    expect(mockOnSave).toHaveBeenCalledTimes(2);
  });

  it('should call onDelete with correct id when delete button is clicked', () => {
    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('X');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should show new item styling when isNew prop is true', () => {
    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        isNew={true}
      />
    );

    const itemContainer = screen.getByDisplayValue('Test Item').closest('div');
    expect(itemContainer).toHaveClass('animate-pulse', 'bg-green-100', 'border-green-300', 'text-gray-900');
  });

  it('should not show new item styling when isNew prop is false', () => {
    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        isNew={false}
      />
    );

    const itemContainer = screen.getByDisplayValue('Test Item').closest('div');
    expect(itemContainer).not.toHaveClass('animate-pulse', 'bg-green-100', 'border-green-300');
  });

  it('should handle empty string values correctly', async () => {
    mockOnSave.mockResolvedValue(true);

    render(
      <Item
        {...mockItem}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Item');
    
    // Clear the name field
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        name: '',
      });
    });
  });
});

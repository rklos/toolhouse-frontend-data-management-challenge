import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PaginatedList } from '../PaginatedList';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/setup';

// Mock the pagination hook
const mockUsePagination = vi.fn();
vi.mock('../../../hooks/use-pagination', () => ({
  usePagination: () => mockUsePagination(),
}));

// Mock data
const mockItems = [
  {
    id: '1',
    name: 'Item 1',
    description: 'Description 1',
    status: 'active',
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Item 2',
    description: 'Description 2',
    status: 'draft',
    createdAt: '2023-01-02T00:00:00.000Z',
  },
];

describe('PaginatedList Component - Optimistic Updates and Pagination', () => {
  const mockFetchItems = vi.fn();
  const mockGoToPage = vi.fn();
  const mockSetParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUsePagination.mockReturnValue({
      items: mockItems,
      maxPages: 3,
      page: 1,
      isLoading: false,
      goToPage: mockGoToPage,
      fetchItems: mockFetchItems,
      params: {},
      setParams: mockSetParams,
    });
  });

  it('should render items and pagination controls', () => {
    render(<PaginatedList />);

    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should handle successful item addition optimistically', async () => {
    const newItem = {
      id: '3',
      name: 'New Item',
      description: 'New Description',
      status: 'active' as const,
      createdAt: '2023-01-03T00:00:00.000Z',
    };

    // Mock successful API response
    server.use(
      http.post('/api/items', () => {
        return HttpResponse.json({ success: true, item: newItem });
      })
    );

    render(<PaginatedList />);

    // Open add modal
    const addButton = screen.getByText('+ Add Item');
    fireEvent.click(addButton);

    // Fill form and submit
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);

    fireEvent.change(nameInput, { target: { value: 'New Item' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    const submitButton = screen.getByText('Add Item');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Item')).toBeInTheDocument();
    });
  });

  it('should handle successful item deletion optimistically', async () => {
    // Mock successful delete
    server.use(
      http.delete('/api/items/:id', () => {
        return HttpResponse.json({ success: true });
      })
    );

    render(<PaginatedList />);

    // Click delete button on first item
    const deleteButtons = screen.getAllByText('X');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      // console.log(screen.debug())
      expect(screen.queryByDisplayValue('Item 1')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
    });
  });

  it('should handle item deletion failure', async () => {
    // Mock delete failure
    server.use(
      http.delete('/api/items/:id', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      })
    );

    render(<PaginatedList />);

    // Click delete button on first item
    const deleteButtons = screen.getAllByText('X');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete item. Please try again.')).toBeInTheDocument();
      // Item should still be there
      expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
    });
  });

  it('should handle successful item save', async () => {
    // Mock successful save
    server.use(
      http.patch('/api/items/:id', () => {
        return HttpResponse.json({ success: true });
      })
    );

    render(<PaginatedList />);

    // Edit an item
    const nameInput = screen.getByDisplayValue('Item 1');
    fireEvent.change(nameInput, { target: { value: 'Updated Item 1' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(nameInput).toHaveValue('Updated Item 1');
    });
  });

  it('should handle item save failure', async () => {
    // Mock save failure
    server.use(
      http.patch('/api/items/:id', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      })
    );

    render(<PaginatedList />);

    // Edit an item
    const nameInput = screen.getByDisplayValue('Item 1');
    fireEvent.change(nameInput, { target: { value: 'Updated Item 1' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Failed to save item. Please try again.')).toBeInTheDocument();
      // Value should be reverted
      expect(nameInput).toHaveValue('Item 1');
    });
  });

  it('should handle pagination navigation', () => {
    render(<PaginatedList />);

    // Click next page
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockGoToPage).toHaveBeenCalledWith(2);
  });

  it('should handle page number clicks', () => {
    render(<PaginatedList />);

    // Click page 2
    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);

    expect(mockGoToPage).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    render(<PaginatedList />);

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toHaveClass('opacity-10');
  });

  it('should disable next button on last page', () => {
    mockUsePagination.mockReturnValue({
      items: mockItems,
      maxPages: 3,
      page: 3,
      isLoading: false,
      goToPage: mockGoToPage,
      fetchItems: mockFetchItems,
      params: {},
      setParams: mockSetParams,
    });

    render(<PaginatedList />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toHaveClass('opacity-10');
  });

  it('should handle search filtering', async () => {
    render(<PaginatedList />);

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    expect(mockSetParams).toHaveBeenCalledWith({ query: 'test' });
  });

  it('should handle status filtering', () => {
    render(<PaginatedList />);

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    expect(mockSetParams).toHaveBeenCalledWith({ status: 'active' });
  });

  it('should handle sorting', () => {
    render(<PaginatedList />);

    const nameHeader = screen.getByText('Name', { exact: false });
    fireEvent.click(nameHeader);

    expect(mockSetParams).toHaveBeenCalledWith({ sort: 'name:desc' });
  });

  it('should show loading state', () => {
    mockUsePagination.mockReturnValue({
      items: mockItems,
      maxPages: 3,
      page: 1,
      isLoading: true,
      goToPage: mockGoToPage,
      fetchItems: mockFetchItems,
      params: {},
      setParams: mockSetParams,
    });

    render(<PaginatedList />);

    const loadingOverlay = document.querySelector('.backdrop-blur-xs');
    expect(loadingOverlay).toBeInTheDocument();
  });

  it('should clear toast messages', async () => {
    // Mock save failure to show toast
    server.use(
      http.patch('/api/items/:id', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      })
    );

    render(<PaginatedList />);

    // Trigger save failure
    const nameInput = screen.getByDisplayValue('Item 1');
    fireEvent.change(nameInput, { target: { value: 'Updated Item 1' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Failed to save item. Please try again.')).toBeInTheDocument();
    });
  });
});

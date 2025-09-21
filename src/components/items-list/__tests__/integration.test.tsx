import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/setup';
import { PaginatedList } from '../PaginatedList';

// Mock data for integration tests
const mockItemsResponse = {
  items: [
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
      status: 'draft',
      createdAt: '2023-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'Cherry',
      description: 'A small red fruit',
      status: 'active',
      createdAt: '2023-01-03T00:00:00.000Z',
    },
  ],
  total: 3,
};

describe('Integration Tests - Full Flow with MSW', () => {
  beforeEach(() => {
    // Reset server handlers to default
    server.resetHandlers();
    
    // Set up default successful handlers
    server.use(
      http.get('/api/items', () => {
        return HttpResponse.json(mockItemsResponse);
      }),
      http.post('/api/items', async ({ request }) => {
        const body = await request.json() as any;
        const newItem = {
          ...body,
          id: '4',
          createdAt: new Date().toISOString(),
        };
        return HttpResponse.json({ success: true, item: newItem });
      }),
      http.patch('/api/items/:id', () => {
        return HttpResponse.json({ success: true });
      }),
      http.delete('/api/items/:id', () => {
        return HttpResponse.json({ success: true });
      })
    );
  });

  it('should load items and display them correctly', async () => {
    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Banana')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Cherry')).toBeInTheDocument();
    });
  });

  it('should handle sorting through API', async () => {
    let capturedSort: string | null = null;
    
    server.use(
      http.get('/api/items', ({ request }) => {
        const url = new URL(request.url);
        capturedSort = url.searchParams.get('sort');
        return HttpResponse.json(mockItemsResponse);
      })
    );

    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Click name header to sort
    const nameHeader = screen.getByText('Name', { exact: false });
    fireEvent.click(nameHeader);

    await waitFor(() => {
      expect(capturedSort).toBe('name:desc');
    });
  });

  it('should handle filtering through API', async () => {
    let capturedQuery: string | null = null;
    let capturedStatus: string | null = null;
    
    server.use(
      http.get('/api/items', ({ request }) => {
        const url = new URL(request.url);
        capturedQuery = url.searchParams.get('query');
        capturedStatus = url.searchParams.get('status');
        return HttpResponse.json(mockItemsResponse);
      })
    );

    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Test search filtering
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'apple' } });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for debounce
    });

    await waitFor(() => {
      expect(capturedQuery).toBe('apple');
    });

    // Test status filtering
    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(capturedStatus).toBe('active');
    });
  });

  it('should handle optimistic item addition', async () => {
    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Open add modal
    const addButton = screen.getByText('+ Add Item');
    fireEvent.click(addButton);

    // Fill form
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);

    fireEvent.change(nameInput, { target: { value: 'Orange' } });
    fireEvent.change(descriptionInput, { target: { value: 'A citrus fruit' } });
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    // Submit
    const submitButton = screen.getByText('Add Item');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Orange')).toBeInTheDocument();
    });
  });

  it('should handle optimistic item deletion', async () => {
    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByText('X');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('should handle optimistic item updates', async () => {
    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Edit item
    const nameInput = screen.getByDisplayValue('Apple');
    fireEvent.change(nameInput, { target: { value: 'Green Apple' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(nameInput).toHaveValue('Green Apple');
    });
  });

  it('should handle API failures gracefully', async () => {
    // Mock API failure
    server.use(
      http.patch('/api/items/:id', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      })
    );

    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Try to edit item
    const nameInput = screen.getByDisplayValue('Apple');
    fireEvent.change(nameInput, { target: { value: 'Green Apple' } });
    fireEvent.keyUp(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Failed to save item. Please try again.')).toBeInTheDocument();
      // Value should be reverted
      expect(nameInput).toHaveValue('Apple');
    });
  });

  it('should handle delete API failures gracefully', async () => {
    // Mock delete failure
    server.use(
      http.delete('/api/items/:id', () => {
        return HttpResponse.json({ error: 'Server Error' }, { status: 500 });
      })
    );

    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Try to delete item
    const deleteButtons = screen.getAllByText('X');
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete item. Please try again.')).toBeInTheDocument();
      // Item should still be there
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });
  });

  it('should handle complex filtering and sorting combinations', async () => {
    let capturedParams: Record<string, string> = {};
    
    server.use(
      http.get('/api/items', ({ request }) => {
        const url = new URL(request.url);
        capturedParams = {
          query: url.searchParams.get('query') || '',
          status: url.searchParams.get('status') || '',
          sort: url.searchParams.get('sort') || '',
          page: url.searchParams.get('page') || '',
        };
        return HttpResponse.json(mockItemsResponse);
      })
    );

    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'fruit' } });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Apply status filter
    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    // Apply sorting
    const nameHeader = screen.getByText('Name', { exact: false });
    fireEvent.click(nameHeader);

    await waitFor(() => {
      expect(capturedParams.query).toBe('fruit');
      expect(capturedParams.status).toBe('active');
      expect(capturedParams.sort).toBe('name:desc');
    });
  });

  it('should handle empty search results', async () => {
    server.use(
      http.get('/api/items', () => {
        return HttpResponse.json({ items: [], total: 0 });
      })
    );

    render(<PaginatedList />);

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
    });
  });
});

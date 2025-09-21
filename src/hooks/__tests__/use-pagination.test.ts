import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../use-pagination';

// Mock data
const mockApiResponse = {
  items: [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ],
  total: 45, // 45 items total, should result in 3 pages (20 items per page)
};

describe('usePagination Hook - Pagination Calculations', () => {
  const mockApiGetter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGetter.mockResolvedValue(mockApiResponse);
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    expect(result.current.items).toEqual([]);
    expect(result.current.page).toBe(1);
    expect(result.current.maxPages).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.params).toEqual({});
  });

  it('should calculate maxPages correctly based on total items', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    // 45 items / 20 per page = 3 pages (Math.ceil(45/20) = 3)
    expect(result.current.maxPages).toBe(3);
    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
  });

  it('should handle single page correctly', async () => {
    const singlePageResponse = {
      items: [{ id: '1', name: 'Item 1' }],
      total: 1,
    };
    mockApiGetter.mockResolvedValue(singlePageResponse);

    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    expect(result.current.maxPages).toBe(1);
  });

  it('should handle empty results correctly', async () => {
    const emptyResponse = {
      items: [],
      total: 0,
    };
    mockApiGetter.mockResolvedValue(emptyResponse);

    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    expect(result.current.maxPages).toBe(1); // Should be at least 1 page
    expect(result.current.items).toEqual([]);
  });

  it('should handle exact page boundary correctly', async () => {
    const exactBoundaryResponse = {
      items: [{ id: '1', name: 'Item 1' }],
      total: 20, // Exactly 20 items = 1 page
    };
    mockApiGetter.mockResolvedValue(exactBoundaryResponse);

    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    expect(result.current.maxPages).toBe(1);
  });

  it('should handle one item over boundary correctly', async () => {
    const oneOverResponse = {
      items: [{ id: '1', name: 'Item 1' }],
      total: 21, // 21 items = 2 pages
    };
    mockApiGetter.mockResolvedValue(oneOverResponse);

    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    expect(result.current.maxPages).toBe(2);
  });

  it('should navigate to next page correctly', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    await act(async () => {
      result.current.goToPage(2);
    });

    expect(result.current.page).toBe(2);
    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 2,
      pageSize: 20,
    });
  });

  it('should navigate to previous page correctly', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    await act(async () => {
      result.current.goToPage(2);
    });

    await act(async () => {
      result.current.goToPage(1);
    });

    expect(result.current.page).toBe(1);
    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
  });

  it('should not go below page 1', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    await act(async () => {
      result.current.goToPage(0);
    });

    expect(result.current.page).toBe(1);
    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
  });

  it('should not go above max pages', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    await act(async () => {
      result.current.goToPage(5); // Try to go to page 5 when max is 3
    });

    expect(result.current.page).toBe(3); // Should be clamped to max pages
    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 3,
      pageSize: 20,
    });
  });

  it('should handle negative page numbers', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    await act(async () => {
      result.current.goToPage(-5);
    });

    expect(result.current.page).toBe(1);
    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
  });

  it('should update params and reset to page 1', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    await act(async () => {
      result.current.goToPage(2);
    });

    expect(result.current.page).toBe(2);

    await act(async () => {
      result.current.setParams({ query: 'test', status: 'active' });
    });

    expect(result.current.page).toBe(1);
    expect(result.current.params).toEqual({ query: 'test', status: 'active' });
    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: 'test',
      status: 'active',
    });
  });

  it('should handle initial params correctly', () => {
    const initialParams = { query: 'initial', status: 'draft' };
    const { result } = renderHook(() => usePagination(mockApiGetter, initialParams));

    expect(result.current.params).toEqual(initialParams);
  });

  it('should merge params correctly when updating', async () => {
    const initialParams = { query: 'initial' };
    const { result } = renderHook(() => usePagination(mockApiGetter, initialParams));

    await act(async () => {
      result.current.setParams({ status: 'active' });
    });

    expect(result.current.params).toEqual({
      query: 'initial',
      status: 'active',
    });
  });

  it('should handle fetchItems with custom page and params', async () => {
    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems({
        page: 2,
        params: { query: 'custom' },
      });
    });

    expect(mockApiGetter).toHaveBeenCalledWith({
      page: 2,
      pageSize: 20,
      query: 'custom',
    });
  });

  it('should set loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockApiGetter.mockReturnValue(promise);

    const { result } = renderHook(() => usePagination(mockApiGetter));

    act(() => {
      result.current.fetchItems();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!(mockApiResponse);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should calculate maxPages correctly for large datasets', async () => {
    const largeResponse = {
      items: [{ id: '1', name: 'Item 1' }],
      total: 1000, // 1000 items = 50 pages
    };
    mockApiGetter.mockResolvedValue(largeResponse);

    const { result } = renderHook(() => usePagination(mockApiGetter));

    await act(async () => {
      result.current.fetchItems();
    });

    expect(result.current.maxPages).toBe(50);
  });
});

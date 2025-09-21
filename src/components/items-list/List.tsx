import { useState, useCallback, useMemo } from 'react';
import { Item } from './Item';
import type { Item as ItemModel, ItemUpdatePayload } from '../../api/items';

type SortBy = `${keyof ItemModel}:${'asc' | 'desc'}`;

interface Props {
  items: ItemModel[];
  onSave: (item: ItemUpdatePayload) => Promise<boolean>;
  onDelete: (id: string) => void;
  onSort: (sort: SortBy) => void;
}

export function List({ items, onDelete, onSave, onSort }: Props) {
  const [sortBy, setSortBy] = useState<SortBy>('name:asc');

  const handleSave = useCallback((item: ItemUpdatePayload) => onSave(item), [onSave]);
  const handleDelete = useCallback((id: string) => onDelete(id), [onDelete]);

  const handleSortBy = (field: keyof ItemModel) => {
    let newSortBy = sortBy;

    if (sortBy.includes(field)) {
      newSortBy = sortBy.includes('asc') ? `${field}:desc` : `${field}:asc`
      setSortBy(newSortBy);
    } else {
      newSortBy = `${field}:asc`;
      setSortBy(newSortBy);
    }
    
    onSort(newSortBy);
  };

  const getSortByIndicator = (field: keyof ItemModel) => {
    if (sortBy.includes(field)) {
      return sortBy.includes('asc') ? '▲' : '▼';
    }

    return '';
  };

  const itemsList = useMemo(() => {
    return items.map((itemData) => (
      <Item 
        key={itemData.id}
        onSave={handleSave}
        onDelete={handleDelete}
        {...itemData}
      />
    ));
  }, [items, handleSave, handleDelete]);

  return (
    <div className="grid max-w-7xl">
      <section className="grid grid-cols-subgrid [&_div]:px-2 col-span-5">
        <div className="cursor-pointer" onClick={() => handleSortBy('name')}>Name {getSortByIndicator('name')}</div>
        <div>Description</div>
        <div className="cursor-pointer" onClick={() => handleSortBy('createdAt')}>Created At {getSortByIndicator('createdAt')}</div>
        <div>Status</div>
        <div></div>
      </section>
      {itemsList}
    </div>
  );
}

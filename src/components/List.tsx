import { useState, useCallback, useMemo } from 'react';
import { Item } from './Item';
import type { ItemModel } from './Item.tsx';

interface Props {
  items: ItemModel[];
  onSave: (item: Partial<ItemModel> & { id: string }) => void;
  onDelete: (id: string) => void;
  onSort: (field: keyof ItemModel) => void;
}

export function List({ items, onDelete, onSave, onSort }: Props) {
  const [sortBy, setSortBy] = useState<`${keyof ItemModel}${'Asc' | 'Desc'}`>('nameAsc');

  const handleSave = useCallback((item: Partial<ItemModel> & { id: string }) => onSave(item), [onSave]);
  const handleDelete = useCallback((id: string) => onDelete(id), [onDelete]);

  const handleSortBy = (field: keyof ItemModel) => {
    if (sortBy.includes(field)) {
      setSortBy(sortBy.includes('Asc') ? `${field}Desc` : `${field}Asc`);
    } else {
      setSortBy(`${field}Asc`);
    }
    
    onSort(field);
  };

  const getSortByIndicator = (field: keyof ItemModel) => {
    if (sortBy.includes(field)) {
      return sortBy.includes('Asc') ? '▲' : '▼';
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

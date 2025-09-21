import { useCallback } from 'react';
import { Item } from './Item';
import type { ItemModel } from './Item.tsx';

interface Props {
  items: ItemModel[];
  onSave: (item: Partial<ItemModel> & { id: string }) => void;
  onDelete: (id: string) => void;
}

export function List({ items, onDelete, onSave }: Props) {
  const handleSave = useCallback((item: Partial<ItemModel> & { id: string }) => onSave(item), [onSave]);
  const handleDeleteFactory = useCallback((id: string) => () => onDelete(id), [onDelete]);

  return (
    <div className="grid max-w-7xl">
      <section className="grid grid-cols-subgrid [&_div]:px-2 col-span-5">
        <div>Name</div>
        <div>Description</div>
        <div>Created At</div>
        <div>Status</div>
        <div></div>
      </section>
      {items.map((itemData) => (
        <Item 
          key={itemData.id}
          onSave={handleSave}
          onDelete={handleDeleteFactory(itemData.id)}
          {...itemData}
        />
      ))}
    </div>
  );
}

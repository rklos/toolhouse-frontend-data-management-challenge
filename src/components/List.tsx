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
    <div className="grid md:gap-4 gap-1 max-w-7xl">
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

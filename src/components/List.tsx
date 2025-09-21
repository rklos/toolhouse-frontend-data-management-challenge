import { Item } from './Item';
import type { ItemModel } from './Item.tsx';

interface Props {
  items: ItemModel[];
  onSave: (item: Partial<ItemModel> & { id: string }) => void;
  onDelete: (id: string) => void;
}

export function List({ items, onDelete, onSave }: Props) {
  // TODO: use useCallback
  const handleSave = (item: Partial<ItemModel> & { id: string }) => onSave(item);
  const handleDeleteFactory = (id: string) => () => onDelete(id);

  return (
    <div className="grid max-w-7xl">
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

import { Item } from './Item';
import type { ItemModel } from './Item.tsx';

interface Props {
  items: ItemModel[];
}

export function List({ items }: Props) {
  return (
    <div className="grid max-w-7xl">
      {items.map((itemData) => (
        <Item 
          key={itemData.id}
          onSave={() => {}} onDelete={() => {}}
          {...itemData}
        />
      ))}
    </div>
  );
}

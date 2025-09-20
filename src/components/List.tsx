import { Item } from './Item';
import type { ItemModel } from './Item.tsx';

interface Props {
  items: ItemModel[];
}

export function List({ items }: Props) {
  return items.map((itemData) => (
    <Item {...itemData} onSave={() => {}} onDelete={() => {}} />
  ));
}

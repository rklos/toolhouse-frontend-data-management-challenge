import { useState } from 'react';
import { Button } from './Button';
import { useClickOutside } from '../hooks/use-click-outside';

// TODO: move the interface to /api/items.ts
export interface ItemModel {
  id: string; // uuid
  name: string;
  description: string;
  createdAt: string; // ISO date string
  status: 'active' | 'archived' | 'draft';
}

interface Props extends ItemModel {
  onSave: (item: ItemModel) => void;
  onDelete: (id: string) => void;
}

export function Item({ onSave, onDelete, ...item }: Props) {
  const [itemData, setItemData] = useState<ItemModel>(item);
  const [isEditing, setIsEditing] = useState(false);
  const [dataChanged, setDataChanged] = useState<boolean>(false);

  const handleEdit = () => {
    setDataChanged(false)
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);

    if (dataChanged) {
      onSave(itemData);
    }
  };

  const handleDelete = () => {
    onDelete(itemData.id);
  };

  const changeHandlerFactory = (field: keyof ItemModel) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemData({ ...item, [field]: e.target.value ?? '' });
    setDataChanged(true)
  };

  const editRef = useClickOutside<HTMLDivElement>(() => {
    handleSave()
  });

  return (
    <div className="grid md:grid-cols-16 grid-cols-8 md:gap-4 gap-1 items-center [&_div]:px-2 auto-cols-max">
      <div className="md:col-span-10 col-span-4 flex md:gap-4 gap-1 [&_input]:flex-1 [&_input]:shrink [&_input]:min-w-0 [&_input]:focus:bg-gray-800 [&_input]:px-2" ref={editRef}>
        <input
            value={itemData.name}
            onFocus={handleEdit}
            onChange={changeHandlerFactory('name')}
          />
        <input
            value={itemData.description}
            onFocus={handleEdit}
            onChange={changeHandlerFactory('description')}
          />
      </div>
      <div className="md:col-span-4 col-span-2">{itemData.createdAt}</div>
      <div>{itemData.status}</div>
      <div className="justify-self-end">
        <Button onClick={handleDelete} disabled={isEditing}>X</Button>
      </div>
    </div>
  );
}
import { useState, useRef } from 'react';
import { Button } from './Button';
import { useClickOutside } from '../hooks/use-click-outside';
import { getObjectChanges } from '../utils/get-object-changes';
import cn from 'classnames';

// TODO: move the interface to /api/items.ts
export interface ItemModel {
  id: string; // uuid
  name: string;
  description: string;
  createdAt: string; // ISO date string
  status: 'active' | 'archived' | 'draft';
}

interface Props extends ItemModel {
  // TODO: Move this type to /api/items.ts
  onSave: (item: Partial<ItemModel> & { id: string }) => void;
  onDelete: () => void;
}

export function Item({ onSave, onDelete, ...item }: Props) {
  const [itemData, setItemData] = useState<ItemModel>(item);
  const [isEditing, setIsEditing] = useState(false);
  const dataBeforeSave = useRef<ItemModel>(item);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);

    const changes = getObjectChanges(itemData, dataBeforeSave.current);

    if (Object.keys(changes).length > 0) {
      onSave({ id: itemData.id, ...changes });
      dataBeforeSave.current = { ...itemData };
    }
  };

  const handleDelete = () => {
    onDelete();
  };

  const changeHandlerFactory = (field: 'name' | 'description') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemData({ ...itemData, [field]: e.target.value ?? '' });
  };

  const { ref: editRef, focused } = useClickOutside<HTMLDivElement>(() => {
    handleSave()
  });

  return (
    <div className="grid [&_div]:px-2 py-1 grid-cols-subgrid col-span-4 border-t border-gray-800">
      <div className={cn('flex md:gap-4 gap-1 [&_input]:flex-1 [&_input]:shrink [&_input]:min-w-0 [&_input]:px-2', { '[&_input]:bg-gray-800': focused })} ref={editRef}>
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
      <div className="text-nowrap">{itemData.createdAt}</div>
      <div>{itemData.status}</div>
      <div className="justify-self-end">
        <Button onClick={handleDelete} disabled={isEditing}>X</Button>
      </div>
    </div>
  );
}
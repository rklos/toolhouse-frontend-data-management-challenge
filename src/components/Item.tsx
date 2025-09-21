import { useState, useRef, useCallback } from 'react';
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
  onDelete: (id: string) => void;
}

export function Item({ onSave, onDelete, ...item }: Props) {
  const [itemData, setItemData] = useState<ItemModel>(item);
  const dataBeforeSave = useRef<ItemModel>(item);

  const handleSave = () => {
    const changes = getObjectChanges(itemData, dataBeforeSave.current);

    if (Object.keys(changes).length > 0) {
      onSave({ id: itemData.id, ...changes });
      dataBeforeSave.current = { ...itemData };
    }
  };

  const handleDelete = useCallback(() => {
    onDelete(itemData.id);
  }, [onDelete, itemData.id]);

  const changeHandlerFactory = (field: 'name' | 'description') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemData({ ...itemData, [field]: e.target.value ?? '' });
  };

  const { ref: editRef, focused, blur } = useClickOutside<HTMLDivElement>(handleSave);

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
      e.currentTarget.blur();
      blur();
    }
  };

  return (
    <div className={cn("grid [&_*]:px-2 py-1 grid-cols-subgrid col-span-5 border-t border-gray-800 gap-2", { '[&_input]:bg-gray-800': focused })} ref={editRef}>
      <input
          value={itemData.name}
          onChange={changeHandlerFactory('name')}
          onKeyUp={onEnter}
        />
      <input
          value={itemData.description}
          onChange={changeHandlerFactory('description')}
          onKeyUp={onEnter}
        />
      <div className="text-nowrap">{itemData.createdAt}</div>
      <div>{itemData.status}</div>
      <div className="justify-self-end">
        <Button onClick={handleDelete} disabled={focused}>X</Button>
      </div>
    </div>
  );
}
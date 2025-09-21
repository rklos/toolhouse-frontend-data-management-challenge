import { useState, useRef, useCallback } from 'react';
import { Button } from '../common/Button';
import { useClickOutside } from '../../hooks/use-click-outside';
import { getObjectChanges } from '../../utils/get-object-changes';
import cn from 'classnames';
import type { Item as ItemModel, ItemUpdatePayload } from '../../api/items';


interface Props extends ItemModel {
  onSave: (item: ItemUpdatePayload) => Promise<boolean>;
  onDelete: (id: string) => void;
}

export function Item({ onSave, onDelete, ...item }: Props) {
  const [itemData, setItemData] = useState<ItemModel>(item);
  const dataBeforeSave = useRef<ItemModel>(item);

  // Save changes if there are any, otherwise do nothing
  const handleSave = useCallback(async () => {
    const changes = getObjectChanges(itemData, dataBeforeSave.current);

    if (Object.keys(changes).length === 0) return;

    const success = await onSave({ id: itemData.id, ...changes });
    if (success) {
      dataBeforeSave.current = { ...itemData };
    } else {
      // Revert changes on failure
      setItemData(dataBeforeSave.current);
    }
  }, [itemData, onSave]);

  // Delete handler
  const handleDelete = useCallback(() => {
    onDelete(itemData.id);
  }, [onDelete, itemData.id]);

  // Factory for input change handlers
  const handleChange = (field: 'name' | 'description') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setItemData(prev => ({ ...prev, [field]: e.target.value ?? '' }));
  };

  // Handle click outside to trigger save
  const { ref: editRef, focused, blur } = useClickOutside<HTMLDivElement>(handleSave);

  // Save on Enter key and blur input
  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          onChange={handleChange('name')}
          onKeyUp={handleEnterKey}
        />
      <input
          value={itemData.description}
          onChange={handleChange('description')}
          onKeyUp={handleEnterKey}
        />
      <div className="text-nowrap">{itemData.createdAt}</div>
      <div>{itemData.status}</div>
      <div className="justify-self-end">
        <Button onClick={handleDelete} disabled={focused}>X</Button>
      </div>
    </div>
  );
}
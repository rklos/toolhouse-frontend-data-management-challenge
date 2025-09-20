import { useState } from 'react';

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
  const { id, name, description, createdAt, status } = item;

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave({ id, name, description, createdAt, status });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const changeHandlerFactory = (field: keyof ItemModel) => (e: React.FocusEvent<HTMLDivElement>) => {
    onSave({ ...item, [field]: e.target.textContent ?? '' });
  };

  return (
    <div className="flex flex-row gap-2">
      <div contentEditable={isEditing} onInput={changeHandlerFactory('name')}>{name}</div>
      <div contentEditable={isEditing} onInput={changeHandlerFactory('description')}>{description}</div>
      <div>{createdAt}</div>
      <div>{status}</div>
      { !isEditing && (
        <>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      ) }
      { isEditing && (
        <>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      ) }
    </div>
  );
}
import { useEffect, useState, useCallback } from 'react'
import { List } from './components/List'
import api from './api'
import type { ItemModel } from './components/Item'

function App() {
  const [items, setItems] = useState<ItemModel[]>([])

  useEffect(() => {
    api.items.getList()
      .then((res) => {
        setItems(res?.items ?? [])
      });
  }, [])

  const handleDelete = useCallback((id: string) => {
    api.items.deleteItem(id)
      .then(() => {
        setItems(items.filter((item) => item.id !== id))
      });
  }, [items])

  const handleSave = useCallback((item: Partial<ItemModel> & { id: string }) => {
    api.items.saveItem(item);
    return true;
  }, [])

  return (
    <main>
      <List items={items} onDelete={handleDelete} onSave={handleSave} />
    </main>
  )
}

export default App

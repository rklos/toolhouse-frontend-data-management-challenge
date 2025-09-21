import { List } from './components/List'
import { useEffect, useState } from 'react'
import api from './api'
import type { ItemModel } from './components/Item'

function App() {
  const [items, setItems] = useState<ItemModel[]>([])

  useEffect(() => {
    api.items.getList()
      .then((res) => {
        setItems(res?.items ?? [])
      })
  }, [])

  return (
    <main>
      <List items={items} />
    </main>
  )
}

export default App

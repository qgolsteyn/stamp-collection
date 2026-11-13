import { useEffect, useState } from 'react'
import StampForm from './StampForm'
import { createStamp, loadStamps, saveStamps, sortNewestFirst, type Stamp } from './stamps'
import './App.css'

export default function App() {
  const [stamps, setStamps] = useState<Stamp[]>(loadStamps)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => saveStamps(stamps), [stamps])

  function remove(stamp: Stamp) {
    if (!window.confirm(`Delete the ${stamp.country} stamp?`)) return
    setStamps((all) => all.filter((s) => s.id !== stamp.id))
    if (editingId === stamp.id) setEditingId(null)
  }

  return (
    <main>
      <h1>Stamps</h1>
      <h2>Add a stamp</h2>
      <StampForm submitLabel="Add stamp" onSubmit={(input) => setStamps((all) => [...all, createStamp(input)])} />

      <h2>Collection</h2>
      {stamps.length === 0 ? (
        <p>No stamps yet. Add your first one above.</p>
      ) : (
        <ul>
          {sortNewestFirst(stamps).map((stamp) => (
            <li key={stamp.id}>
              {editingId === stamp.id ? (
                <StampForm
                  initial={stamp}
                  submitLabel="Save"
                  onSubmit={(input) => {
                    setStamps((all) => all.map((s) => (s.id === stamp.id ? { ...s, ...input } : s)))
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <span>
                    <strong>{stamp.country}</strong> · {stamp.year ?? '—'} · {stamp.denomination ?? '—'} · {stamp.condition}
                  </span>
                  <button type="button" onClick={() => setEditingId(stamp.id)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(stamp)}>
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

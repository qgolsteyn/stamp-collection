import { useState } from 'react'
import StampForm from './StampForm'
import { createStamp, formatFaceValue, loadStamps, saveStamps, sortNewestFirst, type Stamp } from './stamps'
import './App.css'

export default function App() {
  const [stamps, setStamps] = useState<Stamp[]>(loadStamps)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Save only on user changes, so loading never overwrites what is stored.
  function commit(next: Stamp[]) {
    setStamps(next)
    saveStamps(next)
  }

  function remove(stamp: Stamp) {
    if (!window.confirm(`Delete the ${stamp.country} stamp?`)) return
    commit(stamps.filter((s) => s.id !== stamp.id))
    if (editingId === stamp.id) setEditingId(null)
  }

  return (
    <main>
      <h1>The Stamp Collection</h1>
      <h2>Add a stamp</h2>
      <StampForm submitLabel="Add stamp" onSubmit={(input) => commit([...stamps, createStamp(input)])} />

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
                    commit(stamps.map((s) => (s.id === stamp.id ? { ...s, ...input } : s)))
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <span>
                    <strong>{stamp.country}</strong> · {stamp.year ?? '—'} · {formatFaceValue(stamp)} · {stamp.condition}
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

import { useState, type FormEvent } from 'react'
import { CONDITIONS, type Condition, type StampInput } from './stamps'

type Props = {
  initial?: StampInput
  submitLabel: string
  onSubmit: (input: StampInput) => void
  onCancel?: () => void
}

export default function StampForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [country, setCountry] = useState(initial?.country ?? '')
  const [year, setYear] = useState(initial?.year?.toString() ?? '')
  const [denomination, setDenomination] = useState(initial?.denomination ?? '')
  const [condition, setCondition] = useState<Condition>(initial?.condition ?? 'mint')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedYear = year.trim()
    if (!country.trim()) return setError('Country is required.')
    if (trimmedYear && !/^\d{4}$/.test(trimmedYear)) return setError('Year must be a 4-digit number.')
    setError('')
    onSubmit({
      country: country.trim(),
      year: trimmedYear ? Number(trimmedYear) : undefined,
      denomination: denomination.trim() || undefined,
      condition,
      notes: notes.trim() || undefined,
    })
    if (!initial) {
      setCountry('')
      setYear('')
      setDenomination('')
      setCondition('mint')
      setNotes('')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Country
        <input value={country} onChange={(e) => setCountry(e.target.value)} required />
      </label>
      <label>
        Year
        <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
      </label>
      <label>
        Denomination
        <input value={denomination} onChange={(e) => setDenomination(e.target.value)} placeholder="5c" />
      </label>
      <label>
        Condition
        <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">{submitLabel}</button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  )
}

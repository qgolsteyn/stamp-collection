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
  const [faceValue, setFaceValue] = useState(initial?.faceValue?.toString() ?? '')
  const [currency, setCurrency] = useState(initial?.currency ?? '')
  const [condition, setCondition] = useState<Condition>(initial?.condition ?? 'mint')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedYear = year.trim()
    const trimmedFaceValue = faceValue.trim()
    if (!country.trim()) return setError('Country is required.')
    if (trimmedYear && !/^\d{4}$/.test(trimmedYear)) return setError('Year must be a 4-digit number.')
    // Digits with an optional decimal part; rejects negatives, exponents and hex that Number() would accept.
    if (trimmedFaceValue && !/^(\d+\.?\d*|\.\d+)$/.test(trimmedFaceValue))
      return setError('Face value must be a number of 0 or more.')
    setError('')
    onSubmit({
      country: country.trim(),
      year: trimmedYear ? Number(trimmedYear) : undefined,
      faceValue: trimmedFaceValue ? Number(trimmedFaceValue) : undefined,
      currency: currency.trim() || undefined,
      condition,
      notes: notes.trim() || undefined,
    })
    if (!initial) {
      setCountry('')
      setYear('')
      setFaceValue('')
      setCurrency('')
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
        Face value
        <input value={faceValue} onChange={(e) => setFaceValue(e.target.value)} inputMode="decimal" placeholder="5" />
      </label>
      <label>
        Currency
        <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="c" />
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

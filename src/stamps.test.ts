import { beforeEach, expect, test } from 'vitest'
import { createStamp, formatFaceValue, loadStamps, saveStamps, sortNewestFirst } from './stamps'

beforeEach(() => localStorage.clear())

test('round-trips stamps through localStorage', () => {
  const stamp = createStamp({ country: 'Canada', year: 1967, faceValue: 0.5, currency: 'USD', condition: 'mint' })
  saveStamps([stamp])
  expect(loadStamps()).toEqual([stamp])
})

test('returns an empty list when nothing is saved', () => {
  expect(loadStamps()).toEqual([])
})

test.each(['not json{', '{"a":1}', 'null', '42'])('returns an empty list for corrupt data %s', (raw) => {
  localStorage.setItem('stamps', raw)
  expect(loadStamps()).toEqual([])
})

test('drops malformed entries and keeps valid ones', () => {
  const stamp = createStamp({ country: 'France', condition: 'used' })
  localStorage.setItem('stamps', JSON.stringify([stamp, { id: 1 }, null, { ...stamp, condition: 'shiny' }, { ...stamp, faceValue: '5' }, { ...stamp, faceValue: -3 }, { ...stamp, year: '1967' }, { ...stamp, currency: 5 }, { ...stamp, notes: {} }]))
  expect(loadStamps()).toEqual([stamp])
})

test('formats face value with currency', () => {
  expect(formatFaceValue({ faceValue: 5, currency: 'c' })).toBe('5c')
  expect(formatFaceValue({ faceValue: 0.5 })).toBe('0.5')
  expect(formatFaceValue({ currency: 'c' })).toBe('—')
})

test('sorts newest first', () => {
  const old = { ...createStamp({ country: 'A', condition: 'mint' }), createdAt: '2020-01-01T00:00:00.000Z' }
  const recent = { ...createStamp({ country: 'B', condition: 'mint' }), createdAt: '2024-01-01T00:00:00.000Z' }
  expect(sortNewestFirst([old, recent]).map((s) => s.country)).toEqual(['B', 'A'])
})

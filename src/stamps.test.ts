import { beforeEach, expect, test } from 'vitest'
import { createStamp, loadStamps, saveStamps, sortNewestFirst } from './stamps'

beforeEach(() => localStorage.clear())

test('round-trips stamps through localStorage', () => {
  const stamp = createStamp({ country: 'Canada', year: 1967, denomination: '5c', condition: 'mint' })
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
  localStorage.setItem('stamps', JSON.stringify([stamp, { id: 1 }, null, { ...stamp, condition: 'shiny' }]))
  expect(loadStamps()).toEqual([stamp])
})

test('sorts newest first', () => {
  const old = { ...createStamp({ country: 'A', condition: 'mint' }), createdAt: '2020-01-01T00:00:00.000Z' }
  const recent = { ...createStamp({ country: 'B', condition: 'mint' }), createdAt: '2024-01-01T00:00:00.000Z' }
  expect(sortNewestFirst([old, recent]).map((s) => s.country)).toEqual(['B', 'A'])
})

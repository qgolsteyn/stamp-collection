import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function addStamp(country: string, year = '', faceValue = '', currency = '') {
  const form = screen.getByRole('button', { name: 'Add stamp' }).closest('form')!
  fireEvent.change(within(form).getByLabelText('Country'), { target: { value: country } })
  fireEvent.change(within(form).getByLabelText('Year'), { target: { value: year } })
  fireEvent.change(within(form).getByLabelText('Face value'), { target: { value: faceValue } })
  fireEvent.change(within(form).getByLabelText('Currency'), { target: { value: currency } })
  fireEvent.click(within(form).getByRole('button', { name: 'Add stamp' }))
}

test('shows the empty state', () => {
  render(<App />)
  expect(screen.getByText(/No stamps yet/)).toBeTruthy()
})

test('adds a stamp and keeps it after a reload', () => {
  render(<App />)
  addStamp('Canada', '1967')
  expect(screen.getByText('Canada')).toBeTruthy()

  cleanup()
  render(<App />)
  expect(screen.getByText('Canada')).toBeTruthy()
  expect(screen.getByText(/1967/)).toBeTruthy()
})

test('lists newest first', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  render(<App />)
  vi.setSystemTime(new Date('2020-01-01'))
  addStamp('Canada')
  vi.setSystemTime(new Date('2024-01-01'))
  addStamp('France')
  vi.useRealTimers()
  const countries = screen.getAllByRole('listitem').map((li) => li.querySelector('strong')?.textContent)
  expect(countries).toEqual(['France', 'Canada'])
})

test('requires a country and saves nothing without one', () => {
  render(<App />)
  addStamp('   ')
  expect(screen.getByRole('alert').textContent).toBe('Country is required.')
  expect(screen.getByText(/No stamps yet/)).toBeTruthy()
  expect(localStorage.getItem('stamps')).toBeNull()
})

test('rejects a year that is not 4 digits', () => {
  render(<App />)
  addStamp('Canada', '67')
  expect(screen.getByRole('alert').textContent).toBe('Year must be a 4-digit number.')
  expect(screen.getByText(/No stamps yet/)).toBeTruthy()
})

test('stores face value as a number and shows it with its currency', () => {
  render(<App />)
  addStamp('Canada', '', '5', 'c')
  expect(screen.getByText(/5c/)).toBeTruthy()
  expect(JSON.parse(localStorage.getItem('stamps')!)[0]).toMatchObject({ faceValue: 5, currency: 'c' })

  addStamp('Japan', '', '0.5', 'USD')
  expect(JSON.parse(localStorage.getItem('stamps')!)[1].faceValue).toBe(0.5)
})

test.each(['abc', '-1', '1e3'])('rejects face value %s', (faceValue) => {
  render(<App />)
  addStamp('Canada', '', faceValue)
  expect(screen.getByRole('alert').textContent).toBe('Face value must be a number of 0 or more.')
  expect(screen.getByText(/No stamps yet/)).toBeTruthy()
})

test('edits a stamp in place', () => {
  render(<App />)
  addStamp('Canada')
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
  const item = screen.getByRole('listitem')
  fireEvent.change(within(item).getByLabelText('Country'), { target: { value: 'Mexico' } })
  fireEvent.click(within(item).getByRole('button', { name: 'Save' }))

  expect(screen.getByText('Mexico')).toBeTruthy()
  expect(screen.queryByText('Canada')).toBeNull()
  expect(screen.getAllByRole('listitem')).toHaveLength(1)
  expect(JSON.parse(localStorage.getItem('stamps')!)[0].country).toBe('Mexico')
})

test('edits face value: changes it, then clears it', () => {
  render(<App />)
  addStamp('Canada', '', '5', 'c')
  const editFaceValue = (value: string) => {
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const item = screen.getByRole('listitem')
    fireEvent.change(within(item).getByLabelText('Face value'), { target: { value } })
    fireEvent.click(within(item).getByRole('button', { name: 'Save' }))
  }

  editFaceValue('0.5')
  expect(screen.getByText(/0\.5c/)).toBeTruthy()
  expect(JSON.parse(localStorage.getItem('stamps')!)[0].faceValue).toBe(0.5)

  editFaceValue('')
  expect(JSON.parse(localStorage.getItem('stamps')!)[0].faceValue).toBeUndefined()
})

test('rejects an invalid face value when editing', () => {
  render(<App />)
  addStamp('Canada', '', '5', 'c')
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
  const item = screen.getByRole('listitem')
  fireEvent.change(within(item).getByLabelText('Face value'), { target: { value: '-1' } })
  fireEvent.click(within(item).getByRole('button', { name: 'Save' }))
  expect(within(item).getByRole('alert').textContent).toBe('Face value must be a number of 0 or more.')
  expect(JSON.parse(localStorage.getItem('stamps')!)[0].faceValue).toBe(5)
})

test('deletes a stamp after confirmation', () => {
  render(<App />)
  addStamp('Canada')
  const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(screen.getByText('Canada')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(confirm).toHaveBeenCalledTimes(2)
  expect(screen.queryByText('Canada')).toBeNull()
  expect(JSON.parse(localStorage.getItem('stamps')!)).toEqual([])
})

test('starts empty when localStorage is corrupt', () => {
  localStorage.setItem('stamps', '{not json')
  render(<App />)
  expect(screen.getByText(/No stamps yet/)).toBeTruthy()
  // Loading must not overwrite what is stored.
  expect(localStorage.getItem('stamps')).toBe('{not json')
})

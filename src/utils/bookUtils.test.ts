import { describe, expect, it } from 'vitest'
import { formatGenre, formatPrice } from './bookUtils'
import type { Genre } from '../types/bookTypes'

describe('formatPrice', () => {
  it('formats a numeric price as USD currency', () => {
    expect(formatPrice(19.99)).toBe('$19.99')
  })

  it('formats zero as a currency value', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('returns a fallback message when the price is null', () => {
    expect(formatPrice(null)).toBe('Price unavailable')
  })
})

describe('formatGenre', () => {
  it('capitalizes a single-word genre', () => {
    expect(formatGenre('FICTION' as Genre)).toBe('Fiction')
  })

  it('splits snake_case genres into capitalized words', () => {
    expect(formatGenre('SCIENCE_FICTION' as Genre)).toBe('Science Fiction')
  })
})

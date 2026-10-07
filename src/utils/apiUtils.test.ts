import { describe, expect, it } from 'vitest'
import { toQueryString } from './apiUtils'

describe('toQueryString', () => {
  it('serializes defined primitive values', () => {
    expect(toQueryString({ page: 1, size: 20, title: 'react' })).toBe(
      'page=1&size=20&title=react',
    )
  })

  it('skips undefined, null and empty-string values', () => {
    expect(
      toQueryString({ title: 'react', genre: undefined, author: null, q: '' }),
    ).toBe('title=react')
  })

  it('returns an empty string when no values are present', () => {
    expect(toQueryString({})).toBe('')
  })
})

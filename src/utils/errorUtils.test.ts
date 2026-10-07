import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './errorUtils'

describe('getErrorMessage', () => {
  it('returns the message of an Error instance', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
  })

  it('returns the fallback for a non-Error value', () => {
    expect(getErrorMessage('oops', 'fallback')).toBe('fallback')
  })

  it('returns the fallback when the Error has an empty message', () => {
    expect(getErrorMessage(new Error(''), 'fallback')).toBe('fallback')
  })
})

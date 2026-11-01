import {describe, expect, it} from 'vitest'
import {formatDigestChannel, summarizeDigest} from './digestUtils'

describe('formatDigestChannel', () => {
    it('labels the scheduled log channel', () => {
        expect(formatDigestChannel('LOG')).toBe('Scheduled')
    })

    it('labels the scheduled live channel', () => {
        expect(formatDigestChannel('SSE')).toBe('Scheduled (live)')
    })

    it('labels the manual channel', () => {
        expect(formatDigestChannel('MANUAL')).toBe('Generated manually')
    })

    it('passes an unknown channel through unchanged', () => {
        expect(formatDigestChannel('CUSTOM')).toBe('CUSTOM')
    })
})

describe('summarizeDigest', () => {
    it('reports an empty digest', () => {
        expect(summarizeDigest(0, 5)).toBe('No books at or below 5 in stock')
    })

    it('uses the singular noun for a single book', () => {
        expect(summarizeDigest(1, 5)).toBe('1 book at or below 5 in stock')
    })

    it('uses the plural noun for several books', () => {
        expect(summarizeDigest(3, 10)).toBe('3 books at or below 10 in stock')
    })
})

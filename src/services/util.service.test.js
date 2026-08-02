import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { utilService } from './util.service'

describe('utilService.makeId', () => {
    it('returns a 6 char id by default', () => {
        expect(utilService.makeId()).toHaveLength(6)
    })

    it('respects the requested length', () => {
        expect(utilService.makeId(12)).toHaveLength(12)
    })

    it('returns an empty string for a non positive length', () => {
        expect(utilService.makeId(0)).toBe('')
    })

    it('only uses alphanumeric characters', () => {
        expect(utilService.makeId(50)).toMatch(/^[A-Za-z0-9]+$/)
    })
})

describe('utilService.makeLorem', () => {
    it('concatenates the requested amount of words', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0)
        expect(utilService.makeLorem(3)).toBe('The sky The sky The sky ')
        Math.random.mockRestore()
    })

    it('returns an empty string when size is 0', () => {
        expect(utilService.makeLorem(0)).toBe('')
    })
})

describe('utilService.getRandomIntInclusive', () => {
    it('stays within the given range', () => {
        for (let i = 0; i < 100; i++) {
            const num = utilService.getRandomIntInclusive(1, 3)
            expect(num).toBeGreaterThanOrEqual(1)
            expect(num).toBeLessThanOrEqual(3)
        }
    })

    it('can return the max value', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999999)
        expect(utilService.getRandomIntInclusive(1, 5)).toBe(5)
        Math.random.mockRestore()
    })

    it('can return the min value', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0)
        expect(utilService.getRandomIntInclusive(1, 5)).toBe(1)
        Math.random.mockRestore()
    })
})

describe('utilService.randomPastTime', () => {
    it('returns a timestamp between an hour and a week ago', () => {
        const HOUR = 1000 * 60 * 60
        const WEEK = HOUR * 24 * 7
        const now = Date.now()
        const pastTime = utilService.randomPastTime()
        expect(pastTime).toBeLessThanOrEqual(now - HOUR)
        expect(pastTime).toBeGreaterThanOrEqual(now - WEEK)
    })
})

describe('utilService.debounce', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('calls the function only once for a burst of calls', () => {
        const spy = vi.fn()
        const debounced = utilService.debounce(spy, 300)

        debounced('a')
        debounced('b')
        debounced('c')
        expect(spy).not.toHaveBeenCalled()

        vi.advanceTimersByTime(300)
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith('c')
    })

    it('calls the function again after the timeout passed', () => {
        const spy = vi.fn()
        const debounced = utilService.debounce(spy, 100)

        debounced()
        vi.advanceTimersByTime(100)
        debounced()
        vi.advanceTimersByTime(100)
        expect(spy).toHaveBeenCalledTimes(2)
    })
})

describe('utilService storage', () => {
    beforeEach(() => localStorage.clear())

    it('saves and loads a value', () => {
        utilService.saveToStorage('key', { a: 1 })
        expect(utilService.loadFromStorage('key')).toEqual({ a: 1 })
    })

    it('returns undefined for a missing key', () => {
        expect(utilService.loadFromStorage('nope')).toBeUndefined()
    })
})

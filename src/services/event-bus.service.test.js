import { describe, expect, it, vi } from 'vitest'
import { eventBus, SHOW_MSG, showErrorMsg, showSuccessMsg, showUserMsg } from './event-bus.service'

describe('eventBus', () => {
    it('calls every listener of an event with the emitted data', () => {
        const first = vi.fn()
        const second = vi.fn()
        const unsubFirst = eventBus.on('ev-multi', first)
        const unsubSecond = eventBus.on('ev-multi', second)

        eventBus.emit('ev-multi', { txt: 'hello' })

        expect(first).toHaveBeenCalledWith({ txt: 'hello' })
        expect(second).toHaveBeenCalledWith({ txt: 'hello' })
        unsubFirst()
        unsubSecond()
    })

    it('does not call a listener after it unsubscribed', () => {
        const listener = vi.fn()
        const unsub = eventBus.on('ev-unsub', listener)
        unsub()

        eventBus.emit('ev-unsub', 'data')

        expect(listener).not.toHaveBeenCalled()
    })

    it('ignores emits for events without listeners', () => {
        expect(() => eventBus.emit('ev-none', 'data')).not.toThrow()
    })
})

describe('user messages', () => {
    it('emits the msg on the SHOW_MSG event', () => {
        const listener = vi.fn()
        const unsub = eventBus.on(SHOW_MSG, listener)

        showUserMsg({ txt: 'plain' })

        expect(listener).toHaveBeenCalledWith({ txt: 'plain' })
        unsub()
    })

    it('emits success and error msgs with their type', () => {
        const listener = vi.fn()
        const unsub = eventBus.on(SHOW_MSG, listener)

        showSuccessMsg('yay')
        showErrorMsg('oops')

        expect(listener).toHaveBeenNthCalledWith(1, { txt: 'yay', type: 'success' })
        expect(listener).toHaveBeenNthCalledWith(2, { txt: 'oops', type: 'error' })
        unsub()
    })

    it('exposes showUserMsg on the window for debugging', () => {
        expect(window.showUserMsg).toBe(showUserMsg)
    })
})

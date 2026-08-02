import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    SOCKET_EMIT_SEND_MSG,
    SOCKET_EVENT_ADD_MSG,
    SOCKET_EVENT_USER_UPDATED,
    socketService,
} from './socket.service'

beforeEach(() => {
    socketService.setup()
    sessionStorage.clear()
})

describe('socketService listeners', () => {
    it('calls every listener registered for an event', () => {
        const first = vi.fn()
        const second = vi.fn()
        socketService.on('some-event', first)
        socketService.on('some-event', second)

        socketService.emit('some-event', { a: 1 })

        expect(first).toHaveBeenCalledWith({ a: 1 })
        expect(second).toHaveBeenCalledWith({ a: 1 })
    })

    it('ignores emits for events without listeners', () => {
        expect(() => socketService.emit('no-listeners', {})).not.toThrow()
    })

    it('removes a single listener', () => {
        const listener = vi.fn()
        const other = vi.fn()
        socketService.on('some-event', listener)
        socketService.on('some-event', other)

        socketService.off('some-event', listener)
        socketService.emit('some-event', 'data')

        expect(listener).not.toHaveBeenCalled()
        expect(other).toHaveBeenCalledWith('data')
    })

    it('removes all listeners of an event when no cb is given', () => {
        const listener = vi.fn()
        socketService.on('some-event', listener)

        socketService.off('some-event')
        socketService.emit('some-event', 'data')

        expect(listener).not.toHaveBeenCalled()
    })

    it('ignores off for an unknown event', () => {
        expect(() => socketService.off('unknown-event')).not.toThrow()
    })

    it('routes a sent chat msg to the add msg listeners', () => {
        const listener = vi.fn()
        socketService.on(SOCKET_EVENT_ADD_MSG, listener)

        socketService.emit(SOCKET_EMIT_SEND_MSG, { txt: 'hi' })

        expect(listener).toHaveBeenCalledWith({ txt: 'hi' })
    })

    it('drops listeners on terminate', () => {
        const listener = vi.fn()
        socketService.on('some-event', listener)

        socketService.terminate()
        socketService.emit('some-event', 'data')

        expect(listener).not.toHaveBeenCalled()
    })
})

describe('socketService test helpers', () => {
    it('pushes a chat msg', () => {
        const listener = vi.fn()
        socketService.on(SOCKET_EVENT_ADD_MSG, listener)

        socketService.testChatMsg()

        expect(listener).toHaveBeenCalledWith({ from: 'Someone', txt: 'Aha it worked!' })
    })

    it('pushes a user update with a score', () => {
        const listener = vi.fn()
        socketService.on(SOCKET_EVENT_USER_UPDATED, listener)

        socketService.testUserUpdate()

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ score: 555 }))
    })
})

describe('socketService login/logout', () => {
    it('does not throw', () => {
        expect(() => socketService.login('u101')).not.toThrow()
        expect(() => socketService.logout()).not.toThrow()
    })
})

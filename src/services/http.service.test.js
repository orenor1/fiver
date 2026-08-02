import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import Axios from 'axios'
import { httpService } from './http.service'

vi.mock('axios', () => {
    const request = vi.fn()
    return { default: { create: vi.fn(() => request), __request: request } }
})

const request = Axios.create()

beforeEach(() => {
    request.mockReset()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'dir').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

describe('httpService', () => {
    it('sends GET data as query params and returns the response data', async () => {
        request.mockResolvedValue({ data: [{ _id: 'g1' }] })

        const res = await httpService.get('gig', { txt: 'logo' })

        expect(res).toEqual([{ _id: 'g1' }])
        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            method: 'GET',
            params: { txt: 'logo' },
            data: { txt: 'logo' },
        }))
        expect(request.mock.calls[0][0].url).toMatch(/gig$/)
    })

    it.each([
        ['post', 'POST'],
        ['put', 'PUT'],
        ['delete', 'DELETE'],
    ])('sends %s data as a body', async (fnName, method) => {
        request.mockResolvedValue({ data: 'ok' })

        const res = await httpService[fnName]('gig', { title: 'new' })

        expect(res).toBe('ok')
        expect(request).toHaveBeenCalledWith(expect.objectContaining({
            method,
            data: { title: 'new' },
            params: null,
        }))
    })

    it('rethrows failures', async () => {
        request.mockRejectedValue(new Error('Network down'))
        await expect(httpService.get('gig')).rejects.toThrow('Network down')
    })

    it('clears the session and redirects on a 401', async () => {
        const realLocation = window.location
        const assignSpy = vi.fn()
        Object.defineProperty(window, 'location', {
            value: { ...realLocation, assign: assignSpy },
            writable: true,
            configurable: true,
        })
        onTestFinished(() => {
            Object.defineProperty(window, 'location', { value: realLocation, writable: true, configurable: true })
        })
        sessionStorage.setItem('loggedinUser', '{}')
        const err = new Error('Unauthorized')
        err.response = { status: 401 }
        request.mockRejectedValue(err)

        await expect(httpService.get('gig')).rejects.toThrow('Unauthorized')

        expect(sessionStorage.length).toBe(0)
        expect(assignSpy).toHaveBeenCalledWith('/')
    })
})

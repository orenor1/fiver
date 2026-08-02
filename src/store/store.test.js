import { describe, expect, it } from 'vitest'
import { store } from './store'
import { CHANGE_COUNT, SET_USERS } from './user.reducer'

describe('store', () => {
    it('exposes the user module state', () => {
        expect(store.getState()).toHaveProperty('userModule')
        expect(store.getState().userModule).toEqual({ count: 10, user: null, users: [], watchedUser: null })
    })

    it('updates the state on dispatch', () => {
        store.dispatch({ type: CHANGE_COUNT, diff: 5 })
        expect(store.getState().userModule.count).toBe(15)
    })

    it('notifies subscribers on dispatch', () => {
        let called = 0
        const unsubscribe = store.subscribe(() => called++)

        store.dispatch({ type: SET_USERS, users: [{ _id: 'u101' }] })

        expect(called).toBe(1)
        expect(store.getState().userModule.users).toEqual([{ _id: 'u101' }])
        unsubscribe()
    })
})

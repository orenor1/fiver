import { describe, expect, it } from 'vitest'
import {
    CHANGE_COUNT,
    DECREMENT,
    INCREMENT,
    REMOVE_USER,
    SET_SCORE,
    SET_USER,
    SET_USERS,
    SET_WATCHED_USER,
    userReducer,
} from './user.reducer'

const state = {
    count: 10,
    user: { _id: 'u101', score: 100 },
    users: [{ _id: 'u101' }, { _id: 'u102' }],
    watchedUser: null,
}

describe('userReducer', () => {
    it('returns the initial state for an unknown action', () => {
        const newState = userReducer(undefined, { type: 'UNKNOWN' })
        expect(newState).toEqual({ count: 10, user: null, users: [], watchedUser: null })
    })

    it('returns the same state object for an unknown action', () => {
        expect(userReducer(state, { type: 'UNKNOWN' })).toBe(state)
    })

    it('increments and decrements the count', () => {
        expect(userReducer(state, { type: INCREMENT }).count).toBe(11)
        expect(userReducer(state, { type: DECREMENT }).count).toBe(9)
    })

    it('changes the count by a diff', () => {
        expect(userReducer(state, { type: CHANGE_COUNT, diff: -4 }).count).toBe(6)
    })

    it('sets the user', () => {
        const user = { _id: 'u103' }
        expect(userReducer(state, { type: SET_USER, user }).user).toEqual(user)
    })

    it('sets the watched user', () => {
        const user = { _id: 'u104' }
        expect(userReducer(state, { type: SET_WATCHED_USER, user }).watchedUser).toEqual(user)
    })

    it('removes a user by id', () => {
        expect(userReducer(state, { type: REMOVE_USER, userId: 'u101' }).users).toEqual([{ _id: 'u102' }])
    })

    it('sets the users list', () => {
        const users = [{ _id: 'u105' }]
        expect(userReducer(state, { type: SET_USERS, users }).users).toEqual(users)
    })

    it('sets the score without touching the rest of the user', () => {
        const newState = userReducer(state, { type: SET_SCORE, score: 500 })
        expect(newState.user).toEqual({ _id: 'u101', score: 500 })
    })

    it('does not mutate the given state', () => {
        userReducer(state, { type: INCREMENT })
        expect(state.count).toBe(10)
    })
})

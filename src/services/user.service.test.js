import { beforeEach, describe, expect, it, vi } from 'vitest'
import { storageService } from './async-storage.service'
import { userService } from './user.service'

vi.mock('./async-storage.service', () => ({
    storageService: {
        query: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        remove: vi.fn(),
    },
}))

const USER = {
    _id: 'u101',
    fullname: 'User 1',
    imgUrl: '/img/img1.jpg',
    username: 'user1',
    password: 'secret',
    score: 100,
    isAdmin: false,
}

beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
})

describe('userService.getUsers', () => {
    it('queries the users from storage', async () => {
        storageService.query.mockResolvedValue([USER])
        expect(await userService.getUsers()).toEqual([USER])
        expect(storageService.query).toHaveBeenCalledWith('user')
    })
})

describe('userService.getById', () => {
    it('gets a single user from storage', async () => {
        storageService.get.mockResolvedValue(USER)
        expect(await userService.getById('u101')).toEqual(USER)
        expect(storageService.get).toHaveBeenCalledWith('user', 'u101')
    })
})

describe('userService.remove', () => {
    it('removes the user from storage', async () => {
        storageService.remove.mockResolvedValue()
        await userService.remove('u101')
        expect(storageService.remove).toHaveBeenCalledWith('user', 'u101')
    })
})

describe('userService.login', () => {
    it('saves the matching user locally and returns the mini user', async () => {
        storageService.query.mockResolvedValue([USER, { ...USER, _id: 'u102', username: 'user2' }])

        const user = await userService.login({ username: 'user1', password: 'secret' })

        expect(user).toEqual({
            _id: 'u101',
            fullname: 'User 1',
            imgUrl: '/img/img1.jpg',
            score: 100,
            isAdmin: false,
        })
        expect(userService.getLoggedinUser()).toEqual(user)
    })

    it('returns undefined and saves nothing for an unknown username', async () => {
        storageService.query.mockResolvedValue([USER])

        expect(await userService.login({ username: 'ghost' })).toBeUndefined()
        expect(userService.getLoggedinUser()).toBeNull()
    })
})

describe('userService.signup', () => {
    it('sets a default imgUrl and an initial score', async () => {
        storageService.post.mockImplementation((_type, entity) => Promise.resolve({ ...entity, _id: 'u200' }))

        const user = await userService.signup({ fullname: 'New User', username: 'new', password: '123' })

        const [, newEntity] = storageService.post.mock.calls[0]
        expect(newEntity.imgUrl).toBeTruthy()
        expect(newEntity.score).toBe(10000)
        expect(user).toEqual({
            _id: 'u200',
            fullname: 'New User',
            imgUrl: newEntity.imgUrl,
            score: 10000,
            isAdmin: undefined,
        })
    })

    it('keeps a provided imgUrl', async () => {
        storageService.post.mockImplementation((_type, entity) => Promise.resolve({ ...entity, _id: 'u201' }))

        await userService.signup({ fullname: 'New User', username: 'new', imgUrl: '/img/custom.jpg' })

        expect(storageService.post.mock.calls[0][1].imgUrl).toBe('/img/custom.jpg')
    })
})

describe('userService.logout', () => {
    it('clears the loggedin user', async () => {
        userService.saveLocalUser(USER)
        await userService.logout()
        expect(userService.getLoggedinUser()).toBeNull()
    })
})

describe('userService.update', () => {
    it('persists the new score', async () => {
        storageService.get.mockResolvedValue({ ...USER })
        storageService.put.mockImplementation((_type, entity) => Promise.resolve(entity))
        userService.saveLocalUser({ ...USER, _id: 'u999' })

        const user = await userService.update({ _id: 'u101', score: 250 })

        expect(user.score).toBe(250)
        expect(storageService.put).toHaveBeenCalledWith('user', expect.objectContaining({ _id: 'u101', score: 250 }))
    })

    it('updates the loggedin user when it is the same user', async () => {
        storageService.get.mockResolvedValue({ ...USER })
        storageService.put.mockImplementation((_type, entity) => Promise.resolve(entity))
        userService.saveLocalUser(USER)

        await userService.update({ _id: 'u101', score: 250 })

        expect(userService.getLoggedinUser().score).toBe(250)
    })

    it('leaves the loggedin user untouched when updating another user', async () => {
        storageService.get.mockResolvedValue({ ...USER, _id: 'u102' })
        storageService.put.mockImplementation((_type, entity) => Promise.resolve(entity))
        userService.saveLocalUser(USER)

        await userService.update({ _id: 'u102', score: 250 })

        expect(userService.getLoggedinUser().score).toBe(100)
    })
})

describe('userService.changeScore', () => {
    it('throws when no user is loggedin', async () => {
        await expect(userService.changeScore(10)).rejects.toThrow('Not loggedin')
    })

    it('adds the diff to the loggedin user score', async () => {
        storageService.get.mockResolvedValue({ ...USER })
        storageService.put.mockImplementation((_type, entity) => Promise.resolve(entity))
        userService.saveLocalUser(USER)

        expect(await userService.changeScore(50)).toBe(150)
        expect(userService.getLoggedinUser().score).toBe(150)
    })
})

describe('userService.saveLocalUser', () => {
    it('stores only the mini user fields', () => {
        const miniUser = userService.saveLocalUser(USER)
        expect(miniUser).not.toHaveProperty('password')
        expect(miniUser).not.toHaveProperty('username')
        expect(userService.getLoggedinUser()).toEqual(miniUser)
    })
})

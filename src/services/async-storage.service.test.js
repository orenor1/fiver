import { beforeEach, describe, expect, it } from 'vitest'
import { storageService } from './async-storage.service'

const ENTITY_TYPE = 'testEntity'

function seed(entities) {
    localStorage.setItem(ENTITY_TYPE, JSON.stringify(entities))
}

describe('storageService.query', () => {
    beforeEach(() => localStorage.clear())

    it('returns an empty array when nothing is stored', async () => {
        expect(await storageService.query(ENTITY_TYPE, 0)).toEqual([])
    })

    it('returns the stored entities', async () => {
        seed([{ _id: 'a1' }])
        expect(await storageService.query(ENTITY_TYPE, 0)).toEqual([{ _id: 'a1' }])
    })
})

describe('storageService.get', () => {
    beforeEach(() => {
        localStorage.clear()
        seed([{ _id: 'a1', name: 'first' }])
    })

    it('returns the matching entity', async () => {
        expect(await storageService.get(ENTITY_TYPE, 'a1')).toEqual({ _id: 'a1', name: 'first' })
    })

    it('rejects when the entity is missing', async () => {
        await expect(storageService.get(ENTITY_TYPE, 'nope')).rejects.toThrow(/cannot find entity with id: nope/)
    })
})

describe('storageService.post', () => {
    beforeEach(() => localStorage.clear())

    it('adds an id and persists the entity', async () => {
        const entity = await storageService.post(ENTITY_TYPE, { name: 'new' })
        expect(entity._id).toHaveLength(5)
        expect(JSON.parse(localStorage.getItem(ENTITY_TYPE))).toEqual([entity])
    })

    it('appends to existing entities', async () => {
        seed([{ _id: 'a1' }])
        await storageService.post(ENTITY_TYPE, { name: 'new' })
        expect(JSON.parse(localStorage.getItem(ENTITY_TYPE))).toHaveLength(2)
    })
})

describe('storageService.put', () => {
    beforeEach(() => {
        localStorage.clear()
        seed([{ _id: 'a1', name: 'first', keep: true }])
    })

    it('merges the update into the stored entity', async () => {
        const updated = await storageService.put(ENTITY_TYPE, { _id: 'a1', name: 'changed' })
        expect(updated).toEqual({ _id: 'a1', name: 'changed', keep: true })
        expect(JSON.parse(localStorage.getItem(ENTITY_TYPE))).toEqual([updated])
    })

    it('rejects when the entity is missing', async () => {
        await expect(storageService.put(ENTITY_TYPE, { _id: 'nope' })).rejects.toThrow(/Update failed/)
    })
})

describe('storageService.remove', () => {
    beforeEach(() => {
        localStorage.clear()
        seed([{ _id: 'a1' }, { _id: 'a2' }])
    })

    it('removes the entity from storage', async () => {
        await storageService.remove(ENTITY_TYPE, 'a1')
        expect(JSON.parse(localStorage.getItem(ENTITY_TYPE))).toEqual([{ _id: 'a2' }])
    })

    it('rejects when the entity is missing', async () => {
        await expect(storageService.remove(ENTITY_TYPE, 'nope')).rejects.toThrow(/Remove failed/)
    })
})

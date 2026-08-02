import { describe, expect, it } from 'vitest'
import { categoryService } from './category.service'

describe('categoryService', () => {
    it('returns a list of categories', () => {
        expect(Array.isArray(categoryService.getAll())).toBe(true)
    })

    it('returns a category object by id', () => {
        expect(categoryService.getById('c101')).toEqual({})
    })
})

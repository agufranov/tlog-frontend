import { expect, test } from 'vitest'
import { t } from './xtyped'

test('string', () => {
  const s = t.string()

  expect(s.validate('')).toBe(true)
  expect(s.validate(1)).toBe(false)
})

test('object', () => {
  const obj = t.object({ x: t.number(), s: t.string() })

  expect(obj.validate({ x: 1, s: '' })).toBe(true)
  // TODO needs strict check
  //   expect(obj.validate({ x: 1, s: '', a: 2 })).toBe(false)
  expect(obj.validate({ x: 1, s: 1 })).toBe(false)
  expect(obj.validate({ x: 1 })).toBe(false)
  expect(obj.validate(null)).toBe(false)
})

test('array', () => {
  //   const arr = t.array(t.string())
  //   expect(arr.validate([])).toBe(true)
  //   expect(arr.validate(['a'])).toBe(true)
  //   expect(arr.validate(['a', 'b'])).toBe(true)
  //   expect(arr.validate([1])).toBe(false)
  //   expect(arr.validate('abc')).toBe(false)
})

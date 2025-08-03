namespace XTyped {
  export type String = {
    __type: 'string'
  }

  export type Number = {
    __type: 'number'
  }

  export type Object<T> = {
    __type: 'object'
    value: {
      [key: string]: Value<T>
    }
  }

  export type Value<T> = String | Number | Object<T>

  export type Infer<T> = T extends String
    ? string
    : T extends Number
    ? number
    : T extends Object<infer O>
    ? { [key in keyof O]: Infer<O[key]> }
    : never
}

const t = {
  string: (): XTyped.String => ({ __type: 'string' }),
  number: (): XTyped.Number => ({ __type: 'number' }),
  object: <T extends { [key: string]: XTyped.Value<T> }>(value: T): XTyped.Object<T> => ({
    __type: 'object',
    value,
  }),
}

const a = t.string()
const b = t.number()
const c = t.object({
  x: t.number(),
  y: t.string(),
  z: t.object({
    z1: t.number(),
    z2: t.string(),
  }),
})

type T1 = XTyped.Infer<typeof a>
type T2 = XTyped.Infer<typeof b>
type T3 = XTyped.Infer<typeof c>

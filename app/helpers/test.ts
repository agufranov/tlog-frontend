type TypedString = {
  __type: 'string'
}

type TypedNumber = {
  __type: 'number'
}

type TypedObject<T> = {
  __type: 'object'
  value: {
    [key: string]: TypedString | TypedNumber | TypedObject<T>
  }
}

const t = {
  string: (): TypedString => ({ __type: 'string' }),
  number: (): TypedNumber => ({ __type: 'number' }),
  object: <T extends { [key: string]: TypedString | TypedNumber | TypedObject<T> }>(o: T): TypedObject<T> => ({
    __type: 'object',
    value: o,
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

type Infer<T> = T extends TypedString
  ? string
  : T extends TypedNumber
  ? number
  : T extends TypedObject<infer O>
  ? { [key in keyof O]: Infer<O[key]> }
  : never

type T1 = Infer<typeof a>
type T2 = Infer<typeof b>
type T3 = Infer<typeof c>

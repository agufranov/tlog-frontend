export namespace XTyped {
  export enum Types {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    ARRAY = 'array',
    UNION = 'union',
  }

  interface Type<T extends Types> {
    type: T
  }

  abstract class Schema<T extends Types> implements Type<T> {
    abstract type: T
    abstract validate(o: unknown): o is Infer<this>
  }

  export interface IString extends Type<Types.STRING> {}

  export interface INumber extends Type<Types.NUMBER> {}

  export interface IBoolean extends Type<Types.BOOLEAN> {}

  export interface IObject<T extends { [key: string]: Value }> extends Type<Types.OBJECT> {
    value: T
  }

  export interface IArray<T extends Value> extends Type<Types.ARRAY> {
    elementValue: T
  }

  export class String extends Schema<Types.STRING> {
    type = Types.STRING as const

    validate(o: unknown): o is Infer<this> {
      return typeof o === 'string'
    }
  }
  export class Number extends Schema<Types.NUMBER> {
    type = Types.NUMBER as const

    validate(o: unknown): o is Infer<this> {
      return typeof o === 'number'
    }
  }

  export class Boolean extends Schema<Types.BOOLEAN> {
    type = Types.BOOLEAN as const

    validate(o: unknown): o is Infer<this> {
      return typeof o === 'boolean'
    }
  }

  export class Object<T> extends Schema<Types.OBJECT> {
    type = Types.OBJECT as const

    constructor(public value: T) {
      super()
    }

    validate(o: unknown): o is Infer<this> {
      // TODO
      return true
    }
  }

  export class Array<T> extends Schema<Types.ARRAY> {
    type = Types.ARRAY as const

    constructor(public elementValue: T) {
      super()
    }

    validate(o: unknown): o is Infer<this> {
      // TODO
      return true
    }
  }

  export type Value = IString | INumber | IBoolean | IObject<{}> | IArray<Value> | IUnion<Value[]>

  type ArrayElement<T extends any[]> = T extends (infer U)[] ? U : never

  export type Infer<T> = T extends IString
    ? string
    : T extends INumber
    ? number
    : T extends IBoolean
    ? boolean
    : T extends IObject<infer O>
    ? { [key in keyof O]: Infer<O[key]> }
    : T extends IArray<infer E>
    ? Infer<E>[]
    : T extends IUnion<infer U>
    ? Infer<ArrayElement<U>>
    : never

  export interface IUnion<T extends Value[]> extends Type<Types.UNION> {
    value: T
  }
}

export const t = {
  string: () => new XTyped.String(),
  number: () => new XTyped.Number(),
  boolean: () => new XTyped.Boolean(),
  object: <T extends { [key: string]: XTyped.Value }>(value: T) => new XTyped.Object<T>(value),
  array: <T extends XTyped.Value>(elementValue: T) => new XTyped.Array<T>(elementValue),
  union: <T extends XTyped.Value[]>(value: T): XTyped.IUnion<T> => ({ type: XTyped.Types.UNION, value }),
}

const u = t.union([t.string(), t.number(), t.boolean()])
type TU = XTyped.Infer<typeof u>

const a = t.object({
  x: t.number(),
  y: t.string(),
  u,
  arr: t.array(t.array(t.boolean())),
  z: t.object({
    z1: t.number(),
    z2: t.string(),
  }),
})

type TA = XTyped.Infer<typeof a>

const o: unknown = { x: 2, y: '2' }

// if (t.string().validate(o)) {
//   o
// }
if (a.validate(o)) {
  o
}

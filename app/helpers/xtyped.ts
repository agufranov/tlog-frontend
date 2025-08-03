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
    abstract validate(value: unknown): value is Infer<this>
  }

  export interface IString extends Type<Types.STRING> {}

  export interface INumber extends Type<Types.NUMBER> {}

  export interface IBoolean extends Type<Types.BOOLEAN> {}

  export interface IObject<T extends { [key: string]: Value }> extends Type<Types.OBJECT> {
    schema: T
  }

  export interface IArray<T extends Value> extends Type<Types.ARRAY> {
    schema: T
  }

  export interface IUnion<T extends Value[]> extends Type<Types.UNION> {
    schema: T
  }

  export class String extends Schema<Types.STRING> {
    type = Types.STRING as const

    validate(value: unknown): value is Infer<this> {
      return typeof value === 'string'
    }
  }
  export class Number extends Schema<Types.NUMBER> {
    type = Types.NUMBER as const

    validate(value: unknown): value is Infer<this> {
      return typeof value === 'number'
    }
  }

  export class Boolean extends Schema<Types.BOOLEAN> {
    type = Types.BOOLEAN as const

    validate(value: unknown): value is Infer<this> {
      return typeof value === 'boolean'
    }
  }

  export class Object<T extends { [key: string]: Schema<any> }> extends Schema<Types.OBJECT> {
    type = Types.OBJECT as const

    constructor(public schema: T) {
      super()
    }

    validate(value: unknown): value is Infer<this> {
      if (typeof value !== 'object' || value === null) return false

      for (let key in this.schema) {
        // TODO strict?
        if (!this.schema[key]?.validate(value[key as keyof typeof value])) return false
      }

      return true
    }
  }

  export class Array<T extends Schema<any>> extends Schema<Types.ARRAY> {
    type = Types.ARRAY as const

    constructor(public schema: T) {
      super()
    }

    validate(value: unknown): value is Infer<this> {
      if (!global.Array.isArray(value)) return false
      for (let item of value) {
        if (!this.schema.validate(item)) return false
      }

      return true
    }
  }

  export class Union<T> extends Schema<Types.UNION> {
    type = Types.UNION as const

    constructor(public schema: T) {
      super()
    }

    validate(o: unknown): o is Infer<this> {
      // TODO
      return true
    }
  }

  export type Value = IString | INumber | IBoolean | IObject<{}> | IArray<Value> | IUnion<Value[]>

  export type Infer<T> = T extends IString
    ? string
    : T extends INumber
    ? number
    : T extends IBoolean
    ? boolean
    : T extends IObject<infer U>
    ? { [key in keyof U]: Infer<U[key]> }
    : T extends IArray<infer U>
    ? Infer<U>[]
    : T extends IUnion<(infer U extends Value)[]>
    ? Infer<U>
    : never
}

export const t = {
  string: () => new XTyped.String(),
  number: () => new XTyped.Number(),
  boolean: () => new XTyped.Boolean(),
  object: <T extends { [key: string]: XTyped.Value }>(schema: T) => new XTyped.Object<T>(schema),
  array: <T extends XTyped.Value>(schema: T) => new XTyped.Array<T>(schema),
  union: <T extends XTyped.Value[]>(schema: T) => new XTyped.Union<T>(schema),
}

const u = t.union([t.string(), t.number(), t.array(t.boolean())])
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

if (u.validate(o)) {
  o
}
if (a.validate(o)) {
  o
}

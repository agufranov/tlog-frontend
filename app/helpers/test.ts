export namespace XTyped {
  export enum Types {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
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

  export interface IObject<T> extends Type<Types.OBJECT> {
    value: {
      [key: string]: Value<T>
    }
  }

  type T = Infer<Schema<Types.OBJECT>>

  export class String extends Schema<Types.STRING> {
    type = Types.STRING as const

    validate(o: unknown): o is Infer<this> {
      return typeof o === 'string'
    }
  }

  export class Object<T> extends Schema<Types.OBJECT> {
    type = Types.OBJECT as const

    constructor(
      public value: {
        [key: string]: Value<T>
      }
    ) {
      super()
    }

    validate(o: unknown): o is Infer<this> {
      // TODO
      return true
    }
  }

  export type Value<T> = IString | INumber | IBoolean | IObject<T>

  export type Infer<T> = T extends IString
    ? string
    : T extends INumber
    ? number
    : T extends IBoolean
    ? boolean
    : T extends IObject<infer O>
    ? { [key in keyof O]: Infer<O[key]> }
    : never
}

export const t = {
  // string: (): XTyped.IString => ({ type: XTyped.Types.STRING }),
  string: () => new XTyped.String(),
  number: (): XTyped.INumber => ({ type: XTyped.Types.NUMBER }),
  boolean: (): XTyped.IBoolean => ({ type: XTyped.Types.BOOLEAN }),
  object: <T extends { [key: string]: XTyped.Value<T> }>(value: T) => new XTyped.Object<T>(value),
}

const a = t.object({
  x: t.number(),
  y: t.string(),
  z: t.object({
    z1: t.number(),
    z2: t.string(),
  }),
})

const o: unknown = { x: 2, y: '2' }

if (t.string().validate(o)) {
  o
}
if (a.validate(o)) {
  o
}

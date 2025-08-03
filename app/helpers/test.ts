export namespace XTyped {
  export enum Types {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
  }
  export type String = {
    __type: Types.STRING
  }

  export type Number = {
    __type: Types.NUMBER
  }

  export type Boolean = {
    __type: Types.BOOLEAN
  }

  export type Object<T> = {
    __type: Types.OBJECT
    value: {
      [key: string]: Value<T>
    }
  }

  export type Value<T> = String | Number | Boolean | Object<T>

  export type Infer<T> = T extends String
    ? string
    : T extends Number
    ? number
    : T extends Boolean
    ? boolean
    : T extends Object<infer O>
    ? { [key in keyof O]: Infer<O[key]> }
    : never
}

export const t = {
  string: (): XTyped.String => ({ __type: XTyped.Types.STRING }),
  number: (): XTyped.Number => ({ __type: XTyped.Types.NUMBER }),
  boolean: (): XTyped.Boolean => ({ __type: XTyped.Types.BOOLEAN }),
  object: <T extends { [key: string]: XTyped.Value<T> }>(value: T): XTyped.Object<T> => ({
    __type: XTyped.Types.OBJECT,
    value,
  }),
}

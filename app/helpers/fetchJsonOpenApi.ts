import { fetchJson } from './fetchJson'
import { HTTP_METHODS, isHttpMethodHasBody, type HttpMethod } from './httpMethods'
import type { ApiEndpointRequest, ApiEndpointResponseSuccess, RoutesWithMethod } from './openApiTypes'

const createFetchJsonOpenApiMethod = <M extends HttpMethod>(httpMethod: M) => {
  if (isHttpMethodHasBody(httpMethod)) {
    return async <TPath extends RoutesWithMethod<M>>(
      input: TPath,
      payload?: ApiEndpointRequest<M, TPath>,
      init?: RequestInit
    ) => {
      const { data } = await fetchJson[httpMethod].call(null, input, payload, init)
      return data as Promise<ApiEndpointResponseSuccess<M, TPath>>
    }
  } else {
    return async <TPath extends RoutesWithMethod<M>>(input: TPath, init?: RequestInit) => {
      const { data } = await fetchJson[httpMethod].call(null, input, init)
      return data as Promise<ApiEndpointResponseSuccess<M, TPath>>
    }
  }
}

type FetchJsonOpenApi = {
  // [httpMethod in HttpMethod]: FetchJsonOpenapiMethod<httpMethod>
  [httpMethod in HttpMethod]: ReturnType<typeof createFetchJsonOpenApiMethod<httpMethod>>
}

export const fetchJsonOpenApi = {
  ...HTTP_METHODS.reduce((acc, httpMethod) => {
    return {
      ...acc,
      [httpMethod]: createFetchJsonOpenApiMethod(httpMethod),
    }
  }, {} as FetchJsonOpenApi),
}

const xxx = fetchJsonOpenApi
  .post('/auth/signIn', { username: 's', password: 'd' }, {})
  .then((data) => data.debugSessionId)

const yyy = fetchJsonOpenApi
  // @ts-expect-error
  .post('/auth/signIn', { userame: 's', password: 'd' }, {})
  // @ts-expect-error
  .then((data) => data.debugSesionId)

type E = {
  e1: {
    get?: never
    post: {}
  }
  e2: {
    get: {}
    post: {}
  }
  e3: {
    get?: never
    post?: never
  }
  e4: {
    get: {}
    post?: never
  }
}

type MS = 'get' | 'post'

type AvailableKeys<Method extends MS> = {
  [K in keyof E]-?: E[K] extends { [M in Method]: {} } ? K : never // Iterate through all keys of E and remove optionality // Check if K has a property with the given Method which is of type {}
}[keyof E] // Get all the keys that satisfy the condition

type T<M extends 'get' | 'post'> = AvailableKeys<M>

// Test:
type GetKeys = T<'get'> // "e2" | "e4"
type PostKeys = T<'post'> // "e1" | "e2"

// f('get','e1') // дожна быть ошибка typescript: E.e1.get имеет тип never | undefined
// f('post', 'e1') // ok
// f('get', 'e2') // ok

// type GettableKeys<O, S extends keyof E[keyof E]> = keyof {
//   [K in keyof O as O[K][S] extends never | undefined ? never : K]: K
// }

// type A = keyof E[keyof E]

// const gkk: GettableKeys<E, 's'> = 'e2'

// const post = <TPath extends keyof paths>(input: TPath) => {}

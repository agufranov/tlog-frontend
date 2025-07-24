import type { paths } from 'api'
import { fetchJson } from './fetchJson'
import { HTTP_METHODS, isHttpMethodHasBody, type HttpMethod } from './httpMethods'

type ApiRoute<T extends keyof paths> = paths[T]

type ApiEndpoint<M extends HttpMethod, T extends keyof paths> = M extends keyof ApiRoute<T> ? ApiRoute<T>[M] : never

type ApiEndpointRequest<M extends HttpMethod, T extends keyof paths> = 'requestBody' extends keyof ApiEndpoint<M, T>
  ? 'content' extends keyof ApiEndpoint<M, T>['requestBody']
    ? 'application/json' extends keyof ApiEndpoint<M, T>['requestBody']['content']
      ? ApiEndpoint<M, T>['requestBody']['content']['application/json'] & {}
      : never
    : never
  : never

type ApiEndpointResponses<M extends HttpMethod, T extends keyof paths> = 'responses' extends keyof ApiEndpoint<M, T>
  ? ApiEndpoint<M, T>['responses']
  : never

// ODO handle errors too
type ApiEndpointResponseSuccess<M extends HttpMethod, T extends keyof paths> = 200 extends keyof ApiEndpointResponses<
  M,
  T
>
  ? 'content' extends keyof ApiEndpointResponses<M, T>[200]
    ? 'application/json' extends keyof ApiEndpointResponses<M, T>[200]['content']
      ? ApiEndpointResponses<M, T>[200]['content']['application/json'] & {}
      : never
    : never
  : never

const createFetchJsonOpenApiMethod = <M extends HttpMethod>(httpMethod: M) => {
  if (isHttpMethodHasBody(httpMethod)) {
    return async <TPath extends keyof paths>(
      input: TPath,
      payload?: ApiEndpointRequest<M, TPath>,
      init?: RequestInit
    ) => {
      const { data } = await fetchJson[httpMethod].call(null, input, payload, init)
      return data as Promise<ApiEndpointResponseSuccess<M, TPath>>
    }
  } else {
    return async <TPath extends keyof paths>(input: TPath, init?: RequestInit) => {
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
  }
  e2: {
    get: {}
  }
  e3: {
    get?: never
  }
  e4: {
    get: {}
  }
}

type GettableKeys = keyof { [K in keyof E as E[K]['get'] extends never | undefined ? never : K]: K }

const gkk: GettableKeys = 'e2'

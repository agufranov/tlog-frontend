import type { paths } from 'api'
import { fetchJson, type FetchInit, type FetchJsonMethodResult } from './fetchJson'
import { HTTP_METHODS, isHttpMethodHasBody, type HttpMethod, type HttpMethodsWithoutBody } from './httpMethods'

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

export type FetchJsonOpenapiMethodWithoutBodyArguments<TPath extends keyof paths> = [TPath, FetchInit?]

// const a: ApiEndpointRequest<'post', '/auth/signOut'> = {}

export type FetchJsonOpenapiMethodWithBodyArguments<M extends HttpMethod, TPath extends keyof paths> = [
  TPath,
  ApiEndpointRequest<M, TPath>?,
  FetchInit?
]
export type FetchJsonOpenapiMethodArguments<
  M extends HttpMethod,
  TPath extends keyof paths
> = M extends HttpMethodsWithoutBody
  ? FetchJsonOpenapiMethodWithoutBodyArguments<TPath>
  : FetchJsonOpenapiMethodWithBodyArguments<M, TPath>

const isArgumentsHasBody = <M extends HttpMethod, TPath extends keyof paths>(
  method: M,
  args: FetchJsonOpenapiMethodWithBodyArguments<M, TPath> | FetchJsonOpenapiMethodWithoutBodyArguments<TPath>
): args is FetchJsonOpenapiMethodWithBodyArguments<M, TPath> => {
  return isHttpMethodHasBody(method)
}

export type FetchJsonOpenapiMethodWithBody = <
  M extends HttpMethod,
  TPath extends keyof paths,
  TResult extends object = any
>(
  // input: FetchJsonOpenapiMethodWithBodyArguments<M, TPath>[0],
  // payload?: FetchJsonOpenapiMethodWithBodyArguments<M, TPath>[1],
  input: TPath,
  payload?: ApiEndpointRequest<M, TPath>,
  init?: FetchJsonOpenapiMethodWithBodyArguments<M, TPath>[2]
) => Promise<FetchJsonMethodResult<TResult>>

export type FetchJsonOpenapiMethodWithoutBody = <TPath extends keyof paths, TResult extends object = any>(
  input: FetchJsonOpenapiMethodWithoutBodyArguments<TPath>[0],
  init?: FetchJsonOpenapiMethodWithoutBodyArguments<TPath>[1]
) => Promise<FetchJsonMethodResult<TResult>>

export type FetchJsonOpenapiMethod<M extends HttpMethod> = M extends HttpMethodsWithoutBody
  ? FetchJsonOpenapiMethodWithoutBody
  : FetchJsonOpenapiMethodWithBody

const createFetchJsonOpenApiMethod = <M extends HttpMethod>(httpMethod: M) => {
  if (isHttpMethodHasBody(httpMethod)) {
    return async <TPath extends keyof paths>(
      input: FetchJsonOpenapiMethodWithBodyArguments<M, TPath>[0],
      payload?: FetchJsonOpenapiMethodWithBodyArguments<M, TPath>[1],
      init?: FetchJsonOpenapiMethodWithBodyArguments<M, TPath>[2]
    ) => {
      const { data } = await fetchJson[httpMethod].call(null, input, payload, init)
      return data as Promise<ApiEndpointResponseSuccess<M, TPath>>
    }
  } else {
    return async <TPath extends keyof paths>(
      input: FetchJsonOpenapiMethodWithoutBodyArguments<TPath>[0],
      init?: FetchJsonOpenapiMethodWithoutBodyArguments<TPath>[1]
    ) => {
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

const yyy = fetchJsonOpenApi.post('/auth/signIn', { username: 's', password: 'd' }, {}).then(data => data.debugSessionId) // TODO type error here

const post = <TPath extends keyof paths>(...args: FetchJsonOpenapiMethodArguments<'post', TPath>) => {
  // if (isArgumentsHasBody('post', args)) {
  return fetchJson.post(...args)
  // }
}

post('/auth/signIn', { username: 's', password: 'f' }, {})

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

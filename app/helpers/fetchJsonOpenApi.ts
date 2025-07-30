import type { paths } from 'api'
import { fetchJson, isMethodHasBody } from './fetchJson'
import { HTTP_METHODS, type HttpMethod } from './httpMethods'
import type { ApiEndpointRequest, ApiEndpointResponseSuccess, RoutesWithMethod } from './openApiTypes'

type T<Paths extends Record<string, any>, M extends string> = M extends keyof Paths ? M : never

const createFetchJsonOpenApiMethod = <Paths extends Record<string, any>, M extends HttpMethod>(httpMethod: M) => {
  const fetchJsonMethod = fetchJson[httpMethod]
  if (isMethodHasBody(httpMethod, fetchJsonMethod)) {
    return async <TPath extends RoutesWithMethod<Paths, M>>(
      input: TPath,
      payload?: ApiEndpointRequest<Paths, M, TPath>,
      init?: RequestInit
    ) => {
      const { data } = await fetchJsonMethod(input as string, payload, init)
      return data as Promise<ApiEndpointResponseSuccess<Paths, M, TPath>>
    }
  } else {
    return async <TPath extends RoutesWithMethod<Paths, M>>(input: TPath, init?: RequestInit) => {
      const { data } = await fetchJsonMethod(input, init)
      return data as Promise<ApiEndpointResponseSuccess<Paths, M, TPath>>
    }
  }
}

type FetchJsonOpenApi<Paths extends Record<string, any>> = {
  // [httpMethod in HttpMethod]: FetchJsonOpenapiMethod<httpMethod>
  [httpMethod in HttpMethod]: ReturnType<typeof createFetchJsonOpenApiMethod<Paths, httpMethod>>
}

export const createFetchJsonOpenApi = <Paths extends Record<string, any>>() =>
  HTTP_METHODS.reduce(
    (acc, httpMethod) => ({
      ...acc,
      [httpMethod]: createFetchJsonOpenApiMethod(httpMethod),
    }),
    {} as FetchJsonOpenApi<Paths>
  )

// const xxx = fetchJsonOpenApi
//   .post('/auth/signIn', { username: 's', password: 'd' }, {})
//   .then((data) => data.debugSessionId)

// const yyy = fetchJsonOpenApi
//   // @ts-expect-error
//   .post('/auth/signIn', { userame: 's', password: 'd' }, {})
//   // @ts-expect-error
//   .then((data) => data.debugSesionId)

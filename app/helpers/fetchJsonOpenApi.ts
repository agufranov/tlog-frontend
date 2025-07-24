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

// const xxx = fetchJsonOpenApi
//   .post('/auth/signIn', { username: 's', password: 'd' }, {})
//   .then((data) => data.debugSessionId)

// const yyy = fetchJsonOpenApi
//   // @ts-expect-error
//   .post('/auth/signIn', { userame: 's', password: 'd' }, {})
//   // @ts-expect-error
//   .then((data) => data.debugSesionId)

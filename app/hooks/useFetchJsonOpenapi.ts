import { HTTP_METHODS, isHttpMethodHasBody, type HttpMethod } from '~/helpers/httpMethods'
import type { ApiEndpointRequest, ApiEndpointResponseSuccess, RoutesWithMethod } from '~/helpers/openApiTypes'
import {
  useFetchJson,
  type UseFetchJsonMethodWithPayloadResult,
  type UseFetchJsonMethodWithoutPayloadResult,
} from './useFetchJson'

const createUseFetchJsonOpenapi = <M extends HttpMethod>(httpMethod: M, apiPrefix: string) => {
  return <Paths extends Record<string, any>, TPath extends RoutesWithMethod<Paths, M>>(
    input: TPath,
    init?: RequestInit
  ) => {
    if (isHttpMethodHasBody(httpMethod)) {
      return useFetchJson[httpMethod](`${apiPrefix}${input}`, init) as UseFetchJsonMethodWithPayloadResult<
        ApiEndpointRequest<Paths, M, TPath>,
        ApiEndpointResponseSuccess<Paths, M, TPath>
      >
    } else {
      return useFetchJson[httpMethod](`${apiPrefix}${input}`, init) as UseFetchJsonMethodWithoutPayloadResult<
        ApiEndpointResponseSuccess<Paths, M, TPath>
      >
    }
  }
}

type UseFetchJsonOpenApi = {
  [httpMethod in HttpMethod]: ReturnType<typeof createUseFetchJsonOpenapi<httpMethod>>
}

export const useFetchJsonOpenApi = (apiPrefix: string = '') =>
  HTTP_METHODS.reduce(
    (acc, httpMethod) => ({
      ...acc,
      [httpMethod]: createUseFetchJsonOpenapi(httpMethod, apiPrefix),
    }),
    {} as UseFetchJsonOpenApi
  )

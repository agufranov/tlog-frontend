import type { paths } from 'api'
import { createFetchJson, type FetchResult } from './fetchJson'
import { type HttpMethod, type HttpMethodsWithoutBody } from './httpMethods'
import type { ApiEndpointRequest, ApiEndpointResponseSuccess, RoutesWithMethod } from './openApiTypes'

type FetchJsonOpenApiMethodWithBody<Paths extends Record<string, any>, M extends HttpMethod> = <
  TPath extends RoutesWithMethod<Paths, M>
>(
  input: TPath,
  payload: ApiEndpointRequest<Paths, M, TPath>,
  init?: RequestInit
) => Promise<FetchResult<ApiEndpointResponseSuccess<Paths, M, TPath>>>

type FetchJsonOpenApiMethodWithoutBody<Paths extends Record<string, any>, M extends HttpMethod> = <
  TPath extends RoutesWithMethod<Paths, M>
>(
  input: TPath,
  init?: RequestInit
) => Promise<FetchResult<ApiEndpointResponseSuccess<Paths, M, TPath>>>

export type FetchJsonOpenApi<Paths extends Record<string, any>> = {
  [httpMethod in HttpMethod]: httpMethod extends HttpMethodsWithoutBody
    ? FetchJsonOpenApiMethodWithoutBody<Paths, httpMethod>
    : FetchJsonOpenApiMethodWithBody<Paths, httpMethod>
}

export const fetchJsonOpenApi = createFetchJson({ basePrefix: '/api' }) as FetchJsonOpenApi<paths>

// const xxx = fetchJsonOpenApi
//   .post('/auth/signIn', { username: 's', password: 'd' }, {})
//   .then(({ data }) => data.debugSessionId)

// const yyy = fetchJsonOpenApi
//   // @ts-expect-error
//   .post('/auth/signIn', { userame: 's', password: 'd' }, {})
//   // @ts-expect-error
//   .then(({ data }) => data.debugSesionId)

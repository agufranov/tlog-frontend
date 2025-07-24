import type { paths } from 'api'
import type { HttpMethod } from './httpMethods'

type ApiRoute<T extends keyof paths> = paths[T]

// TODO rename
type X<O, K> = K extends keyof O ? O[K] : never

type ApiEndpoint<M extends HttpMethod, T extends keyof paths> = X<ApiRoute<T>, M>
// type ApiEndpoint<M extends HttpMethod, T extends keyof paths> = M extends keyof ApiRouteName<T> ? ApiRouteName<T>[M] : never

export type ApiEndpointRequest<M extends HttpMethod, T extends keyof paths> = 'requestBody' extends keyof ApiEndpoint<
  M,
  T
>
  ? 'content' extends keyof ApiEndpoint<M, T>['requestBody']
    ? // ? X<ApiEndpoint<M, T>['requestBody']['content'], 'application/json'>
      'application/json' extends keyof ApiEndpoint<M, T>['requestBody']['content']
      ? ApiEndpoint<M, T>['requestBody']['content']['application/json'] & {}
      : never
    : never
  : never

type ApiEndpointResponses<M extends HttpMethod, T extends keyof paths> = X<ApiEndpoint<M, T>, 'responses'>

// type ApiEndpointResponses<M extends HttpMethod, T extends keyof paths> = 'responses' extends keyof ApiEndpoint<M, T>
//   ? ApiEndpoint<M, T>['responses']
//   : never

// ODO handle errors too
export type ApiEndpointResponseSuccess<
  M extends HttpMethod,
  T extends keyof paths
> = 200 extends keyof ApiEndpointResponses<M, T>
  ? 'content' extends keyof ApiEndpointResponses<M, T>[200]
    ? 'application/json' extends keyof ApiEndpointResponses<M, T>[200]['content']
      ? ApiEndpointResponses<M, T>[200]['content']['application/json'] & {}
      : never
    : never
  : never

export type ApiRouteHasMethod<M extends HttpMethod, TPath extends keyof paths> = M extends keyof ApiRoute<TPath>
  ? ApiRoute<TPath>[M]
  : never

export type RoutesWithMethod<M extends HttpMethod> = {
  [P in keyof paths]: M extends keyof paths[P] ? (paths[P][M] extends {} ? P : never) : never
}[keyof paths]

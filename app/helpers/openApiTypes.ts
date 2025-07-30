import type { HttpMethod } from './httpMethods'

type ApiRoute<Paths extends Record<string, any>, T extends keyof Paths> = Paths[T]

// TODO rename
type X<O, K> = K extends keyof O ? O[K] : never

type ApiEndpoint<Paths extends Record<string, any>, M extends HttpMethod, T extends keyof Paths> = X<
  ApiRoute<Paths, T>,
  M
>
// type ApiEndpoint<M extends HttpMethod, T extends keyof paths> = M extends keyof ApiRouteName<T> ? ApiRouteName<T>[M] : never

export type ApiEndpointRequest<
  Paths extends Record<string, any>,
  M extends HttpMethod,
  T extends keyof Paths
> = 'requestBody' extends keyof ApiEndpoint<Paths, M, T>
  ? 'content' extends keyof ApiEndpoint<Paths, M, T>['requestBody']
    ? // ? X<ApiEndpoint<M, T>['requestBody']['content'], 'application/json'>
      'application/json' extends keyof ApiEndpoint<Paths, M, T>['requestBody']['content']
      ? ApiEndpoint<Paths, M, T>['requestBody']['content']['application/json'] & {}
      : never
    : never
  : never

type ApiEndpointResponses<Paths extends Record<string, any>, M extends HttpMethod, T extends keyof Paths> = X<
  ApiEndpoint<Paths, M, T>,
  'responses'
>

// type ApiEndpointResponses<M extends HttpMethod, T extends keyof paths> = 'responses' extends keyof ApiEndpoint<M, T>
//   ? ApiEndpoint<M, T>['responses']
//   : never

// ODO handle errors too
export type ApiEndpointResponseSuccess<
  Paths extends Record<string, any>,
  M extends HttpMethod,
  T extends keyof Paths
> = 200 extends keyof ApiEndpointResponses<Paths, M, T>
  ? 'content' extends keyof ApiEndpointResponses<Paths, M, T>[200]
    ? 'application/json' extends keyof ApiEndpointResponses<Paths, M, T>[200]['content']
      ? ApiEndpointResponses<Paths, M, T>[200]['content']['application/json'] & {}
      : never
    : never
  : never

export type ApiRouteHasMethod<
  Paths extends Record<string, any>,
  M extends HttpMethod,
  TPath extends keyof Paths
> = M extends keyof ApiRoute<Paths, TPath> ? ApiRoute<Paths, TPath>[M] : never

export type RoutesWithMethod<Paths extends Record<string, any>, M extends HttpMethod> = {
  [P in keyof Paths]: P extends string
    ? M extends keyof Paths[P]
      ? Paths[P][M] extends {}
        ? P
        : never
      : never
    : never
}[keyof Paths]

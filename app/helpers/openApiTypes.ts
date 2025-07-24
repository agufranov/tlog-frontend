import type { paths } from 'api'
import type { HttpMethod } from './httpMethods'

type ApiRoute<T extends keyof paths> = paths[T]

type ApiEndpoint<M extends HttpMethod, T extends keyof paths> = M extends keyof ApiRoute<T> ? ApiRoute<T>[M] : never

export type ApiEndpointRequest<M extends HttpMethod, T extends keyof paths> = 'requestBody' extends keyof ApiEndpoint<M, T>
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
export type ApiEndpointResponseSuccess<M extends HttpMethod, T extends keyof paths> = 200 extends keyof ApiEndpointResponses<
  M,
  T
>
  ? 'content' extends keyof ApiEndpointResponses<M, T>[200]
    ? 'application/json' extends keyof ApiEndpointResponses<M, T>[200]['content']
      ? ApiEndpointResponses<M, T>[200]['content']['application/json'] & {}
      : never
    : never
  : never

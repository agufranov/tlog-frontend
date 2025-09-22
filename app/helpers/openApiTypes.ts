import type { HttpMethod } from './httpMethods'

type ApiRoute<Paths extends Record<string, any>, T extends keyof Paths> = Paths[T]

type GetTypeByPath<T, Path extends string> = string extends Path
  ? never // Защита от неправильного использования string
  : Path extends keyof T
  ? T[Path] // Базовый случай: Path - это непосредственный ключ T
  : Path extends `${infer Key}.${infer Rest}` // Рекурсивный случай: Path содержит точку
  ? Key extends keyof T
    ? GetTypeByPath<T[Key], Rest> // Рекурсивный вызов GetType с вложенным типом и остатком пути
    : never // Key не является ключом T
  : never // Path не является путем в T

type ApiEndpoint<Paths extends Record<string, any>, M extends HttpMethod, T extends keyof Paths> = GetTypeByPath<
  ApiRoute<Paths, T>,
  M
>

export type ApiEndpointRequest<
  Paths extends Record<string, any>,
  M extends HttpMethod,
  T extends keyof Paths & string
> = GetTypeByPath<Paths, `${T}.${M}.requestBody.content.application/json`> & {}

type ApiEndpointResponses<
  Paths extends Record<string, any>,
  M extends HttpMethod,
  T extends keyof Paths
> = GetTypeByPath<ApiEndpoint<Paths, M, T>, 'responses'>

// TODO handle errors too
export type ApiEndpointResponseSuccess<
  Paths extends Record<string, any>,
  M extends HttpMethod,
  T extends keyof Paths
> = 200 extends keyof ApiEndpointResponses<Paths, M, T>
  ? GetTypeByPath<ApiEndpointResponses<Paths, M, T>[200], 'content.application/json'> & {}
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

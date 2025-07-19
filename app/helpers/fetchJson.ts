import { type HttpMethod, HTTP_METHODS } from './httpMethods'

type ParametersWithOverloading<T extends (...args: any) => any> = T extends {
  (...args: infer A): any
  (...args: infer B): any
}
  ? A | B
  : never

export type FetchArguments = ParametersWithOverloading<typeof fetch>

type FetchInput = FetchArguments[0]
type FetchInit = FetchArguments[1]

export type FetchJsonMethodArguments<TPayload extends object> = [
  FetchInput,
  TPayload?,
  FetchInit?
]

type FetchJsonMethodResult<TResult extends object> = { response: Response; data: TResult }

export type FetchJson = {
  [httpMethod in HttpMethod]: <TPayload extends object = any, TResult extends object = any>(
    ...args: FetchJsonMethodArguments<TPayload>
  ) => Promise<FetchJsonMethodResult<TResult>>
}

const METHODS_WITHOUT_BODY: HttpMethod[] = ['head', 'get']

const createFetchOptions = <TPayload extends object>(
  method: HttpMethod,
  payload?: TPayload
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  if (!METHODS_WITHOUT_BODY.includes(method)) {
    options.body = JSON.stringify(payload ?? '')
  }

  return options
}

const createFetchJsonMethod =
  <TPayload extends object>(httpMethod: HttpMethod) =>
  async (...[input, payload, init]: FetchJsonMethodArguments<TPayload>) => {
    const response = await fetch(input, {
      ...createFetchOptions(httpMethod, payload),
      ...init,
    })

    try {
      const data: TPayload = await response.json()
      return { response, data }
    } catch (error) {
      return { response, data: {} }
    }
  }

export const fetchJson: FetchJson = HTTP_METHODS.reduce(
  (acc, httpMethod) => ({
    ...acc,
    [httpMethod]: createFetchJsonMethod(httpMethod),
  }),
  {} as FetchJson
)

import { type HttpMethod, HTTP_METHODS } from './httpMethods'

type ParametersWithOverloading<T extends (...args: any) => any> = T extends {
  (...args: infer A): any
  (...args: infer B): any
}
  ? A | B
  : never

type FetchArguments = ParametersWithOverloading<typeof fetch>
type FetchInput = FetchArguments[0]
type FetchInit = FetchArguments[1]
type FetchJsonMethodArguments<T extends object> = [FetchInput, T?, FetchInit?]

type FetchJsonMethodResult<T extends object> = { response: Response; data: T }

export type FetchJson = {
  [httpMethod in HttpMethod]: <T extends object>(
    ...args: FetchJsonMethodArguments<T>
  ) => Promise<FetchJsonMethodResult<T>>
}

const createFetchOptions = <T extends object>(
  method: HttpMethod,
  data?: T
): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(data),
})

const createFetchJsonMethod =
  <T extends object>(httpMethod: HttpMethod) =>
  async (...[input, payload, init]: FetchJsonMethodArguments<T>) => {
    const response = await fetch(input, {
      ...createFetchOptions(httpMethod, payload),
      ...init,
    })

    try {
      const data: T = await response.json()
      return { response, data }
    } catch (error) {
      throw error
    }
  }

export const fetchJson: FetchJson = HTTP_METHODS.reduce(
  (acc, httpMethod) => ({
    ...acc,
    [httpMethod]: createFetchJsonMethod(httpMethod),
  }),
  {} as FetchJson
)

type ParametersWithOverloading<T extends (...args: any) => any> = T extends {
  (...args: infer A): any
  (...args: infer B): any
}
  ? A | B
  : never

type FetchArguments = ParametersWithOverloading<typeof fetch>
type FetchInput = FetchArguments[0]
type FetchInit = FetchArguments[1]
type FetchJsonMethodArguments = [FetchInput, object?, FetchInit?]

const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'patch',
  'head',
  'options',
  'trace',
  'connect',
] as const

type HttpMethod = (typeof HTTP_METHODS)[number]

type FetchJsonMethodResult = { response: Response; data: object }
type FetchJsonMethod = (
  ...args: FetchJsonMethodArguments
) => Promise<FetchJsonMethodResult>

type FetchJson = {
  [httpMethod in HttpMethod]: FetchJsonMethod
}

const createFetchOptions = (
  method: HttpMethod,
  data?: object
): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(data),
})

const createFetchJsonMethod =
  (httpMethod: HttpMethod) =>
  async (...[input, payload, init]: FetchJsonMethodArguments) => {
    const response = await fetch(input, {
      ...createFetchOptions(httpMethod, payload),
      ...init,
    })

    let data: object = {}

    try {
      data = await response.json()
    } catch (error) {}

    return { response, data }
  }

export const fetchJson: FetchJson = HTTP_METHODS.reduce(
  (acc, httpMethod) => ({
    ...acc,
    [httpMethod]: createFetchJsonMethod(httpMethod),
  }),
  {} as FetchJson
)

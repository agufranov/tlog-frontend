import { HTTP_METHODS, isHttpMethodHasBody, type HttpMethod, type HttpMethodsWithoutBody } from './httpMethods'
import { sleep } from './sleep'

type SecondArgument<T extends (...args: any) => any> = T extends (arg1: any, arg2: infer U) => any ? U : never

export type FetchArguments = [
  // string | URL, // we exclude Request type, because it contains too much information (including HTTP method), which will be redefined
  string, // TODO simplified to string, but maybe need to parse URL
  SecondArgument<typeof fetch>?
]

const createFetchOptions = <TPayload extends object>(
  method: HttpMethod,
  payload?: typeof method extends HttpMethodsWithoutBody ? undefined : TPayload
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    // TODO add customization
    // credentials: 'include',
  }

  if (isHttpMethodHasBody(method)) {
    options.body = JSON.stringify(payload ?? {})
  }

  return options
}

const performFetch = async <TPayload extends object, TResult extends object>(
  httpMethod: HttpMethod,
  input: string,
  payload?: TPayload,
  init?: RequestInit
) => {
  const response = await fetch(input, {
    ...createFetchOptions(httpMethod, payload),
    ...init,
  })

  try {
    // TODO debug
    await sleep(1000)
    const data: TResult = await response.json()

    return { response, data }
  } catch (error) {
    if (error instanceof SyntaxError && error.name === 'SyntaxError') {
      // TODO handle json parsing error or throw error?
      // return { response, data: undefined }
      throw error
    }
    throw error
  }
}

const createFetchJsonMethodWithBody = (httpMethod: HttpMethod) => {
  return async <TPayload extends object, TResult extends object>(
    input: string,
    payload?: TPayload,
    init?: RequestInit
  ) => performFetch<TPayload, TResult>(httpMethod, input, payload, init)
}

export type FetchJsonMethodWithBody = ReturnType<typeof createFetchJsonMethodWithBody>

const createFetchJsonMethodWithoutBody = (httpMethod: HttpMethod) => {
  return async <TResult extends object>(input: string, init?: RequestInit) =>
    performFetch<never, TResult>(httpMethod, input, undefined, init)
}

export type FetchJsonMethodWithoutBody = ReturnType<typeof createFetchJsonMethodWithoutBody>

export type FetchJson = {
  [httpMethod in HttpMethod]: ReturnType<
    httpMethod extends HttpMethodsWithoutBody
      ? typeof createFetchJsonMethodWithoutBody
      : typeof createFetchJsonMethodWithBody
  >
}

export const fetchJson: FetchJson = HTTP_METHODS.reduce(
  (acc, httpMethod) => ({
    ...acc,
    [httpMethod]: isHttpMethodHasBody(httpMethod)
      ? createFetchJsonMethodWithBody(httpMethod)
      : createFetchJsonMethodWithoutBody(httpMethod),
  }),
  {} as FetchJson
)

// fetchJson.post<{ a: number }, { b: string }>('/api/test/a', { a: 2 }, {}).then((x) => x.data.b)

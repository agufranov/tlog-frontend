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
  }

  if (isHttpMethodHasBody(method)) {
    options.body = JSON.stringify(payload ?? {})
  }

  return options
}

export type FetchResult<T extends object> = {
  response: Response
  data: T
}

const performFetch = async <TPayload extends object, TResult extends object>(
  httpMethod: HttpMethod,
  options: CreateFetchJsonOptions,
  input: string,
  payload?: TPayload,
  init?: RequestInit
): Promise<FetchResult<TResult>> => {
  const response = await fetch(`${options.basePrefix ?? ''}${input}`, {
    ...createFetchOptions(httpMethod, payload),
    ...options.requestDefaults,
    ...init,
  })

  try {
    // TODO debug
    await sleep(800)
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

export type FetchJsonMethodWithBody = <TPayload extends object, TResult extends object>(
  input: string,
  payload?: TPayload,
  init?: RequestInit
) => Promise<FetchResult<TResult>>

const createFetchJsonMethodWithBody = (
  httpMethod: HttpMethod,
  options: CreateFetchJsonOptions
): FetchJsonMethodWithBody => {
  return async <TPayload extends object, TResult extends object>(
    input: string,
    payload?: TPayload,
    init?: RequestInit
  ) => performFetch<TPayload, TResult>(httpMethod, options, input, payload, init)
}

export type FetchJsonMethodWithoutBody = <TResult extends object>(
  input: string,
  init?: RequestInit
) => Promise<FetchResult<TResult>>

const createFetchJsonMethodWithoutBody = (
  httpMethod: HttpMethod,
  options: CreateFetchJsonOptions
): FetchJsonMethodWithoutBody => {
  return async <TResult extends object>(input: string, init?: RequestInit) =>
    performFetch<never, TResult>(httpMethod, options, input, undefined, init)
}

export const isMethodHasBody = (
  httpMethod: HttpMethod,
  method: FetchJsonMethodWithBody | FetchJsonMethodWithoutBody
): method is FetchJsonMethodWithBody => isHttpMethodHasBody(httpMethod)

export type CreateFetchJsonOptions = {
  basePrefix?: string
  requestDefaults?: RequestInit
}

export type FetchJson = {
  [httpMethod in HttpMethod]: httpMethod extends HttpMethodsWithoutBody
    ? FetchJsonMethodWithoutBody
    : FetchJsonMethodWithBody
} & { createWithDefaults: (options: CreateFetchJsonOptions) => FetchJson }

const createFetchJson = (options: CreateFetchJsonOptions): FetchJson => {
  return {
    ...HTTP_METHODS.reduce(
      (acc, httpMethod) => ({
        ...acc,
        [httpMethod]: isHttpMethodHasBody(httpMethod)
          ? createFetchJsonMethodWithBody(httpMethod, options)
          : createFetchJsonMethodWithoutBody(httpMethod, options),
      }),
      {} as FetchJson
    ),
    createWithDefaults: createFetchJson,
  }
}

export const fetchJson: FetchJson = createFetchJson({})

// fetchJson.post<{ a: number }, { b: string }>('/api/test/a', { a: 2 }, {}).then((x) => x.data.b)

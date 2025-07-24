import { HTTP_METHODS, isHttpMethodHasBody, type HttpMethod, type HttpMethodsWithoutBody } from './httpMethods'
import { sleep } from './sleep'

type SecondArgument<T extends (...args: any) => any> = T extends (arg1: any, arg2: infer U) => any ? U : never

export type FetchArguments = [
  // string | URL, // we exclude Request type, because it contains too much information (including HTTP method), which will be redefined
  string, // TODO simplified to string, but maybe need to parse URL
  SecondArgument<typeof fetch>
]

export type FetchInput = FetchArguments[0]
export type FetchInit = FetchArguments[1]

export type FetchJsonMethodWithBodyArguments<TPayload extends object> = [FetchInput, TPayload?, FetchInit?]
export type FetchJsonMethodWithoutBodyArguments = [FetchInput, FetchInit?]
export type FetchJsonMethodArguments<M extends HttpMethod, TPayload extends object> = M extends HttpMethodsWithoutBody
  ? FetchJsonMethodWithoutBodyArguments
  : FetchJsonMethodWithBodyArguments<TPayload>

export type FetchJsonMethodResult<TResult extends object> = { response: Response; data: TResult | undefined }

export type FetchJsonMethodWithBody = <TPayload extends object = any, TResult extends object = any>(
  input: FetchJsonMethodWithBodyArguments<TPayload>[0],
  payload?: FetchJsonMethodWithBodyArguments<TPayload>[1],
  init?: FetchJsonMethodWithBodyArguments<TPayload>[2]
) => Promise<FetchJsonMethodResult<TResult>>

export type FetchJsonMethodWithoutBody = <TResult extends object = any>(
  input: FetchJsonMethodWithoutBodyArguments[0],
  init?: FetchJsonMethodWithoutBodyArguments[1]
) => Promise<FetchJsonMethodResult<TResult>>

export type FetchJsonMethod<M extends HttpMethod> = M extends HttpMethodsWithoutBody
  ? FetchJsonMethodWithoutBody
  : FetchJsonMethodWithBody

export type FetchJson = {
  [httpMethod in HttpMethod]: FetchJsonMethod<httpMethod>
}
export const isMethodHasBody = <M extends HttpMethod>(
  httpMethod: M,
  method: FetchJsonMethodWithBody | FetchJsonMethodWithoutBody
): method is FetchJsonMethodWithBody => {
  return isHttpMethodHasBody(httpMethod)
}

const isArgumentsHasBody = <M extends HttpMethod, TPayload extends object>(
  method: M,
  // args: FetchJsonMethodWithBodyArguments<TPayload> | FetchJsonMethodWithoutBodyArguments
  args: FetchJsonMethodWithBodyArguments<TPayload> | FetchJsonMethodWithoutBodyArguments
): args is FetchJsonMethodWithBodyArguments<TPayload> => {
  return isHttpMethodHasBody(method)
}

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

const createFetchJsonMethod = <TPayload extends object, TResult extends object>(httpMethod: HttpMethod) => {
  return async (
    ...args: FetchJsonMethodArguments<typeof httpMethod, TPayload>
  ): Promise<FetchJsonMethodResult<TResult>> => {
    const hasBody = isArgumentsHasBody(httpMethod, args)

    const [input, payload, init] = hasBody ? args : [args[0], undefined, args[1]]

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
        return { response, data: undefined }
      }
      throw error
    }
  }
}

export const fetchJson: FetchJson = {
  ...HTTP_METHODS.reduce(
    (acc, httpMethod) => ({
      ...acc,
      [httpMethod]: createFetchJsonMethod(httpMethod),
    }),
    {} as FetchJson
  ),
}

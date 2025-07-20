import { type HttpMethod, HTTP_METHODS } from './httpMethods'
import { sleep } from './sleep'

type ParametersWithOverloading<T extends (...args: any) => any> = T extends {
  (...args: infer A): any
  (...args: infer B): any
}
  ? A | B
  : never

export type FetchArguments = ParametersWithOverloading<typeof fetch>

type FetchInput = FetchArguments[0]
type FetchInit = FetchArguments[1]

export type FetchJsonMethodWithBodyArguments<TPayload extends object> = [FetchInput, TPayload?, FetchInit?]
export type FetchJsonMethodWithoutBodyArguments = [FetchInput, FetchInit?]

type FetchJsonMethodResult<TResult extends object> = { response: Response; data: TResult | undefined }

const METHODS_WITHOUT_BODY = ['head', 'get'] as const satisfies HttpMethod[]
type MethodsWithoutBody = (typeof METHODS_WITHOUT_BODY)[number]

// type FetchJsonMethodWithBody<TPayload extends object = any, TResult extends object = any> = (
//   input: FetchJsonMethodWithBodyArguments<TPayload>[0],
//   payload?: FetchJsonMethodWithBodyArguments<TPayload>[1],
//   init?: FetchJsonMethodWithBodyArguments<TPayload>[2]
// ) => Promise<FetchJsonMethodResult<TResult>>

// type FetchJsonMethodWithoutBody<TResult extends object = any> = (
//   input: FetchJsonMethodWithoutBodyArguments[0],
//   init?: FetchJsonMethodWithoutBodyArguments[1]
// ) => Promise<FetchJsonMethodResult<TResult>>

export type FetchJson = {
  [httpMethod in HttpMethod]: httpMethod extends MethodsWithoutBody
    ? <TResult extends object = any>(
        input: FetchJsonMethodWithoutBodyArguments[0],
        init?: FetchJsonMethodWithoutBodyArguments[1]
      ) => Promise<FetchJsonMethodResult<TResult>>
    : <TPayload extends object = any, TResult extends object = any>(
        input: FetchJsonMethodWithBodyArguments<TPayload>[0],
        payload?: FetchJsonMethodWithBodyArguments<TPayload>[1],
        init?: FetchJsonMethodWithBodyArguments<TPayload>[2]
      ) => Promise<FetchJsonMethodResult<TResult>>
}

const createFetchOptions = <TPayload extends object>(
  method: HttpMethod,
  payload?: typeof method extends MethodsWithoutBody ? undefined : TPayload
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }

  if (!(METHODS_WITHOUT_BODY as HttpMethod[]).includes(method)) {
    options.body = JSON.stringify(payload ?? '')
  }

  return options
}

const createFetchJsonMethod = <TPayload extends object, TResult extends object>(httpMethod: HttpMethod) => {
  type Args = typeof httpMethod extends MethodsWithoutBody
    ? FetchJsonMethodWithoutBodyArguments
    : FetchJsonMethodWithBodyArguments<TPayload>

  return async (
    input: Args[0],
    payload: typeof httpMethod extends MethodsWithoutBody ? undefined : Args[1],
    init: Args[2]
  ): Promise<FetchJsonMethodResult<TResult>> => {
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
        // handle json parsing error
        // throw error
        return { response, data: undefined }
      }
      throw error
    }
  }
}

export const fetchJson: FetchJson = HTTP_METHODS.reduce(
  (acc, httpMethod) => ({
    ...acc,
    [httpMethod]: createFetchJsonMethod(httpMethod),
  }),
  {} as FetchJson
)

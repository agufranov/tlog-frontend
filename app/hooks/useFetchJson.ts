import { useCallback, useState } from 'react'
import {
  fetchJson,
  type FetchArguments,
  type FetchJsonMethodWithBody,
  type FetchJsonMethodWithoutBody,
} from '~/helpers/fetchJson'
import { HTTP_METHODS, isHttpMethodHasBody, type HttpMethod, type HttpMethodsWithoutBody } from '~/helpers/httpMethods'

interface UseFetchJsonMethodWithoutPayloadResult<TResult extends object> {
  value: TResult
  loading: boolean
  error: any
  isFetched: boolean
  fetch: () => Promise<TResult>
}

interface UseFetchJsonMethodWithPayloadResult<TPayload extends object, TResult extends object>
  extends UseFetchJsonMethodWithoutPayloadResult<TResult> {
  fetch: (payload?: TPayload) => Promise<TResult>
}

type UseFetchJson = {
  [httpMethod in HttpMethod]: ReturnType<typeof createUseFetchJson>
}

const isMethodHasBody = (
  httpMethod: HttpMethod,
  method: FetchJsonMethodWithBody | FetchJsonMethodWithoutBody
): method is FetchJsonMethodWithBody => {
  return isHttpMethodHasBody(httpMethod)
}

const createUseFetchJson = (httpMethod: HttpMethod) => {
  return <TPayload extends object, TResult extends object>(...args: FetchArguments) => {
    type UseFetchJsonMethodResult = typeof httpMethod extends HttpMethodsWithoutBody
      ? UseFetchJsonMethodWithoutPayloadResult<TResult>
      : UseFetchJsonMethodWithPayloadResult<TPayload, TResult>

    const [value, setValue] = useState<UseFetchJsonMethodResult['value']>()
    const [error, setError] = useState<UseFetchJsonMethodResult['error']>()
    const [loading, setLoading] = useState<UseFetchJsonMethodResult['loading']>(false)
    const [isFetched, setIsFetched] = useState<UseFetchJsonMethodResult['isFetched']>(false)

    const fetchData = useCallback(
      async (payload: TPayload) => {
        setError(undefined)
        setLoading(true)

        try {
          const fetchJsonMethod = fetchJson[httpMethod]

          const hasBody = isMethodHasBody(httpMethod, fetchJsonMethod)

          const fetchResult = await (hasBody
            ? fetchJsonMethod(args[0], payload, args[1])
            : fetchJsonMethod(args[0], args[1]))

          const data = fetchResult.data as TResult
          // response = fetchResult.response

          setValue(data)

          return data
        } catch (err) {
          setValue(undefined) // TODO спорно
          setError(err)
          throw err
        } finally {
          setLoading(false)
          setIsFetched(true)
        }
      },
      [setValue]
    )

    return {
      value,
      loading,
      error,
      isFetched,
      fetch: fetchData,
    }
  }
}

export const useFetchJson = HTTP_METHODS.reduce(
  (acc, httpMethod) => ({
    ...acc,
    [httpMethod]: createUseFetchJson(httpMethod),
  }),
  {} as UseFetchJson
)

// const sss = useFetchJson.post<{ s: string }, { a: number }>('/api/auth/profile')
// sss.fetch({ s: 's' }).then((res) => res.a)

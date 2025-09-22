import { useCallback, useState } from 'react'
import { fetchJson, isMethodHasBody, type FetchArguments, type FetchResult } from '~/helpers/fetchJson'
import { HTTP_METHODS, type HttpMethod, type HttpMethodsWithoutBody } from '~/helpers/httpMethods'

export interface UseFetchJsonMethodWithoutPayloadResult<TResult extends object> {
  data: TResult
  loading: boolean
  error: any
  isFetched: boolean
  fetch: () => Promise<TResult>
}

export interface UseFetchJsonMethodWithPayloadResult<TPayload extends object, TResult extends object>
  extends UseFetchJsonMethodWithoutPayloadResult<TResult> {
  fetch: (payload?: TPayload) => Promise<TResult>
}

type UseFetchJson = {
  [httpMethod in HttpMethod]: ReturnType<typeof createUseFetchJson>
}

const createUseFetchJson = (httpMethod: HttpMethod) => {
  return <TPayload extends object, TResult extends object>(...args: FetchArguments) => {
    type UseFetchJsonMethodResult = typeof httpMethod extends HttpMethodsWithoutBody
      ? UseFetchJsonMethodWithoutPayloadResult<TResult>
      : UseFetchJsonMethodWithPayloadResult<TPayload, TResult>

    const [data, setData] = useState<UseFetchJsonMethodResult['data']>()
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

          const { data } = fetchResult as FetchResult<TResult>
          // response = fetchResult.response

          if ((data as any).error) {
            setError((data as any).error)
            return
          }

          setData(data)

          return data
        } catch (err: any) {
          // setData(undefined) // TODO спорно
          setError(err.message)
          throw err
        } finally {
          setLoading(false)
          setIsFetched(true)
        }
      },
      [setData]
    )

    return {
      data,
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

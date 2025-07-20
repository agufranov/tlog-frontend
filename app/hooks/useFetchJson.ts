import { useCallback, useState } from 'react'
import { fetchJson, type FetchArguments, type FetchJsonMethodArguments } from '@/helpers/fetchJson'
import { type HttpMethod, HTTP_METHODS } from '@/helpers/httpMethods'

type UseFetchJsonMethodResult<TPayload extends object, TResult extends object> = {
  value: TResult
  loading: boolean
  error: any
  isFetched: boolean
  fetch: (payload?: TPayload) => Promise<TResult>
}

type UseFetchJson = {
  [httpMethod in HttpMethod]: <TPayload extends object, TResult extends object>(
    ...args: FetchJsonMethodArguments<TPayload>
  ) => UseFetchJsonMethodResult<TPayload, TResult>
}

async function main() {
  const result = useFetchJson.post('/api/auth/cookie')
}

export const useFetchJson = HTTP_METHODS.reduce((acc, httpMethod) => {
  return {
    ...acc,
    [httpMethod]: <TPayload extends object, TResult extends object>(...args: FetchArguments) => {
      const [value, setValue] = useState<UseFetchJsonMethodResult<TPayload, TResult>['value']>()
      const [error, setError] = useState<UseFetchJsonMethodResult<TPayload, TResult>['error']>()
      const [loading, setLoading] = useState<UseFetchJsonMethodResult<TPayload, TResult>['loading']>(false)
      const [isFetched, setIsFetched] = useState<UseFetchJsonMethodResult<TPayload, TResult>['isFetched']>(false)

      const fetchData = useCallback(
        async (payload: TPayload) => {
          setError(undefined)
          setLoading(true)
          try {
            const { data } = await fetchJson[httpMethod](args[0], payload, args[1])
            setValue(data)
            return data
          } catch (err) {
            // setValue(undefined) // TODO спорно
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
    },
  }
}, {} as UseFetchJson)

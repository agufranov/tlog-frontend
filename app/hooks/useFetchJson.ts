import { useCallback, useState } from 'react'
import {
  fetchJson,
  type FetchArguments,
  type FetchJsonMethodArguments,
} from '~/helpers/fetchJson'
import { type HttpMethod, HTTP_METHODS } from '~/helpers/httpMethods'

type UseFetchJsonMethodResult<
  TPayload extends object,
  TResult extends object
> = {
  value: TResult
  loading: boolean
  error: any
  fetch: (payload?: TPayload) => Promise<TResult>
}

type UseFetchJson = {
  [httpMethod in HttpMethod]: <TPayload extends object, TResult extends object>(
    ...args: FetchJsonMethodArguments<TPayload>
  ) => UseFetchJsonMethodResult<TPayload, TResult>
}

async function main() {
  const result = useFetchJson.post('/auth/cookie')
}

export const useFetchJson = HTTP_METHODS.reduce((acc, httpMethod) => {
  return {
    ...acc,
    [httpMethod]: <TPayload extends object, TResult extends object>(
      ...args: FetchArguments
    ) => {
      const [value, setValue] =
        useState<UseFetchJsonMethodResult<TPayload, TResult>['value']>()
      const [error, setError] =
        useState<UseFetchJsonMethodResult<TPayload, TResult>['error']>()
      const [loading, setLoading] =
        useState<UseFetchJsonMethodResult<TPayload, TResult>['loading']>(false)

      const fetchData = useCallback(
        async (payload: TPayload) => {
          setError(undefined)
          setLoading(true)
          try {
            const { data } = await fetchJson[httpMethod](
              args[0],
              payload,
              args[1]
            )
            setValue(data)
            return data
          } catch (err) {
            setError(err)
            throw err
          } finally {
            setLoading(false)
          }
        },
        [setValue]
      )

      return {
        value,
        loading,
        error,
        fetch: fetchData,
      }
    },
  }
}, {} as UseFetchJson)

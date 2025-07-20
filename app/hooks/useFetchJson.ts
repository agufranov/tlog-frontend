import { useCallback, useState } from 'react'
import {
  fetchJson,
  type FetchArguments,
  type FetchJsonMethodWithBody,
  type FetchJsonMethodWithBodyArguments,
  type FetchJsonMethodWithoutBody,
  type FetchJsonMethodWithoutBodyArguments,
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

interface UseFetchJsonMethodWithPayloadResult<TPayload extends object, TResult extends object>
  extends UseFetchJsonMethodWithoutPayloadResult<TResult> {
  fetch: (payload?: TPayload) => Promise<TResult>
}

type UseFetchJsonMethodWithBody = <TPayload extends object = any, TResult extends object = any>(
  input: FetchJsonMethodWithBodyArguments<TPayload>[0],
  payload?: FetchJsonMethodWithBodyArguments<TPayload>[1],
  init?: FetchJsonMethodWithBodyArguments<TPayload>[2]
) => UseFetchJsonMethodWithPayloadResult<TPayload, TResult>

type UseFetchJsonMethodWithoutBody = <TResult extends object = any>(
  input: FetchJsonMethodWithoutBodyArguments[0],
  init?: FetchJsonMethodWithoutBodyArguments[1]
) => UseFetchJsonMethodWithoutPayloadResult<TResult>

export type FetchJsonMethodArguments<M extends HttpMethod, TPayload extends object> = M extends HttpMethodsWithoutBody
  ? FetchJsonMethodWithoutBodyArguments
  : FetchJsonMethodWithBodyArguments<TPayload>

type UseFetchJson = {
  [httpMethod in HttpMethod]: httpMethod extends HttpMethodsWithoutBody
    ? UseFetchJsonMethodWithoutBody
    : UseFetchJsonMethodWithBody
}

export const useFetchJson = HTTP_METHODS.reduce((acc, httpMethod) => {
  return {
    ...acc,
    [httpMethod]: <TPayload extends object, TResult extends object>(...args: FetchArguments) => {
      type UseFetchJsonMethodResult = typeof httpMethod extends HttpMethodsWithoutBody
        ? UseFetchJsonMethodWithoutPayloadResult<TResult>
        : UseFetchJsonMethodWithPayloadResult<TPayload, TResult>

      const [value, setValue] = useState<UseFetchJsonMethodResult['value']>()
      const [error, setError] = useState<UseFetchJsonMethodResult['error']>()
      const [loading, setLoading] = useState<UseFetchJsonMethodResult['loading']>(false)
      const [isFetched, setIsFetched] = useState<UseFetchJsonMethodResult['isFetched']>(false)

      const isMethodHasBody = <M extends HttpMethod>(
        httpMethod: M,
        method: FetchJsonMethodWithBody | FetchJsonMethodWithoutBody
      ): method is FetchJsonMethodWithBody => {
        return isHttpMethodHasBody(httpMethod)
      }

      const fetchData = useCallback(
        async (payload: TPayload) => {
          setError(undefined)
          setLoading(true)
          let data: TResult
          let response: Response
          try {
            const fetchJsonMethod = fetchJson[httpMethod]

            const hasBody = isMethodHasBody(httpMethod, fetchJsonMethod)

            const fetchResult = await (hasBody
              ? (fetchJsonMethod as FetchJsonMethodWithBody)(args[0], payload, args[1])
              : (fetchJsonMethod as FetchJsonMethodWithoutBody)(args[0], args[1]))

            data = fetchResult.data
            response = fetchResult.response

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
    },
  }
}, {} as UseFetchJson)

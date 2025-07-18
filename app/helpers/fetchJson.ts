type ParametersWithOverloading<T extends (...args: any) => any> = T extends {
  (...args: infer A): any
  (...args: infer B): any
}
  ? A | B
  : never

type FetchArgs = ParametersWithOverloading<typeof fetch>
type FetchInput = FetchArgs[0]
type FetchInit = FetchArgs[1]
type FetchJsonMethodArgs = [FetchInput, object, FetchInit?]

enum HttpMethods {
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  DELETE = 'delete',
  PATCH = 'patch',
  HEAD = 'head',
  OPTIONS = 'options',
  TRACE = 'trace',
  CONNECT = 'connect',
}

const httpMethods = Object.values(HttpMethods)

type HttpMethodsUnion = `${HttpMethods}`

type FetchJsonMethodResult = { response: Response; data: object }
type FetchJsonMethod = (
  ...args: FetchJsonMethodArgs
) => Promise<FetchJsonMethodResult>

type FetchJsonType = {
  [HttpMethod in HttpMethodsUnion]: FetchJsonMethod
}

const fetchJson = {} as FetchJsonType

const getFetchJsonParams = (method: HttpMethodsUnion, data: object) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})

for (let httpMethod of httpMethods) {
  fetchJson[httpMethod as HttpMethodsUnion] = (input, data, init) =>
    fetch
      .call(null, input, {
        ...getFetchJsonParams(httpMethod, data),
        ...init,
      })
      .then(async (response) => ({
        response,
        data: await response.json(),
      }))
}

export { fetchJson }

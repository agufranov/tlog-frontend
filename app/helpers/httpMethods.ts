export const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace', 'connect'] as const

export type HttpMethod = (typeof HTTP_METHODS)[number]

export const HTTP_METHODS_WITHOUT_BODY = ['head', 'get'] as const satisfies HttpMethod[]

export type HttpMethodsWithoutBody = (typeof HTTP_METHODS_WITHOUT_BODY)[number]
export type HttpMethodsWithBody = Exclude<HttpMethod, HttpMethodsWithoutBody>

export const isHttpMethodHasBody = (method: HttpMethod) => !(HTTP_METHODS_WITHOUT_BODY as HttpMethod[]).includes(method)

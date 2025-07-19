export const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'patch',
  'head',
  'options',
  'trace',
  'connect',
] as const

export type HttpMethod = (typeof HTTP_METHODS)[number]

export type AsyncReturnType<F> = F extends (...args: any) => Promise<infer U> ? U : never

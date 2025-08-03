import { t, type XTyped } from './test'

const a = t.string()
const b = t.number()
const c = t.object({
  x: t.number(),
  y: t.string(),
  z: t.object({
    z1: t.number(),
    z2: t.string(),
  }),
})

type T1 = XTyped.Infer<typeof a>
type T2 = XTyped.Infer<typeof b>
type T3 = XTyped.Infer<typeof c>

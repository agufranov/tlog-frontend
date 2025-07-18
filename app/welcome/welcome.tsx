import { useEffect, type FormEvent } from 'react'
import { fetchJson } from '~/helpers/fetchJson'

const api = (path: string) => `http://localhost:3000${path}`

export function Welcome() {
  useEffect(() => {
    console.log(fetchJson)
  })
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    console.log(await fetchJson.post(api('/users'), data))
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <form onSubmit={handleSubmit}>
        <input name="username" />
        <input name="password" />
        <button type="submit">Click</button>
      </form>
    </main>
  )
}

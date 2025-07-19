import { useEffect, type FormEvent } from 'react'
import { fetchJson } from '~/helpers/fetchJson'

const api = (path: string) => `http://localhost:3000${path}`

export function Welcome() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    const response = await fetchJson.post(api('/auth/signIn'), data)
    console.log(response.data)
  }

  const handleCookieClick = async () => {
    const response = await fetchJson.get(api('/auth/cookie'))
    console.log(response.data)
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <form onSubmit={handleSubmit}>
        <input name="username" />
        <input name="password" />
        <button type="submit">Click</button>
      </form>
      <button onClick={handleCookieClick}>Cookie</button>
    </main>
  )
}

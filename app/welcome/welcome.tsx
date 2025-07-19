import { useEffect, type FormEvent, useState, useCallback } from 'react'
import { fetchJson } from '~/helpers/fetchJson'
import { usePost } from '~/hooks/usePost'
import { useFetchJson } from '~/hooks/useFetchJson'

const api = (path: string) => `/api${path}`

export function Welcome() {
  const signIn = useFetchJson.post(api('/auth/signIn'))
  const cookie = useFetchJson.get(api('/auth/cookie'))

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
      console.log('fetch result', await signIn.fetch(data))
      // console.log('value', signIn.value)
    },
    [signIn]
  )

  const handleCookieClick = async () => {
    console.log(await cookie.fetch())
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <form onSubmit={handleSubmit}>
        <input name="username" />
        <input name="password" />
        <button type="submit">Click</button>
      </form>
      <button onClick={handleCookieClick}>Cookie</button>
      <button onClick={() => fetchJson.post(api('/auth/signOut'))}>
        Sign out
      </button>
    </main>
  )
}

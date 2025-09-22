import { Button, Field, Input } from '@chakra-ui/react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useFetchJson } from '~/hooks/useFetchJson'
import { useUserStore } from '~/store/user'

export const SignForm = () => {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('1')

  const userStore = useUserStore()

  // TODO autogenerate api types from backend
  const signIn = useFetchJson.post('/api/auth/signIn')

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // const g = await fetchJson.get<{ a: 2 }>('/api/auth/cookie', {})
    // g.data.a

    // await fetchJson.head('/api/auth/cookie', {})

    // const p = await fetchJson.post<{ query: string }, { result: number }>('/api/auth/cookie', { query: 's' }, {})
    // p.data.result

    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    await userStore.fetchProfile()
  }

  return (
    <form onSubmit={handleSubmit}>
      <pre>{JSON.stringify({ username, password })}</pre>
      <Field.Root id="username">
        <Field.Label>Username</Field.Label>
        <Input name="username" value={username} onChange={handleUsernameChange} />
      </Field.Root>
      <Field.Root id="password" mt={4}>
        <Field.Label>Password</Field.Label>
        <Input name="password" type="password" value={password} onChange={handlePasswordChange} />
      </Field.Root>
      <Button type="submit" variant="solid" mt={4} loading={signIn.loading}>
        Click
      </Button>
      {signIn.error && <div>{signIn.error}</div>}
    </form>
  )
}

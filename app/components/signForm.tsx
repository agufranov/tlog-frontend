import { useFetchJson } from '@/hooks/useFetchJson'
import { useUserStore } from '@/store/user'
import { Field, Input, Button } from '@chakra-ui/react'
import type { FormEvent } from 'react'

export const SignForm = () => {
  const userStore = useUserStore()

  const signIn = useFetchJson.post('/api/auth/signIn')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    console.log('fetch result', await signIn.fetch(data))
    await userStore.fetchUser()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field.Root id="username">
        <Field.Label>Username</Field.Label>
        <Input name="username" />
      </Field.Root>
      <Field.Root id="password" mt={4}>
        <Field.Label>Password</Field.Label>
        <Input name="password" type="password" />
      </Field.Root>
      <Button type="submit" variant="solid" mt={4}>
        Click
      </Button>
    </form>
  )
}

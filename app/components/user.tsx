import { fetchJson } from '@/helpers/fetchJson'
import { useUserStore } from '@/store/user'
import { Button } from '@chakra-ui/react'

export const User = () => {
  const userStore = useUserStore()

  return (
    <div>
      <div>Username is: "{userStore.user?.username}"</div>
      <pre>{JSON.stringify(userStore.user, null, 2)}</pre>
      <Button mt={4} onClick={userStore.signOut} loading={userStore.loading}>
        Sign out
      </Button>
    </div>
  )
}

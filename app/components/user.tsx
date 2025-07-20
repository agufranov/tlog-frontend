import { fetchJson } from '@/helpers/fetchJson'
import { useUserStore } from '@/store/user'

export const User = () => {
  const userStore = useUserStore()

  return (
    <div>
      <div>Username is: "{userStore.user?.username}"</div>
      <pre>{JSON.stringify(userStore.user, null, 2)}</pre>
      <button onClick={userStore.signOut}>Sign out</button>
    </div>
  )
}

import { Button } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useUserStore } from '~/store/user'

export const User = () => {
  const userStore = useUserStore()

  useEffect(() => {
    console.log('Mount!')

    // Just check if fetchJson handles bodyless requests as well as others

    // const a = fetchJson.get<{ x: number }>('/api/test/a', { headers: { XZZXZXX: 'empty' } })
    // const b = fetchJson.post<{ r: string }, { result: boolean }>(
    //   '/api/test/b',
    //   { r: 'sts' },
    //   { headers: { PPPPPPPPPPPPP: 'empty' } }
    // )

    return () => {
      console.log('Unmount!')
    }
  }, [])

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

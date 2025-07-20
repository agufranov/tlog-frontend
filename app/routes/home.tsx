import type { Route } from './+types/home'
import { useEffect } from 'react'
import { useFetchJson } from '@/hooks/useFetchJson'
import { Provider } from '@/components/ui/provider'
import { SplashScreen } from '@/components/splashScreen'
import { useUserStore, type UserState } from '@/store/user'
import { SignForm } from '@/components/signForm'
import { User } from '@/components/user'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'The last of Guss' }, { name: 'description', content: 'The last of Guss game' }]
}

export default function Home() {
  const userStore = useUserStore()

  useEffect(() => {
    userStore.fetchUser()
  }, [])

  useEffect(() => {
    console.log('user', userStore.user)
  }, [userStore.user])

  return (
    <Provider>
      <div className="center ml-16">
        {userStore.isFetched ? userStore.user?.username ? <User /> : <SignForm /> : <SplashScreen />}
      </div>
    </Provider>
  )
}

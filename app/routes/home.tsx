import { useEffect } from 'react'
import { SignForm } from '~/components/signForm'
import { SplashScreen } from '~/components/splashScreen'
import { Provider } from '~/components/ui/provider'
import { User } from '~/components/user'
import { useUserStore } from '~/store/user'
import type { Route } from './+types/home'
import style from './home.module.css'

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
      <div className={style.root}>
        {userStore.isFetched ? userStore.user?.username ? <User /> : <SignForm /> : <SplashScreen />}
      </div>
    </Provider>
  )
}

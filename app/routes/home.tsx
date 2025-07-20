import type { Route } from './+types/home'
import { Welcome } from '../welcome/welcome'
import { useEffect } from 'react'
import { useFetchJson } from '@/hooks/useFetchJson'
import { Provider } from '@/components/ui/provider'
import { SplashScreen } from '@/components/splashScreen'
import { useUserStore, type UserState } from '@/store/user'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'The last of Guss' }, { name: 'description', content: 'The last of Guss game' }]
}

export default function Home() {
  const user = useUserStore((state) => state.x)

  return (
    <Provider>
      <div className="center ml-16">{user ? <SplashScreen /> : <Welcome />}</div>
    </Provider>
  )
}

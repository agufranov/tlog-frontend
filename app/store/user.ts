import { create } from 'zustand'
import { fetchJson } from '~/helpers/fetchJson'
import { fetchJsonOpenApi } from '~/helpers/fetchJsonOpenApi'
import type { AsyncReturnType } from '~/helpers/types'

const fetchProfile = () => fetchJsonOpenApi.get('/auth/profile')

export interface UserState {
  user: AsyncReturnType<typeof fetchProfile>['data']['user'] | undefined
  error?: any
  loading: boolean
  isFetched: boolean
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => {
  let user: UserState['user']
  let error: UserState['error']
  let isFetched: UserState['isFetched'] = false
  let loading: UserState['loading'] = false

  return {
    user,
    error,
    isFetched,
    loading,
    fetchProfile: async () => {
      try {
        set({ loading: true })
        const response = await fetchProfile()
        console.log('response', response)
        const { data } = response
        set({ user: data?.user, isFetched: true })
      } catch (err) {
        set({ user: undefined, error: err })
      } finally {
        set({ loading: false, isFetched: true })
      }
    },
    signOut: async () => {
      set({ loading: true })
      try {
        await fetchJson.post('/api/auth/signOut')
        set({ user: undefined })
      } catch (err) {
        console.log('catch in signOut', err)
      } finally {
        set({ loading: false })
      }
    },
  }
})

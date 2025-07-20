import { fetchJson } from '@/helpers/fetchJson'
import type { U } from 'node_modules/react-router/dist/development/route-data-DjzmHYNR.mjs'
import * as React from 'react'
import { create } from 'zustand'

// TODO extract
type User = {
  username: string
  id: string
}

export interface UserState {
  user?: User
  error?: any
  loading: boolean
  isFetched: boolean
  fetchUser: () => Promise<void>
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
    fetchUser: async () => {
      try {
        set({ loading: true })
        const response = await fetchJson.get<{ user: User }>('/api/auth/profile')
        console.log('response', response)
        const { data } = response
        set({ user: data.user, isFetched: true })
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

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
  isFetched: boolean
  fetchUser: () => Promise<void>
  signOut: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => {
  let user: UserState['user']
  let error: UserState['error']
  let isFetched: UserState['isFetched'] = false

  return {
    user,
    error,
    isFetched,
    fetchUser: async () => {
      const { data } = await fetchJson.get<{}, { user: User }>('/api/auth/profile')
      // if (data.error) throw data.error
      set({ user: data.user, isFetched: true })
    },
    signOut: async () => {
      fetchJson.post('/api/auth/signOut')
      set({ user: undefined })
    },
  }
})

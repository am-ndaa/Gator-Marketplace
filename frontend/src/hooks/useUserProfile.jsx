import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import * as usersApi from '../api/users'

export default function useUserProfile() {
  const { user, isAuthenticated } = useAuth0()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    async function fetchProfile() {
      try {
        const profile = await usersApi.getUserProfile(user.sub, null)
        setUserProfile(profile)
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated, user])

  return { userProfile, loading }
}
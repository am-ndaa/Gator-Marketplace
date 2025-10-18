import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import * as usersApi from '../api/users'

export default function useEnsureUserProfile() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    async function ensureProfile() {
      const token = null // Skip token since backend auth is disabled
      try {
        await usersApi.getUserProfile(user.sub, token)
      } catch (err) {
        if (err.status === 404) {
          await usersApi.createUserProfile({
            auth0_id: user.sub,
            email: user.email,
            first_name: user.given_name || '',
            last_name: user.family_name || '',
            profile_picture_url: user.picture,
          }, token)
        } else {
          console.error('Error fetching/creating user profile:', err)
        }
      }
    }

    ensureProfile()
  }, [isAuthenticated, user, getAccessTokenSilently])
}

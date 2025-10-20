import { useState, useEffect } from 'react'
import { getUserById } from '../api/users'

export default function SellerEmail({ sellerId }) {
  const [email, setEmail] = useState('Loading...')

  useEffect(() => {
    async function fetchEmail() {
      try {
        console.log('Fetching user for ID:', sellerId)
        const user = await getUserById(sellerId, null)
        console.log('User data:', user)
        setEmail(user.email || 'Unknown')
      } catch (err) {
        console.error('Fetch error:', err)
        setEmail('Unknown')
      }
    }
    
    if (sellerId) {
      fetchEmail()
    }
  }, [sellerId])

  return <span>{email}</span>
}
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { logout } from '../../features/auth/authSlice'
import { getTokenExpiryMs } from '../../lib/jwt'

const CHECK_INTERVAL_MS = 15_000

// Mounted once at the app root — logs the user out the moment their JWT expires,
// even if they never make another API call (polling avoids setTimeout's 32-bit
// overflow bug on long-lived tokens).
export default function AuthSessionWatcher() {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    if (!token) return

    const expiryMs = getTokenExpiryMs(token)
    if (!expiryMs) return

    const checkExpiry = () => {
      if (Date.now() >= expiryMs) {
        dispatch(logout())
        toast.error('Session expired. Please log in again.')
      }
    }

    checkExpiry()
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [token, dispatch])

  return null
}

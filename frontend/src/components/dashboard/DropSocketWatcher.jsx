import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { socket } from '../../lib/socket'
import { fetchDrops } from '../../features/drops/dropsSlice'
import { expireReservation } from '../../features/reservations/reservationsSlice'

// Mounted on the dashboard — keeps stock counts and the purchase feed in
// sync across every open tab the moment another user reserves, buys, or
// a reservation expires server-side.
export default function DropSocketWatcher() {
  const dispatch = useDispatch()
  const reservations = useSelector((state) => state.reservations.byDropId)
  const reservationsRef = useRef(reservations)

  useEffect(() => {
    reservationsRef.current = reservations
  }, [reservations])

  useEffect(() => {
    socket.connect()

    const refresh = () => dispatch(fetchDrops())

    const handleExpired = ({ dropId, reservationId }) => {
      if (reservationsRef.current[dropId]?.id === reservationId) {
        dispatch(expireReservation(dropId))
        toast.error('Your reservation expired')
      }
      dispatch(fetchDrops())
    }

    socket.on('stock:updated', refresh)
    socket.on('purchase:new', refresh)
    socket.on('reservation:expired', handleExpired)

    return () => {
      socket.off('stock:updated', refresh)
      socket.off('purchase:new', refresh)
      socket.off('reservation:expired', handleExpired)
      socket.disconnect()
    }
  }, [dispatch])

  return null
}

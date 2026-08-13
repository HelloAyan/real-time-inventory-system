import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import { fetchDrops } from '../../features/drops/dropsSlice'
import {
  expireReservation,
  purchaseReservation,
  reserveDrop,
} from '../../features/reservations/reservationsSlice'

const RESERVATION_DURATION_SECONDS = 60

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatStartsAt(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function DropCard({ drop }) {
  const dispatch = useDispatch()
  const { id, name, price, availableStock, startsAt, recentPurchasers } = drop
  const soldOut = availableStock === 0

  const reservation = useSelector((state) => state.reservations.byDropId[id])
  const isReserving = useSelector((state) => state.reservations.reservingDropId === id)
  const isPurchasing = useSelector((state) => state.reservations.purchasingDropId === id)

  const [secondsLeft, setSecondsLeft] = useState(0)
  const [hasStarted, setHasStarted] = useState(() => new Date(startsAt) <= new Date())

  useEffect(() => {
    if (hasStarted) return

    const msUntilStart = Math.max(new Date(startsAt).getTime() - Date.now(), 0)
    const timer = setTimeout(() => setHasStarted(true), msUntilStart)
    return () => clearTimeout(timer)
  }, [startsAt, hasStarted])

  useEffect(() => {
    if (!reservation) return

    const tick = () => {
      const remaining = Math.round((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000)
      setSecondsLeft(Math.max(remaining, 0))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [reservation])

  const handleReserve = async () => {
    const result = await dispatch(reserveDrop(id))
    if (reserveDrop.fulfilled.match(result)) {
      toast.success(`Reserved ${name} for 60 seconds`)
      dispatch(fetchDrops())
    } else {
      toast.error(result.payload || 'Could not reserve this item.')
    }
  }

  const handlePurchase = async () => {
    const result = await dispatch(
      purchaseReservation({ dropId: id, reservationId: reservation?.id }),
    )
    if (purchaseReservation.fulfilled.match(result)) {
      toast.success(`Purchased ${name}!`)
      dispatch(fetchDrops())
    } else {
      toast.error(result.payload || 'Could not complete purchase.')
      dispatch(expireReservation(id))
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{name}</h3>
        <span className="whitespace-nowrap text-xl font-bold text-ink">৳{price}</span>
      </div>

      <span className="inline-flex w-fit items-center rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-xs font-medium text-warning-ink">
        Available Stock: {availableStock}
      </span>

      {hasStarted ? (
        <span className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </span>
      ) : (
        <span className="inline-flex w-fit items-center text-xs font-medium text-text-muted">
          Starts {formatStartsAt(startsAt)}
        </span>
      )}

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-faint">
          Recent Purchasers
        </p>
        {recentPurchasers.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {recentPurchasers.map((purchaser) => (
              <li
                key={`${purchaser.username}-${purchaser.purchasedAt}`}
                className="flex items-center gap-2 text-sm text-text"
              >
                <span className="h-1 w-1 rounded-full bg-text-faint" />
                {purchaser.username}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-faint">No purchases yet</p>
        )}
      </div>

      {reservation ? (
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-text-muted">
            <span>Reserved</span>
            <span className="tabular-nums text-ink">{formatCountdown(secondsLeft)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-sunk">
            <div
              className="h-full rounded-pill bg-danger transition-[width] duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / RESERVATION_DURATION_SECONDS) * 100}%` }}
            />
          </div>
          <Button onClick={handlePurchase} loading={isPurchasing}>
            Complete Purchase
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleReserve}
          disabled={soldOut || !hasStarted}
          loading={isReserving}
          className="mt-auto"
        >
          {!hasStarted ? 'Not Started Yet' : soldOut ? 'Sold Out' : 'Reserve'}
        </Button>
      )}
    </article>
  )
}

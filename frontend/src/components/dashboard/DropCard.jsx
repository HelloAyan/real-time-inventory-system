import Button from '../ui/Button'

export default function DropCard({ drop }) {
  const { name, price, stock, status, purchasers } = drop
  const soldOut = stock === 0

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{name}</h3>
        <span className="whitespace-nowrap text-xl font-bold text-ink">৳{price}</span>
      </div>

      <span className="inline-flex w-fit items-center rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-sm font-medium text-warning-ink">
        Total Stock: {stock}
      </span>

      <span className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {status === 'live' ? 'Live' : status}
      </span>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-faint">
          Recent Purchasers
        </p>
        {purchasers.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {purchasers.map((purchaser) => (
              <li key={purchaser} className="flex items-center gap-2 text-sm text-text">
                <span className="h-1 w-1 rounded-full bg-text-faint" />
                {purchaser}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-faint">No purchases yet</p>
        )}
      </div>

      <Button disabled={soldOut} className="mt-auto">
        {soldOut ? 'Sold Out' : 'Reserve'}
      </Button>
    </article>
  )
}

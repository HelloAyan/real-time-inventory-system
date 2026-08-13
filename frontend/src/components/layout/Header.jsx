import Logo from '../ui/Logo'

export default function Header({ userName, onLogout, onNewDrop }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center justify-between sm:justify-start">
          <Logo />
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunk sm:hidden"
          >
            Log out
          </button>
        </div>

        <button
          type="button"
          onClick={onNewDrop}
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunk sm:w-auto"
        >
          + New Drop
        </button>

        <div className="hidden items-center gap-4 sm:flex">
          <p className="text-sm text-text-muted">
            Welcome, <span className="font-medium text-ink">{userName}</span>
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-sunk"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}

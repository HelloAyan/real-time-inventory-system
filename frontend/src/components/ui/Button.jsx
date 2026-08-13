function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  )
}

const VARIANTS = {
  primary: 'bg-ink text-ink-inverse hover:bg-ink/90',
  ghost: 'border border-border bg-transparent text-ink hover:bg-surface-sunk',
}

export default function Button({
  children,
  loading = false,
  disabled = false,
  type = 'button',
  variant = 'primary',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

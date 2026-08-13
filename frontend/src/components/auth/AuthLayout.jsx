import Logo from '../ui/Logo'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10 sm:py-16">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-pop sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>

      {footer && <p className="mt-6 text-center text-sm text-text-muted">{footer}</p>}
    </div>
  )
}

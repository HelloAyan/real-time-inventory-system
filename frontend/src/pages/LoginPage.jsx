import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import AuthLayout from '../components/auth/AuthLayout'
import TextField from '../components/ui/TextField'
import PasswordField from '../components/ui/PasswordField'
import Button from '../components/ui/Button'
import { loginUser, clearAuthError } from '../features/auth/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector((state) => state.auth.status)
  const isLoading = status === 'loading'

  const [form, setForm] = useState({ name: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errors = {}
    if (!form.name) errors.name = 'Name is required'
    if (!form.password) errors.password = 'Password is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearAuthError())
    if (!validate()) return

    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!')
      navigate('/')
    } else {
      toast.error(result.payload || 'Login failed. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Log in to your account"
      subtitle="Grab the next drop before it sells out."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-ink underline underline-offset-2 hover:no-underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="flex flex-col gap-4">
        <TextField
          id="name"
          label="Name"
          autoComplete="off"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange('name')}
          error={fieldErrors.name}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="off"
          value={form.password}
          onChange={handleChange('password')}
          error={fieldErrors.password}
        />
        <Button type="submit" loading={isLoading} className="mt-1">
          Log in
        </Button>
      </form>
    </AuthLayout>
  )
}

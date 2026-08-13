import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'
import { isTokenExpired } from '../../lib/jwt'

// Placeholder paths — point these at the real backend routes when they exist.
export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  signup: '/auth/signup',
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ name, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(AUTH_ENDPOINTS.login, { name, password })
      return data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed. Please try again.',
      )
    }
  },
)

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(AUTH_ENDPOINTS.signup, { name, password })
      return data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Signup failed. Please try again.',
      )
    }
  },
)

function loadPersistedAuth() {
  const token = localStorage.getItem('token')
  if (token && !isTokenExpired(token)) {
    return { token, user: JSON.parse(localStorage.getItem('user') || 'null') }
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return { token: null, user: null }
}

const initialState = {
  ...loadPersistedAuth(),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

function onPending(state) {
  state.status = 'loading'
  state.error = null
}

function onFulfilled(state, action) {
  state.status = 'succeeded'
  state.user = action.payload.user
  state.token = action.payload.token
  localStorage.setItem('token', action.payload.token)
  localStorage.setItem('user', JSON.stringify(action.payload.user))
}

function onRejected(state, action) {
  state.status = 'failed'
  state.error = action.payload
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, onPending)
      .addCase(loginUser.fulfilled, onFulfilled)
      .addCase(loginUser.rejected, onRejected)
      .addCase(signupUser.pending, onPending)
      .addCase(signupUser.fulfilled, onFulfilled)
      .addCase(signupUser.rejected, onRejected)
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer

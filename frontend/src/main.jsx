import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store.js'
import { api } from './lib/api.js'
import { logout } from './features/auth/authSlice.js'
import './index.css'
import App from './App.jsx'

// Any authenticated request the server rejects as 401 means the token is no
// longer valid (expired, revoked, etc.) — log out immediately rather than
// waiting for the client-side expiry timer.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization)
    if (error.response?.status === 401 && hadAuthHeader) {
      store.dispatch(logout())
    }
    return Promise.reject(error)
  },
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-pop)',
          },
        }}
      />
    </Provider>
  </StrictMode>,
)

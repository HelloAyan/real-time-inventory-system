import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import dropsReducer from '../features/drops/dropsSlice'
import reservationsReducer from '../features/reservations/reservationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drops: dropsReducer,
    reservations: reservationsReducer,
  },
})

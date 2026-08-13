import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

export const reserveDrop = createAsyncThunk(
  'reservations/reserve',
  async (dropId, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/reservations', { dropId })
      return { dropId, reservation: data.reservation }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not reserve this item.')
    }
  },
)

export const purchaseReservation = createAsyncThunk(
  'reservations/purchase',
  async ({ dropId, reservationId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/reservations/${reservationId}/purchase`)
      return { dropId, purchase: data.purchase }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not complete purchase.')
    }
  },
)

const initialState = {
  byDropId: {}, // dropId -> { id, expiresAt }
  reservingDropId: null,
  purchasingDropId: null,
  error: null,
}

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    expireReservation(state, action) {
      delete state.byDropId[action.payload]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(reserveDrop.pending, (state, action) => {
        state.reservingDropId = action.meta.arg
        state.error = null
      })
      .addCase(reserveDrop.fulfilled, (state, action) => {
        const { dropId, reservation } = action.payload
        state.byDropId[dropId] = { id: reservation.id, expiresAt: reservation.expiresAt }
        state.reservingDropId = null
      })
      .addCase(reserveDrop.rejected, (state, action) => {
        state.reservingDropId = null
        state.error = action.payload
      })
      .addCase(purchaseReservation.pending, (state, action) => {
        state.purchasingDropId = action.meta.arg.dropId
        state.error = null
      })
      .addCase(purchaseReservation.fulfilled, (state, action) => {
        delete state.byDropId[action.payload.dropId]
        state.purchasingDropId = null
      })
      .addCase(purchaseReservation.rejected, (state, action) => {
        state.purchasingDropId = null
        state.error = action.payload
      })
  },
})

export const { expireReservation } = reservationsSlice.actions
export default reservationsSlice.reducer

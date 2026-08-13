import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

export const fetchDrops = createAsyncThunk('drops/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/drops')
    return data.drops
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Could not load drops.')
  }
})

export const createDrop = createAsyncThunk(
  'drops/create',
  async (dropData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/drops', dropData)
      return data.drop
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not create drop.')
    }
  },
)

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  creating: false,
  error: null,
}

const dropsSlice = createSlice({
  name: 'drops',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrops.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchDrops.fulfilled, (state, action) => {
        state.status = 'succeeded'

        // Merge by id instead of replacing the array outright — the API
        // doesn't guarantee stable ordering between calls, and swapping the
        // whole array on every poll/socket refresh made cards jump around
        // on screen. Keep existing cards in their current position and
        // only append drops we haven't seen yet.
        const incomingById = new Map(action.payload.map((drop) => [drop.id, drop]))
        const updated = state.items
          .filter((drop) => incomingById.has(drop.id))
          .map((drop) => incomingById.get(drop.id))

        const existingIds = new Set(state.items.map((drop) => drop.id))
        const newDrops = action.payload.filter((drop) => !existingIds.has(drop.id))

        state.items = [...updated, ...newDrops]
      })
      .addCase(fetchDrops.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createDrop.pending, (state) => {
        state.creating = true
      })
      .addCase(createDrop.fulfilled, (state) => {
        state.creating = false
      })
      .addCase(createDrop.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload
      })
  },
})

export default dropsSlice.reducer

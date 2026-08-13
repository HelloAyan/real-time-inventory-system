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
        state.items = action.payload
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

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import TextField from '../ui/TextField'
import { createDrop, fetchDrops } from '../../features/drops/dropsSlice'

export default function NewDropModal({ onClose }) {
  const dispatch = useDispatch()
  const creating = useSelector((state) => state.drops.creating)

  const [form, setForm] = useState({ name: '', price: '', totalStock: '', startsAt: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errors = {}
    if (!form.name) errors.name = 'Name is required'
    if (!form.price || Number(form.price) <= 0) errors.price = 'Enter a valid price'
    if (!form.totalStock || Number(form.totalStock) <= 0) {
      errors.totalStock = 'Enter a valid stock count'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name: form.name,
      price: Number(form.price),
      totalStock: Number(form.totalStock),
    }
    if (form.startsAt) {
      payload.startsAt = new Date(form.startsAt).toISOString()
    }

    const result = await dispatch(createDrop(payload))
    if (createDrop.fulfilled.match(result)) {
      toast.success('Drop created!')
      dispatch(fetchDrops())
      onClose()
    } else {
      toast.error(result.payload || 'Could not create drop.')
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-pop">
        <h2 className="mb-4 text-lg font-semibold text-ink">New Drop</h2>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            id="drop-name"
            label="Name"
            placeholder="Air Jordan 1"
            value={form.name}
            onChange={handleChange('name')}
            error={fieldErrors.name}
          />
          <TextField
            id="drop-price"
            label="Price"
            type="number"
            step="0.01"
            placeholder="199.99"
            value={form.price}
            onChange={handleChange('price')}
            error={fieldErrors.price}
          />
          <TextField
            id="drop-stock"
            label="Total Stock"
            type="number"
            placeholder="100"
            value={form.totalStock}
            onChange={handleChange('totalStock')}
            error={fieldErrors.totalStock}
          />
          <TextField
            id="drop-startsAt"
            label="Starts At (optional)"
            type="datetime-local"
            value={form.startsAt}
            onChange={handleChange('startsAt')}
          />
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

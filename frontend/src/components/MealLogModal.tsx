import { useState } from 'react'
import type { PlanItem } from '../types/recommendations'

export function MealLogModal({
  open,
  mealType,
  items,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  items: PlanItem[]
  onClose: () => void
  onEdit: (item: PlanItem, payload: { foodName: string; amount: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' }) => Promise<void>
  onDelete: (item: PlanItem) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const startEdit = async (it: PlanItem) => {
    if (busy) return
    const name = window.prompt('Edit food name', it.name || '') || ''
    if (!name) return
    const amt = window.prompt('Edit amount (e.g., 1 bowl / 200g)', '1 serving') || '1 serving'
    setBusy(true)
    try {
      await onEdit(it, { foodName: name, amount: amt, mealType: (it.meal_type as any) || mealType })
    } finally {
      setBusy(false)
    }
  }

  const startDelete = async (it: PlanItem) => {
    if (busy) return
    if (!window.confirm('Delete this meal?')) return
    setBusy(true)
    try {
      await onDelete(it)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 90, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '92%', maxWidth: 520, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: 14, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>{mealType}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 12, maxHeight: '70vh', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ fontSize: 13, color: '#6b7280' }}>No meals logged yet for {mealType}.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {items.map((it) => (
                <div key={it.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {it.image_url ? (
                      <img src={it.image_url} alt={it.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{it.name || 'Meal'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{it.calories || 0} kcal • {it.protein_g || 0}g protein</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => startEdit(it)} style={{ border: 'none', background: '#f3f4f6', color: '#111827', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => startDelete(it)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

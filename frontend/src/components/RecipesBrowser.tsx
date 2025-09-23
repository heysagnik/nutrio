import { useEffect, useState } from 'react'
import type { PlanItem } from '../types/recommendations'

export function RecipesBrowser({
  mealType,
  onLoadRecipes,
  onSwap,
  onClose,
}: {
  mealType?: string
  onLoadRecipes: (filters: { meal_type?: string }) => Promise<PlanItem[]>
  onSwap: (newItemId: string) => Promise<void>
  onClose: () => void
}) {
  const [items, setItems] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await onLoadRecipes({ meal_type: mealType })
        setItems(list)
      } catch (e: any) {
        setError(e?.message || 'Failed to load recipes')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mealType])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 80, display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 700, color: '#111827' }}>Recipes</div>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: 22 }}>×</button>
      </div>
      <div style={{ padding: 16, overflowY: 'auto', display: 'grid', gap: 12 }}>
        {loading ? <div style={{ fontSize: 13, color: '#6b7280' }}>Loading…</div> : null}
        {error ? <div style={{ fontSize: 13, color: '#b91c1c' }}>{error}</div> : null}
        {!loading && !error && items.map((r) => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{r.calories || 0} kcal • {r.protein_g || 0}g protein</div>
            </div>
            <button onClick={() => onSwap(r.id)} style={{ border: 'none', background: '#10b981', color: '#fff', borderRadius: 10, padding: '8px 10px', fontWeight: 600, cursor: 'pointer' }}>Swap</button>
          </div>
        ))}
      </div>
    </div>
  )
}

import type { PlanItem } from '../types/recommendations'

export function RecipeModal({ open, item, onClose }: { open: boolean; item: PlanItem | null; onClose: () => void }) {
  if (!open || !item) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 95, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '92%', maxWidth: 560, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: 14, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, color: '#111827' }}>{item.name}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: 20 }}>×</button>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Meal type: {item.meal_type}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Calories</div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{item.calories || 0} kcal</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Protein</div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{item.protein_g || 0} g</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Carbs</div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{item.carbs_g || 0} g</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Fat</div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{item.fat_g || 0} g</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>This is a recommended item for today. You can swap or log a similar meal from the dashboard.
          </div>
        </div>
      </div>
    </div>
  )
}

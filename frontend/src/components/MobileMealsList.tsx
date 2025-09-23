import type { PlanItem } from '../types/recommendations'

const EMOJI_BY_TYPE: Record<string, string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
}

export function MobileMealsList({ items, onAdd, onOpenType }: { items: PlanItem[]; onAdd: () => void; onOpenType: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void }) {
  const types: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack']
  const grouped = types.map((t) => {
    const list = items.filter((i) => (i.meal_type || '').toLowerCase() === t)
    const calories = list.reduce((sum, i) => sum + (i.calories || 0), 0)
    return { type: t, count: list.length, calories }
  })
  const totalLogged = items.length

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>Today's Meals</h2>
        <span style={{ fontSize: 12, color: '#6b7280', background: '#f1f5f9', padding: '4px 8px', borderRadius: 8 }}>{totalLogged} logged</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {grouped.map((m) => (
          <button key={m.type} style={{
            width: '100%', padding: 16, borderRadius: 16, border: 'none', background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={() => onOpenType(m.type)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc', display: 'grid', placeItems: 'center', fontSize: 20 }}>{EMOJI_BY_TYPE[m.type] || '🍽️'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', textTransform: 'capitalize' }}>{m.type}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{m.count} items • {m.calories} kcal</div>
              </div>
              <div style={{ fontSize: 24, color: '#d1d5db' }}>›</div>
            </div>
          </button>
        ))}

        {/* <button
          style={{
            width: '100%', padding: 16, borderRadius: 16, border: '2px dashed #d1d5db', background: '#fafbfc', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={onAdd}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'grid', placeItems: 'center', fontSize: 20, color: '#64748b' }}>+</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>Add Meal</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Log your food</div>
            </div>
          </div>
        </button> */}
      </div>
    </div>
  )
}

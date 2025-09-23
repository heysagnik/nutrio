import { MobileProgressRing } from './MobileProgressRing'

export function MobileNutrition({
  caloriesConsumed,
  calorieTarget,
  proteinConsumed,
  proteinTarget,
  waterConsumed,
  waterTarget,
}: {
  caloriesConsumed: number
  calorieTarget: number
  proteinConsumed: number
  proteinTarget: number
  waterConsumed: number
  waterTarget: number
}) {
  const pct = (val: number, target: number) => {
    if (!target || target <= 0) return 0
    return Math.max(0, Math.min(100, Math.round((val / target) * 100)))
  }

  const caloriesPct = pct(caloriesConsumed, calorieTarget)
  const proteinPct = pct(proteinConsumed, proteinTarget)
  const waterPct = pct(waterConsumed, waterTarget)

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 16px 0' }}>Today's Nutrition</h2>
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
          <MobileProgressRing value={proteinPct} color="#f59e0b" label="Protein" />
          <MobileProgressRing value={caloriesPct} color="#16a34a" label="Calories" />
          <MobileProgressRing value={waterPct} color="#0ea5e9" label="Water" />
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Calories</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{caloriesConsumed.toLocaleString()} / {calorieTarget.toLocaleString()} kcal</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Protein</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{proteinConsumed}g / {proteinTarget}g</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Water</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{waterConsumed} / {waterTarget} glasses</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Protein %</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{proteinPct}% of target</div>
          </div>
        </div>
      </div>
    </div>
  )
}

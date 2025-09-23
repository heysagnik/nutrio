import { PRIMARY } from '../ui'

export type DayItem = { d: string; n: number; iso: string; active?: boolean }

export function MobileDateScroller({ days, onSelect }: { days: DayItem[]; onSelect: (iso: string) => void }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          paddingBottom: 4,
        }}
      >
        {days.map((w) => (
          <button
            key={w.iso}
            onClick={() => onSelect(w.iso)}
            style={{
              flex: 1,
              padding: '12px 8px',
              borderRadius: 16,
              border: 'none',
              background: w.active ? PRIMARY : '#fff',
              color: w.active ? '#fff' : '#6b7280',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: w.active ? `0 4px 12px ${PRIMARY}30` : '0 2px 4px rgba(0,0,0,0.04)',
              transform: w.active ? 'translateY(-1px)' : 'none',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>{w.d}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{w.n}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

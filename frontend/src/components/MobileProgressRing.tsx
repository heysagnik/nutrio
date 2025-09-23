
type RingProps = { size?: number; stroke?: number; value: number; color: string; track?: string; label?: string }

export function MobileProgressRing({ size = 72, stroke = 6, value, color, track = '#f1f5f9', label }: RingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  const displayValue = Math.round(clamped)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{displayValue}</span>
          <span style={{ fontSize: 10, fontWeight: 500, color: '#6b7280' }}>%</span>
        </div>
      </div>
      {label && <div style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textAlign: 'center' }}>{label}</div>}
    </div>
  )
}
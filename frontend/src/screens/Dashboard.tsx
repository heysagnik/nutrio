import { useMemo, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button, Container, Subtext, Card, PRIMARY } from '../ui'

type RingProps = { size?: number; stroke?: number; value: number; color: string; track?: string; label?: string }

function ProgressRing({ size = 64, stroke = 8, value, color, track = '#eef2f7', label }: RingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference
  return (
    <div style={{ display: 'grid', placeItems: 'center', position: 'relative' }}>
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
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: '#111827' }}>{value}%</div>
        {label ? <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div> : null}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isNarrow = width < 720
  const isMedium = width >= 720 && width < 1200
  const isLarge = width >= 1200
  const ringSize = isNarrow ? 80 : isMedium ? 100 : 140
  const ringStroke = isNarrow ? 8 : isMedium ? 10 : 12
  const containerMax = isNarrow ? 680 : isMedium ? 960 : 1400

  const week = useMemo(
    () => [
      { d: 'Sun', n: 17 },
      { d: 'Mon', n: 18 },
      { d: 'Tue', n: 19 },
      { d: 'Wed', n: 20, active: true },
      { d: 'Thu', n: 21 },
      { d: 'Fri', n: 22 },
      { d: 'Sat', n: 23 },
    ],
    []
  )

  return (
    <Container style={{ maxWidth: containerMax, paddingTop: 20, paddingBottom: 40, paddingLeft: 20, paddingRight: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: '#d1fae5',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              color: '#065f46',
            }}
            aria-label="avatar"
          >
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: isNarrow ? 13 : 14, color: '#6b7280' }}>Good morning</div>
            <div style={{ fontSize: isNarrow ? 18 : 20, fontWeight: 700, color: '#111827' }}>{user?.name || user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            aria-label="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: `1px solid #e5e7eb`,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span role="img" aria-label="bell">🔔</span>
          </button>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Week selector */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
        {week.map((w) => (
          <div key={w.d}
            style={{
              minWidth: isNarrow ? 56 : 72,
              padding: isNarrow ? '8px 12px' : '10px 14px',
              borderRadius: 16,
              textAlign: 'center',
              border: `1px solid ${w.active ? 'transparent' : '#e5e7eb'}`,
              background: w.active ? PRIMARY + '16' : '#fff',
              color: w.active ? '#111827' : '#6b7280',
              boxShadow: w.active ? 'inset 0 0 0 2px ' + PRIMARY : undefined,
            }}
          >
            <div style={{ fontSize: 12 }}>{w.d}</div>
            <div style={{ fontWeight: 600 }}>{w.n}</div>
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <div
        style={{
          display: 'grid',
          gap: isNarrow ? 12 : 20,
          gridTemplateColumns: isNarrow ? '1fr' : isMedium ? 'repeat(8, 1fr)' : 'repeat(12, 1fr)',
          alignItems: 'start',
        }}
      >
        {/* Tile: Breakfast (large) */}
        <div style={{ gridColumn: isNarrow ? 'auto' : isMedium ? 'span 5' : '1 / span 7' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '8px 0 12px' }}>
            <div style={{ fontWeight: 700, color: '#111827', fontSize: isNarrow ? 18 : 20 }}>Breakfast</div>
            <Subtext>07:00</Subtext>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
              gap: isNarrow ? 12 : 16,
            }}
          >
            <div style={{ background: '#eafff4', borderRadius: 18, padding: isNarrow ? 12 : 18, border: '1px solid #d1fae5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: isNarrow ? 48 : 64, height: isNarrow ? 48 : 64, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', fontSize: isNarrow ? 20 : 28 }}>🍣</div>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: isNarrow ? 16 : 18 }}>Salmon
                  <div style={{ fontWeight: 600, color: '#065f46', fontSize: isNarrow ? 14 : 16 }}>Poke Bowl</div>
                </div>
              </div>
            </div>
            <div style={{ background: '#fff3e6', borderRadius: 18, padding: isNarrow ? 12 : 18, border: '1px solid #ffe0b3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: isNarrow ? 48 : 64, height: isNarrow ? 48 : 64, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', fontSize: isNarrow ? 20 : 28 }}>🧃</div>
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: isNarrow ? 16 : 18 }}>Sunkist
                  <div style={{ fontWeight: 600, color: '#92400e', fontSize: isNarrow ? 14 : 16 }}>Orange Juice</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tile: Quick actions */}
        <div style={{ gridColumn: isNarrow ? 'auto' : isMedium ? 'span 3' : '1 / span 4', gridRow: isLarge ? 2 : 'auto' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: 10 }}>
              {[{ t: 'Ask AI', badge: 'New' }, { t: 'Plan Meal' }, { t: 'Recipes' }, { t: 'Market List' }, { t: 'Groceries' }, { t: 'Workouts' }].map((a) => (
                <div key={a.t} style={{ textAlign: 'center', paddingTop: 6 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: isNarrow ? 56 : 64, height: isNarrow ? 56 : 72, margin: '0 auto', borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff', display: 'grid', placeItems: 'center', fontSize: isNarrow ? 18 : 22 }}>🍽️</div>
                    {a.badge ? (
                      <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', borderRadius: 999, fontSize: 11, padding: '2px 8px' }}>New</div>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 8, color: '#111827', fontWeight: 600 }}>{a.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tile: Today's Nutrition (prominent) */}
        <div style={{ gridColumn: isNarrow ? 'auto' : isMedium ? 'span 3' : '8 / span 5' }}>
          <Card style={{ padding: isNarrow ? 12 : 20, boxShadow: isLarge ? '0 10px 30px rgba(16,24,40,0.08)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: '#111827' }}>Today's Nutrition</div>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }} aria-label="more">⋯</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
                <ProgressRing value={62} color="#f59e0b" label="Protein" size={ringSize} stroke={ringStroke} />
                <div style={{ fontSize: isNarrow ? 12 : 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="meat">🥩</span> Protein
                </div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
                <ProgressRing value={82} color="#16a34a" label="Calories" size={ringSize} stroke={ringStroke} />
                <div style={{ fontSize: isNarrow ? 12 : 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="calories">🥑</span> Calories
                </div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
                <ProgressRing value={90} color="#0ea5e9" label="Hydration" size={ringSize} stroke={ringStroke} />
                <div style={{ fontSize: isNarrow ? 12 : 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="water">💧</span> Hydration
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>Calories & Macros</div>
                <Subtext>1,240 kcal / 760 kcal left</Subtext>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>Protein Intake</div>
                <Subtext>65g taken / 35g remaining</Subtext>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>Hydration Tracker</div>
                <Subtext>9/10 glasses today</Subtext>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  )
}



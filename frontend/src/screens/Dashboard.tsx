import { useMemo, useRef, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button, Container, Subtext, Card, PRIMARY, Interactive, Heading } from '../ui'
import { useBreakpoint } from '../utils/useBreakpoint'

type RingProps = { size?: number; stroke?: number; value: number; color: string; track?: string; label?: string }

function ProgressRing({ size = 64, stroke = 8, value, color, track = '#eef2f7', label }: RingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference

  const displayValue = Math.round(value)
  const valueFontSize = Math.max(12, Math.round(size * 0.28))
  const percentFontSize = Math.max(10, Math.round(size * 0.14))
  const labelFontSize = Math.max(10, Math.round(size * 0.13))

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: valueFontSize, lineHeight: 1 }}>{displayValue}</span>
            <span style={{ fontWeight: 600, color: '#6b7280', fontSize: percentFontSize, lineHeight: 1 }}>%</span>
          </div>
          {label ? <div style={{ fontSize: labelFontSize, color: '#6b7280' }}>{label}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  const ringSize = isMobile ? 80 : isTablet ? 100 : 140
  const ringStroke = isMobile ? 8 : isTablet ? 10 : 12
  const containerMax = isMobile ? 680 : isTablet ? 960 : 1400

  const week = useMemo(() => {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const dayIndex = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayIndex)
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return {
        d: labels[i],
        n: d.getDate(),
        iso: d.toISOString().slice(0, 10),
        active: d.toDateString() === today.toDateString(),
      }
    })
  }, [])

  const calendarRef = useRef<HTMLDivElement | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const el = calendarRef.current
    if (!el) return
    // set initial scroll to the middle copy
    const totalWidth = el.scrollWidth
    const third = totalWidth / 3
    el.scrollLeft = third
    setIsReady(true)

    let ticking = false
    const onScroll = () => {
      if (!el || !isReady) return
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const max = el.scrollWidth
        const third = max / 3
        // if scrolled near the start, jump forward by one third
        if (el.scrollLeft < third * 0.5) {
          el.scrollLeft += third
        } else if (el.scrollLeft > third * 2.5) {
          // if near the end, jump back by one third
          el.scrollLeft -= third
        }
        ticking = false
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [week, isReady])

  return (
    <Container style={{ maxWidth: containerMax, paddingTop: 20, paddingBottom: 40, paddingLeft: 20, paddingRight: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f3f4f6', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 20,
              background: 'lightgreen',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              color: '#111827',
              fontSize: 14
            }}
            aria-label="avatar"
          >
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: '#111827' }}>
              {user?.name || user?.email}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            aria-label="Notifications"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid #eaeef0`,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ position: 'absolute', right: 6, top: 6, width: 8, height: 8, borderRadius: 999, background: '#ef4444', border: '2px solid #fff' }} />
          </button>
          <Button variant="ghost" onClick={logout} style={{ padding: '8px 12px' }}>Logout</Button>
        </div>
      </div>
 
     
      <div
        style={{
          display: 'grid',
          gap: isMobile ? 12 : 20,
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(8, 1fr)' : 'repeat(12, 1fr)',
          alignItems: 'start',
        }}
      >
        {/* Tile: Calendar (full width) */}
        <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1', marginBottom: isMobile ? 8 : 16 }}>
          {/* Calendar wrapper: position relative to host fade overlays */}
          <div style={{ position: 'relative' }}>
            <div
              ref={(el) => { calendarRef.current = el }}
              style={{
                display: 'flex',
                gap: isMobile ? 8 : isTablet ? 12 : 16,
                paddingBottom: 8,
                justifyContent: 'flex-start',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Duplicate the week three times to enable seamless looping */}
              {[0, 1, 2].map((copy) =>
                week.map((w) => (
                  <Interactive key={`${copy}-${w.iso}`}>
                    <div
                      style={{
                        flex: isMobile ? '0 0 84px' : isTablet ? '0 0 120px' : '0 0 160px',
                        minWidth: isMobile ? 72 : isTablet ? 130 : 170,
                        padding: isMobile ? '8px 12px' : isTablet ? '10px 14px' : '12px 16px',
                        borderRadius: 16,
                        textAlign: 'center',
                        border: `1px solid ${w.active ? 'transparent' : '#e5e7eb'}`,
                        background: w.active ? PRIMARY + '16' : '#fff',
                        color: w.active ? '#111827' : '#6b7280',
                        boxShadow: w.active ? 'inset 0 0 0 2px ' + PRIMARY : undefined,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: isMobile ? 12 : 13 }}>{w.d}</div>
                      <div style={{ fontWeight: 600, marginTop: 6 }}>{w.n}</div>
                    </div>
                  </Interactive>
                ))
              )}
            </div>

            {/* Fade overlays on both ends */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 48,
                pointerEvents: 'none',
                background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 48,
                pointerEvents: 'none',
                background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
              }}
            />
          </div>
        </div>

        {/* Tile: Meals (large) */}
        <div style={{ gridColumn: isMobile ? 'auto' : isDesktop ? 'span 7' : '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '8px 0 12px' }}>
            <Heading>Meals</Heading>
            <Subtext>4</Subtext>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? 12 : 16,
            }}
          >
            <Interactive>
              <div style={{ background: '#eafff4', borderRadius: 18, padding: isMobile ? 12 : 18, border: '1px solid #d1fae5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: isMobile ? 48 : 64, height: isMobile ? 48 : 64, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', fontSize: isMobile ? 20 : 28 }}>🍣</div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: isMobile ? 16 : 18 }}>Salmon
                    <div style={{ fontWeight: 600, color: '#065f46', fontSize: isMobile ? 14 : 16 }}>Poke Bowl</div>
                  </div>
                </div>
              </div>
            </Interactive>
            <Interactive>
              <div style={{ background: '#fff3e6', borderRadius: 18, padding: isMobile ? 12 : 18, border: '1px solid #ffe0b3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: isMobile ? 48 : 64, height: isMobile ? 48 : 64, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', fontSize: isMobile ? 20 : 28 }}>🧃</div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: isMobile ? 16 : 18 }}>Sunkist
                    <div style={{ fontWeight: 600, color: '#92400e', fontSize: isMobile ? 14 : 16 }}>Orange Juice</div>
                  </div>
                </div>
              </div>
            </Interactive>
            <Interactive onClick={() => console.log('Add meal clicked')}>
              <div style={{ background: '#f9fafb', borderRadius: 18, padding: isMobile ? 12 : 18, border: '2px dashed #d1d5db', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: isMobile ? 48 : 64, height: isMobile ? 48 : 64, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', fontSize: isMobile ? 20 : 28, border: '1px solid #e5e7eb' }}>+</div>
                  <div style={{ fontWeight: 600, color: '#6b7280', fontSize: isMobile ? 16 : 18 }}>Add Meal
                    <div style={{ fontWeight: 400, color: '#9ca3af', fontSize: isMobile ? 14 : 16 }}>Click to add</div>
                  </div>
                </div>
              </div>
            </Interactive>
            <Interactive onClick={() => console.log('Add meal clicked')}>
              <div style={{ background: '#f9fafb', borderRadius: 18, padding: isMobile ? 12 : 18, border: '2px dashed #d1d5db', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: isMobile ? 48 : 64, height: isMobile ? 48 : 64, borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', fontSize: isMobile ? 20 : 28, border: '1px solid #e5e7eb' }}>+</div>
                  <div style={{ fontWeight: 600, color: '#6b7280', fontSize: isMobile ? 16 : 18 }}>Add Meal
                    <div style={{ fontWeight: 400, color: '#9ca3af', fontSize: isMobile ? 14 : 16 }}>Click to add</div>
                  </div>
                </div>
              </div>
            </Interactive>
          </div>

        </div>
        
        {/* Tile: Today's Nutrition (prominent) */}
        <div style={{ gridColumn: isMobile ? 'auto' : isDesktop ? 'span 5' : isTablet ? 'span 8' : 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '8px 0 12px' }}>
            <Heading>Today's Nutrition</Heading>
            
        </div>
          <Card style={{ padding: isMobile ? 12 : 24, boxShadow: isDesktop ? '0 14px 40px rgba(16,24,40,0.08)' : undefined }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'grid', placeItems: 'center', gap: 10, flex: '1 1 80px' }}>
                <ProgressRing value={62} color="#f59e0b" label="Protein" size={ringSize} stroke={ringStroke} />
                <div style={{ fontSize: isMobile ? 12 : 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="meat">🥩</span> Protein
                </div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center', gap: 10, flex: '1 1 80px' }}>
                <ProgressRing value={82} color="#16a34a" label="Calories" size={ringSize} stroke={ringStroke} />
                <div style={{ fontSize: isMobile ? 12 : 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="calories">🥑</span> Calories
                </div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center', gap: 10, flex: '1 1 80px' }}>
                <ProgressRing value={90} color="#0ea5e9" label="Hydration" size={ringSize} stroke={ringStroke} />
                <div style={{ fontSize: isMobile ? 12 : 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="water">💧</span> Hydration
                </div>
              </div>
            </div>
        </Card>
        </div>

        
      </div>

      {/* Floating Quick Action Footer */}
      <div style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: isMobile ? 18 : 26,
        zIndex: 60,
        width: '100%',
        maxWidth: 420,
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Interactive>
            <button
              aria-label="Open camera"
              onClick={() => console.log('Open camera')}
              style={{
                width: isMobile ? 48 : 52,
                height: isMobile ? 48 : 52,
                borderRadius: 999,
                border: '1px solid #e6eef3',
                background: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 20px rgba(16,24,40,0.06)',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M23 19V7a2 2 0 00-2-2h-3.17a2 2 0 01-1.414-.586L14.17 2.17A2 2 0 0012.757 2H11.24a2 2 0 00-1.414.586L8.586 4.414A2 2 0 017.172 5H4a2 2 0 00-2 2v12a2 2 0 002 2h19a0 0 0 000-0z" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Interactive>

          <Interactive>
            <button
              aria-label="Ask Coach"
              onClick={() => console.log('Ask Coach')}
              style={{
                background: PRIMARY,
                color: '#fff',
                border: 'none',
                padding: isMobile ? '10px 14px' : '12px 18px',
                borderRadius: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 10px 30px rgba(61,187,107,0.16)',
                cursor: 'pointer',
                minWidth: 140,
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M8 2v4l-6 6v6c0 1.1.9 2 2 2h6v-6h4v6h6c1.1 0 2-.9 2-2v-6l-6-6V2h-8z" fill="rgba(255,255,255,0.95)" />
                <path d="M8 2v4l-6 6v6c0 1.1.9 2 2 2h6v-6h4v6h6c1.1 0 2-.9 2-2v-6l-6-6V2h-8z" stroke="rgba(255,255,255,0.95)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: isMobile ? 14 : 15 }}>Ask Coach</span>
            </button>
          </Interactive>
        </div>
      </div>
    </Container>
  )
}



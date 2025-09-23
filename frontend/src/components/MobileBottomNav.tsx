import { PRIMARY } from '../ui'

export function MobileBottomNav({ onCamera, onCoach }: { onCamera: () => void; onCoach: () => void }) {
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
      background: '#fff', borderTop: '1px solid #e5e7eb', paddingBottom: 'env(safe-area-inset-bottom, 0px)', boxShadow: '0 -4px 16px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '12px 16px 8px 16px', maxWidth: 480, margin: '0 auto' }}>
        <button aria-label="Home" onClick={() => console.log('Home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" fill={PRIMARY} stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 11, fontWeight: 500, color: PRIMARY }}>Home</div>
        </button>

        <button aria-label="Scan Food" onClick={onCamera} style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}dd)`, border: 'none', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: `0 8px 24px ${PRIMARY}40`, cursor: 'pointer', transform: 'translateY(-4px)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M23 19V7a2 2 0 00-2-2h-3.17a2 2 0 01-1.414-.586L14.17 2.17A2 2 0 0012.757 2H11.24a2 2 0 00-1.414.586L8.586 4.414A2 2 0 017.172 5H4a2 2 0 00-2 2v12a2 2 0 002 2h19z" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3" fill="rgba(255,255,255,0.9)" />
          </svg>
        </button>

        <button aria-label="Coach" onClick={onCoach} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a4 4 0 00-4-4H7a4 4 0 00-4 4v3h18v-3z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="3.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280' }}>Coach</div>
        </button>
      </div>
    </div>
  )
}

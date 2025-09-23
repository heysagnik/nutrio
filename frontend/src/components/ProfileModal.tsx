import { useState } from 'react'

export function ProfileModal({ open, profile, onClose, onSave, onLogout }: { open: boolean; profile: any; onClose: () => void; onSave?: (payload: { profile: any; goals: any }) => Promise<void>; onLogout?: () => void }) {
  if (!open) return null

  const data = profile?.user_profile_data ?? profile ?? {}
  const email: string | undefined = data?.email
  const profileInfoOrig: any = data?.profile ?? {}
  const goalsOrig: any = data?.goals ?? {}
  const createdAt: string | undefined = data?.createdAt
  const updatedAt: string | undefined = data?.updatedAt

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profileInfo, setProfileInfo] = useState({ ...profileInfoOrig })
  const [goals, setGoals] = useState({ ...goalsOrig })

  const chipList = (items?: any[]) => {
    if (!items || items.length === 0) return <span style={{ color: '#6b7280' }}>-</span>
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((it, idx) => (
          <span key={idx} style={{ fontSize: 12, color: '#0f172a', background: '#f1f5f9', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: 999 }}>{String(it)}</span>
        ))}
      </div>
    )
  }

  const field = (label: string, value: any, opts?: { postfix?: string }) => (
    <div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>
        {value == null || value === '' ? '-' : `${value}${opts?.postfix || ''}`}
      </div>
    </div>
  )

  const fmtDate = (iso?: string) => {
    if (!iso) return '-'
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  const set = (obj: any, path: string, value: any) => {
    const parts = path.split('.')
    const next = { ...obj }
    let cur: any = next
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      cur[p] = { ...(cur[p] ?? {}) }
      cur = cur[p]
    }
    cur[parts[parts.length - 1]] = value
    return next
  }

  const input = ({ label, path, type = 'text', placeholder, postfix }: { label: string; path: string; type?: string; placeholder?: string; postfix?: string }) => {
    const value = path.startsWith('goals.') ? (goals as any)[path.split('.')[1]] : (profileInfo as any)[path]
    const onChange = (e: any) => {
      const val = type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
      if (path.startsWith('goals.')) setGoals((g: any) => set(g, path.split('goals.')[1], val))
      else setProfileInfo((p: any) => set(p, path, val))
    }
    return (
      <div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            value={value ?? ''}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', fontSize: 14, outline: 'none' }}
          />
          {postfix ? <span style={{ fontSize: 12, color: '#6b7280' }}>{postfix}</span> : null}
        </div>
      </div>
    )
  }

  const startEdit = () => {
    setEditing(true)
    setError(null)
  }
  const cancelEdit = () => {
    setEditing(false)
    setError(null)
    setProfileInfo({ ...profileInfoOrig })
    setGoals({ ...goalsOrig })
  }
  const save = async () => {
    if (!onSave) return setEditing(false)
    setSaving(true)
    setError(null)
    try {
      await onSave({ profile: profileInfo, goals })
      setEditing(false)
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 95, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '92%', maxWidth: 720, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: 14, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 700, color: '#111827' }}>Profile</div>
            {error ? <div style={{ fontSize: 12, color: '#b91c1c' }}>{error}</div> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onLogout ? (
              <button onClick={onLogout} style={{ border: '1px solid #ef4444', background: '#fee2e2', color: '#b91c1c', borderRadius: 10, padding: '6px 10px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
            ) : null}
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: 20 }}>×</button>
          </div>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Header card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#eef2ff',
              border: '1px solid #e5e7eb',
              display: 'grid',
              placeItems: 'center',
              color: '#4f46e5',
              fontWeight: 800,
              fontSize: 18,
            }}>{(profileInfo?.name || email || 'U').slice(0, 1).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{profileInfo?.name || email || 'User'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{email || '-'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!editing ? (
                <button onClick={startEdit} style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#111827', borderRadius: 10, padding: '6px 10px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              ) : (
                <>
                  <button onClick={cancelEdit} disabled={saving} style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#111827', borderRadius: 10, padding: '6px 10px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={save} disabled={saving} style={{ border: 'none', background: '#10b981', color: '#fff', borderRadius: 10, padding: '6px 10px', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
                </>
              )}
            </div>
          </div>

          {/* Vitals */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Vitals</div>
            {!editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {field('Age', profileInfo?.age)}
                {field('Gender', profileInfo?.gender)}
                {field('Height', profileInfo?.height, { postfix: ' cm' })}
                {field('Weight', profileInfo?.weight, { postfix: ' kg' })}
                {field('Location', profileInfo?.location)}
                {field('Activity Level', profileInfo?.activity_level)}
                {field('Occupation', profileInfo?.occupation)}
                {field('Sleep Duration', profileInfo?.sleep_duration, { postfix: ' h' })}
                {field('Stress Level', profileInfo?.stress_level)}
                {field('Consent Given', profileInfo?.consent_given ? 'Yes' : 'No')}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {input({ label: 'Name', path: 'name', placeholder: 'Your name' })}
                {input({ label: 'Age', path: 'age', type: 'number' })}
                {input({ label: 'Gender', path: 'gender', placeholder: 'male/female/other' })}
                {input({ label: 'Height (cm)', path: 'height', type: 'number', postfix: 'cm' })}
                {input({ label: 'Weight (kg)', path: 'weight', type: 'number', postfix: 'kg' })}
                {input({ label: 'Location', path: 'location' })}
                {input({ label: 'Activity Level', path: 'activity_level', placeholder: 'sedentary/light/moderate/active' })}
                {input({ label: 'Occupation', path: 'occupation' })}
                {input({ label: 'Sleep Duration (h)', path: 'sleep_duration', type: 'number', postfix: 'h' })}
                {input({ label: 'Stress Level', path: 'stress_level', placeholder: 'low/medium/high' })}
              </div>
            )}
          </div>

          {/* Health & Preferences */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Health & Preferences</div>
            {!editing ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Medical Conditions</div>
                  {chipList(profileInfo?.medical_conditions)}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Allergies</div>
                  {chipList(profileInfo?.allergies)}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Dietary Restrictions</div>
                  {chipList(profileInfo?.dietary_restrictions)}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Medications</div>
                  {chipList(profileInfo?.medications)}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Preferred Cuisines</div>
                  {chipList(profileInfo?.preferred_cuisines)}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Dietary Dislikes</div>
                  {chipList(profileInfo?.dietary_dislikes)}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Cooking Skill</div>
                  {chipList(profileInfo?.cooking_skill ? [profileInfo.cooking_skill] : [])}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {input({ label: 'Cooking Skill', path: 'cooking_skill', placeholder: 'beginner/intermediate/advanced' })}
              </div>
            )}
          </div>

          {/* Goals */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Goals</div>
            {!editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {field('Health Goal', goals?.health_goal)}
                {field('Target Weight', goals?.target_weight, { postfix: ' kg' })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {input({ label: 'Health Goal', path: 'goals.health_goal', placeholder: 'weight_loss/muscle_gain' })}
                {input({ label: 'Target Weight (kg)', path: 'goals.target_weight', type: 'number', postfix: 'kg' })}
              </div>
            )}
          </div>

          {/* Meta */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Meta</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {field('Created', fmtDate(createdAt))}
              {field('Updated', fmtDate(updatedAt))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

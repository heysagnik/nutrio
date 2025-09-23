import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PRIMARY } from '../ui'
import { useApi } from '../utils/api'
import { MobileDateScroller, type DayItem } from '../components/MobileDateScroller'
import { MobileMealsList } from '../components/MobileMealsList'
import { MobileNutrition } from '../components/MobileNutrition'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { CoachChat } from '../components/CoachChat'
import type { PlanItem } from '../types/recommendations'
import { MealLogModal } from '../components/MealLogModal'
import { RecipeModal } from '../components/RecipeModal'
import { ProfileModal } from '../components/ProfileModal'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { getDailyPlan, logMealImage, coachChat, getProfile, updateProfile, updateGoals } = useApi()
  const [loggedItems, setLoggedItems] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const PLAN_KEY = (uid: string, iso: string) => `nutrio_plan_${uid}_${iso}`
  const LOGS_KEY = (uid: string, iso: string) => `nutrio_logs_${uid}_${iso}`

  const buildWeek = () => {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const dayIndex = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayIndex)
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      return { d: labels[i], n: d.getDate(), iso, active: d.toDateString() === today.toDateString() } as DayItem
    })
  }

  const [days, setDays] = useState<DayItem[]>(buildWeek())
  const selectedIso = days.find((d) => d.active)?.iso || new Date().toISOString().slice(0, 10)

  const handleSelectDay = (iso: string) => {
    setDays((prev) => prev.map((d) => ({ ...d, active: d.iso === iso })))
  }

  const loadLogs = () => {
    if (!user) return
    try {
      const raw = localStorage.getItem(LOGS_KEY(user.id, selectedIso))
      const arr = raw ? (JSON.parse(raw) as PlanItem[]) : []
      setLoggedItems(Array.isArray(arr) ? arr : [])
    } catch {
      setLoggedItems([])
    }
  }

  const saveLogs = (items: PlanItem[]) => {
    if (!user) return
    localStorage.setItem(LOGS_KEY(user.id, selectedIso), JSON.stringify(items))
  }

  const loadPlanFromCacheOrFetch = async () => {
    if (!user) return
    try {
      const cached = localStorage.getItem(PLAN_KEY(user.id, selectedIso))
      if (cached) return
      const res = await getDailyPlan(selectedIso)
      const items = res.meal_plan.items || []
      localStorage.setItem(PLAN_KEY(user.id, selectedIso), JSON.stringify(items))
    } catch (e: any) {
      // keep silent; plan is optional for UI now
    }
  }

  const recommendedItems = (() => {
    if (!user) return [] as PlanItem[]
    try {
      const raw = localStorage.getItem(PLAN_KEY(user.id, selectedIso))
      const arr = raw ? (JSON.parse(raw) as PlanItem[]) : []
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  })()

  const [recipeOpen, setRecipeOpen] = useState(false)
  const [recipeItem, setRecipeItem] = useState<PlanItem | null>(null)
  const openRecipe = (it: PlanItem) => { setRecipeItem(it); setRecipeOpen(true) }
  const closeRecipe = () => { setRecipeOpen(false); setRecipeItem(null) }

  const refreshAll = async () => {
    setLoading(true)
    setError(null)
    try {
      loadLogs()
      await loadPlanFromCacheOrFetch()
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    return () => {}
  }, [user, selectedIso])

  const handleCamera = () => {
    fileRef.current?.click()
  }

  const [showCoach, setShowCoach] = useState(false)
  const handleCoach = () => setShowCoach(true)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return
    const mealType = window.prompt('Meal type? (breakfast, lunch, dinner, snack)', 'lunch') || 'lunch'
    try {
      setLoading(true)
      const res = await logMealImage({ user_id: user.id, meal_type: mealType, meal_time: new Date().toISOString(), image: file }) as any
      const parsed = res?.parsed_nutritional_data || {}
      const next: PlanItem = {
        id: String(res?.meal_id || Date.now()),
        name: 'Logged Meal',
        meal_type: mealType as any,
        calories: parsed?.calories || 0,
        protein_g: parsed?.protein_g || 0,
        carbs_g: parsed?.carbs_g || 0,
        fat_g: parsed?.fat_g || 0,
        image_url: URL.createObjectURL(file),
      }
      const updated = [next, ...loggedItems]
      setLoggedItems(updated)
      saveLogs(updated)
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
      setLoading(false)
    }
  }

  const totals = (() => {
    const calories = loggedItems.reduce((sum, i) => sum + (i.calories || 0), 0)
    const protein = loggedItems.reduce((sum, i) => sum + (i.protein_g || 0), 0)
    const water = Math.min(10, Math.max(0, loggedItems.length))
    return { calories, protein, water }
  })()

  const LAST_TYPE_KEY = 'nutrio_last_meal_type'
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch')
  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_TYPE_KEY) as any
      if (last === 'breakfast' || last === 'lunch' || last === 'dinner' || last === 'snack') setModalType(last)
    } catch {}
  }, [])
  const openMealType = (t: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setModalType(t)
    setModalOpen(true)
  }
  const closeMealModal = () => setModalOpen(false)
  const itemsForType = (t: string) => loggedItems.filter((i) => (i.meal_type || '').toLowerCase() === t)
  const editMealFromModal = async (item: PlanItem, payload: { foodName: string; amount: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' }) => {
    const updated: PlanItem = { ...item, name: payload.foodName, meal_type: payload.mealType }
    const next = loggedItems.map((i) => (i.id === item.id ? updated : i))
    setLoggedItems(next)
    saveLogs(next)
    localStorage.setItem(LAST_TYPE_KEY, payload.mealType)
  }

  const deleteMealFromModal = async (item: PlanItem) => {
    const next = loggedItems.filter((i) => i.id !== item.id)
    setLoggedItems(next)
    saveLogs(next)
  }

  const [profileOpen, setProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const onOpenProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const p = await getProfile(user.id)
      setProfileData(p)
      setProfileOpen(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const onSaveProfile = async ({ profile, goals }: { profile: any; goals: any }) => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      await updateProfile(user.id, { profile })
      await updateGoals(user.id, goals)
      const refreshed = await getProfile(user.id)
      setProfileData(refreshed)
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#fafbfc',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)'
    }}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
      {/* Mobile Header */}
      <div style={{ 
        position: 'sticky', 
        top: 'env(safe-area-inset-top, 0px)', 
        zIndex: 50, 
        background: '#fff', 
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onOpenProfile} aria-label="Profile" style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}10)`,
              border: `2px solid ${PRIMARY}30`,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              color: PRIMARY,
              fontSize: 16,
              cursor: 'pointer'
            }}>
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </button>
          <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Good Morning
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginTop: 2 }}>
                {user?.name?.split(' ')[0] || 'User'}
              </div>
            </div>
          </div>
          
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            style={{
                width: 44,
                height: 44,
              borderRadius: 12,
                border: 'none',
                background: '#f8fafc',
              display: 'grid',
              placeItems: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
              aria-label="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" 
                  stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444'
              }} />
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div style={{ padding: '16px' }}>
        <MobileDateScroller days={days} onSelect={handleSelectDay} />
        {loading ? (
          <div style={{ fontSize: 13, color: '#6b7280', padding: 12 }}>Loading…</div>
        ) : error ? (
          <div style={{ fontSize: 13, color: '#b91c1c', padding: 12 }}>{error}</div>
        ) : (
          <MobileMealsList items={loggedItems} onAdd={() => openMealType('lunch')} onOpenType={openMealType} />
        )}
        <MobileNutrition
          caloriesConsumed={totals.calories}
          calorieTarget={2000}
          proteinConsumed={totals.protein}
          proteinTarget={100}
          waterConsumed={totals.water}
          waterTarget={10}
        />

        <div style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 12px 0' }}>Recommended Today</h2>
          {recommendedItems.length === 0 ? (
            <div style={{ fontSize: 13, color: '#6b7280' }}>No recommendations cached. They will appear here once available.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {recommendedItems.map((it) => (
                <button key={it.id} onClick={() => openRecipe(it)} style={{ textAlign: 'left', border: '1px solid #e5e7eb', background: '#fff', padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{(it.meal_type || '').toUpperCase()} • {it.calories || 0} kcal</div>
                  </div>
                  <div style={{ fontSize: 20, color: '#d1d5db' }}>›</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav onCamera={handleCamera} onCoach={handleCoach} />

      {showCoach ? (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 70, display: 'grid', gridTemplateRows: 'auto 1fr' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 700, color: '#111827' }}>AI Coach</div>
            <button onClick={() => setShowCoach(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: 22 }}>×</button>
          </div>
          <CoachChat
            userId={user?.id || 'anon'}
            dateIso={selectedIso}
            onSend={async (text) => {
              const res = await coachChat(text)
              return String((res as any)?.response_text || (res as any)?.reply || (res as any)?.message || 'Okay')
            }}
          />
        </div>
                    ) : null}

      <MealLogModal
        open={modalOpen}
        mealType={modalType}
        items={itemsForType(modalType)}
        onClose={closeMealModal}
        onEdit={editMealFromModal}
        onDelete={deleteMealFromModal}
      />

      <RecipeModal open={recipeOpen} item={recipeItem} onClose={closeRecipe} />
      <ProfileModal open={profileOpen} profile={profileData} onClose={() => setProfileOpen(false)} onSave={onSaveProfile} onLogout={() => { setProfileOpen(false); logout(); }} />
    </div>
  )
}




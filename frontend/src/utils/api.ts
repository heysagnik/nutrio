import { useAuth } from '../context/AuthContext'
import type { DailyPlanResponse } from '../types/recommendations'

const API_BASE_URL = 'http://localhost:4000'

type Json = Record<string, unknown>

export function useApi() {
  const { user } = useAuth()
  const authHeader: Record<string, string> = user?.token ? { Authorization: `Bearer ${user.token}` } : {}
  const requireAuth = () => { if (!user) throw new Error('Not authenticated') }

  // Users
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (!res.ok) throw new Error('Login failed')
    return await res.json()
  }
  const register = async (payload: Json) => {
    const res = await fetch(`${API_BASE_URL}/api/users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Registration failed')
    return await res.json()
  }
  const getProfile = async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Profile fetch failed')
    return await res.json()
  }
  const updateProfile = async (userId: string, payload: Json) => {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Profile update failed')
    return await res.json()
  }
  const updateGoals = async (userId: string, payload: Json) => {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/goals`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Goals update failed')
    return await res.json()
  }

  // Data logging
  const logMealText = async (payload: { user_id: string; meal_type: string; food_description: string; portion_size?: string; cooking_method?: string; meal_time: string }) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/data/meals`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Meal log failed')
    return await res.json()
  }
  const logMealImage = async (payload: { user_id: string; meal_type: string; portion_size?: string; cooking_method?: string; meal_time: string; food_description?: string; image: File }) => {
    requireAuth()
    const fd = new FormData()
    Object.entries(payload).forEach(([k, v]) => {
      if (k === 'image') fd.append('image', v as File)
      else if (v != null) fd.append(k, String(v))
    })
    const res = await fetch(`${API_BASE_URL}/api/data/meals`, { method: 'POST', headers: { ...authHeader }, body: fd })
    if (!res.ok) throw new Error('Meal image log failed')
    return await res.json()
  }
  const logActivity = async (payload: { user_id: string; activity_type: string; duration_minutes: number; intensity?: string; activity_date: string }) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/data/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Activity log failed')
    return await res.json()
  }
  const logWeight = async (payload: { user_id: string; weight_kg: number; log_date: string }) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/data/weight`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Weight log failed')
    return await res.json()
  }
  const syncWearables = async (payload: { user_id: string; device_data: Record<string, unknown> }) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/data/wearables/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Wearables sync failed')
    return await res.json()
  }

  // Recommendations
  const getDailyPlan = async (dateIso?: string): Promise<DailyPlanResponse> => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id })
    if (dateIso) params.set('date', dateIso)
    const res = await fetch(`${API_BASE_URL}/api/recommendations/daily-plan?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch daily plan')
    return (await res.json()) as DailyPlanResponse
  }
  const getRecipes = async (filters: { cuisine?: string; meal_type?: string; dietary_restrictions?: string[]; cooking_time?: string }) => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id })
    if (filters.cuisine) params.set('cuisine', filters.cuisine)
    if (filters.meal_type) params.set('meal_type', filters.meal_type)
    if (filters.dietary_restrictions) params.set('dietary_restrictions', JSON.stringify(filters.dietary_restrictions))
    if (filters.cooking_time) params.set('cooking_time', filters.cooking_time)
    const res = await fetch(`${API_BASE_URL}/api/recommendations/recipes?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch recipes')
    return await res.json()
  }
  const swapRecipe = async (payload: { user_id: string; meal_plan_id: string; original_item_id: string; new_item_id: string }) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/recommendations/recipes/swap`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Swap failed')
    return await res.json()
  }
  const getGroceryList = async (start_date: string, end_date: string) => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id, start_date, end_date })
    const res = await fetch(`${API_BASE_URL}/api/recommendations/grocery-list?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch grocery list')
    return await res.json()
  }

  // Progress
  const getWeightHistory = async (start_date: string, end_date: string) => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id, start_date, end_date })
    const res = await fetch(`${API_BASE_URL}/api/progress/weight-history?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch weight history')
    return await res.json()
  }
  const getNutrientSummary = async (time_frame: 'daily' | 'weekly' | 'monthly', start_date: string, end_date: string) => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id, time_frame, start_date, end_date })
    const res = await fetch(`${API_BASE_URL}/api/progress/nutrient-summary?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch nutrient summary')
    return await res.json()
  }
  const getActivitySummary = async (time_frame: 'daily' | 'weekly' | 'monthly', start_date: string, end_date: string) => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id, time_frame, start_date, end_date })
    const res = await fetch(`${API_BASE_URL}/api/progress/activity-summary?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch activity summary')
    return await res.json()
  }
  const getGoalsStatus = async () => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id })
    const res = await fetch(`${API_BASE_URL}/api/progress/goals-status?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch goals status')
    return await res.json()
  }

  // Coach
  const coachChat = async (message_text: string) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/coach/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify({ user_id: user!.id, message_text }) })
    if (!res.ok) throw new Error('Coach chat failed')
    return await res.json()
  }
  const getEducationalContent = async (category: string) => {
    requireAuth()
    const params = new URLSearchParams({ user_id: user!.id, category })
    const res = await fetch(`${API_BASE_URL}/api/coach/educational-content?${params.toString()}`, { headers: { ...authHeader } })
    if (!res.ok) throw new Error('Failed to fetch educational content')
    return await res.json()
  }

  // Feedback
  const rateRecommendation = async (payload: { user_id: string; recommendation_id: string; rating: number; comment?: string }) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/feedback/recommendation-rating`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Rating failed')
    return await res.json()
  }
  const logAdherence = async (payload: { user_id: string; plan_id: string; adherence_status: string }) => {
    requireAuth()
    const res = await fetch(`${API_BASE_URL}/api/feedback/adherence`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Adherence log failed')
    return await res.json()
  }

  // Nutrition search
  const getFoodItem = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/nutrition/food-item/${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error('Food item fetch failed')
    return await res.json()
  }
  const searchFood = async (query_text: string, limit = 10) => {
    const params = new URLSearchParams({ query_text, limit: String(limit) })
    const res = await fetch(`${API_BASE_URL}/api/nutrition/search?${params.toString()}`)
    if (!res.ok) throw new Error('Food search failed')
    return await res.json()
  }

  // Placeholder: backend logged meals listing (not available yet). Return empty list.
  const listLoggedMeals = async (_dateIso: string) => {
    return [] as any[]
  }

  return {
    // users
    login, register, getProfile, updateProfile, updateGoals,
    // data
    logMealText, logMealImage, logActivity, logWeight, syncWearables,
    // recommendations
    getDailyPlan, getRecipes, swapRecipe, getGroceryList,
    // progress
    getWeightHistory, getNutrientSummary, getActivitySummary, getGoalsStatus,
    // coach
    coachChat, getEducationalContent,
    // nutrition
    getFoodItem, searchFood,
    // logs list (placeholder)
    listLoggedMeals,
  }
}

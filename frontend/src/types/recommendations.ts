export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface PlanItem {
  id: string
  name: string
  meal_type: MealType
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  cooking_time?: number
  cuisine?: string
  dietary_restrictions?: string[]
  image_url?: string
}

export interface DailyPlanResponse {
  meal_plan: {
    date: string
    items: PlanItem[]
  }
}

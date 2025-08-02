// Centralized type definitions for the FitNotes app

export interface Category {
  id: number
  name: string
}

export interface WeightUnit {
  id: number
  name: string
}

export interface DistanceUnit {
  id: number
  name: string
}

export interface MeasurementType {
  id: number
  name: string
}

// Exercise interface for different contexts
export interface Exercise {
  id: number
  name: string
  category?: number
  measurement_type?: { name: string }
  categories?: { name: string }
}

export interface Workout {
  id: number
  date: string
  exercise: number
  category: number
  weight?: number
  weight_unit?: number
  reps?: number
  distance?: number
  distance_unit?: number
  time?: string
  comment?: string
  is_pr?: boolean
  exercises?: { name: string }
  categories?: { name: string }
  weight_units?: { name: string }
  distance_units?: { name: string }
}

export interface WorkoutData {
  date: string
  exercise: number
  category: number
  weight?: number | null
  weight_unit?: number | null
  reps?: number | null
  distance?: number | null
  distance_unit?: number | null
  time?: string | null
  comment?: string | null
}
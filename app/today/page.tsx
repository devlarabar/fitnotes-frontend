'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Workout {
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
  exercises?: {
    name: string
  }
  categories?: {
    name: string
  }
  weight_units?: {
    name: string
  }
  distance_units?: {
    name: string
  }
}

interface GroupedWorkout {
  exercise: {
    id: number
    name: string
    category: string
  }
  sets: Workout[]
}

export default function TodayPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchTodaysWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select(`
            *,
            exercises(name),
            categories(name),
            weight_units(name),
            distance_units(name)
          `)
          .eq('date', today)
          .order('exercise', { ascending: true })
          .order('id', { ascending: true })

        if (error) {
          throw error
        }

        setWorkouts(data || [])
        
        // Group workouts by exercise
        const grouped = groupWorkoutsByExercise(data || [])
        setGroupedWorkouts(grouped)
      } catch (err) {
        console.error('Error fetching today\'s workouts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch workouts')
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysWorkouts()
  }, [today])

  const groupWorkoutsByExercise = (workouts: Workout[]): GroupedWorkout[] => {
    const exerciseMap = new Map<number, GroupedWorkout>()
    
    workouts.forEach(workout => {
      if (!exerciseMap.has(workout.exercise)) {
        exerciseMap.set(workout.exercise, {
          exercise: {
            id: workout.exercise,
            name: workout.exercises?.name || 'Unknown Exercise',
            category: workout.categories?.name || 'Unknown Category'
          },
          sets: []
        })
      }
      
      exerciseMap.get(workout.exercise)!.sets.push(workout)
    })
    
    return Array.from(exerciseMap.values())
  }

  const formatWorkoutDetails = (workout: Workout): string => {
    const parts: string[] = []
    
    if (workout.weight) {
      parts.push(`${workout.weight} ${workout.weight_units?.name || ''}`)
    }
    
    if (workout.reps) {
      parts.push(`${workout.reps} reps`)
    }
    
    if (workout.distance) {
      parts.push(`${workout.distance} ${workout.distance_units?.name || ''}`)
    }
    
    if (workout.time) {
      parts.push(`${workout.time}`)
    }
    
    return parts.join(' × ')
  }

  const getTotalSets = () => {
    return groupedWorkouts.reduce((total, group) => total + group.sets.length, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading today&apos;s workouts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading workouts
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Workouts</h1>
              <p className="mt-2 text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link 
                href="/categories" 
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
              >
                + Add Workout
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>

        {/* Summary */}
        {groupedWorkouts.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{groupedWorkouts.length}</div>
              <div className="text-sm text-gray-600">Exercise{groupedWorkouts.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{getTotalSets()}</div>
              <div className="text-sm text-gray-600">Total Set{getTotalSets() !== 1 ? 's' : ''}</div>
            </div>
          </div>
        )}

        {/* Grouped Workouts */}
        {groupedWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏋️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No workouts today</h3>
            <p className="text-gray-500 mb-6">
              Ready to start your workout for today?
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedWorkouts.map((group) => (
              <div key={group.exercise.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Exercise Header */}
                <div className="bg-slate-800 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{group.exercise.name}</h3>
                      <p className="text-slate-300 text-sm">{group.exercise.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{group.sets.length}</div>
                      <div className="text-xs text-slate-300">set{group.sets.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>

                {/* Sets */}
                <div className="divide-y divide-gray-100">
                  {group.sets.map((workout, index) => (
                    <div key={workout.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatWorkoutDetails(workout) || 'Completed'}
                            </div>
                            {workout.comment && (
                              <div className="text-sm text-gray-500 mt-1">
                                {workout.comment}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(`${workout.date}T12:00:00`).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Another Set */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <Link
                    href={`/exercises/${group.exercise.id}/add`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add another set
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {groupedWorkouts.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Different Exercise
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
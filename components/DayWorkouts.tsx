'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { Workout } from '@/lib/types'
import BackButton from './ui/BackButton'
import CommentInput from './CommentInput'

interface GroupedWorkout {
  exercise: {
    id: number
    name: string
    category: string
  }
  sets: Workout[]
}

interface DayWorkoutsProps {
  date: string // Format: YYYY-MM-DD
  title?: string
}

export default function DayWorkouts({ date, title }: DayWorkoutsProps) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    fetchWorkouts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

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

  const handleEditWorkout = (workout: Workout) => {
    // Navigate to the tracking page for this exercise with the current date
    router.push(`/exercises/${workout.exercise}/add?date=${date}`)
  }



  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`*, exercises(name), categories(name), weight_units(name), distance_units(name)`)
        .eq('date', date)
        .order('exercise', { ascending: true })
        .order('id', { ascending: true })

      if (error) { throw error }
      setWorkouts(data || [])
      const grouped = groupWorkoutsByExercise(data || [])
      setGroupedWorkouts(grouped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workouts')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate previous and next day strings
  const getAdjacentDate = (base: string, diff: number) => {
    const d = new Date(base + 'T00:00:00')
    d.setDate(d.getDate() + diff)
    return d.toISOString().slice(0, 10)
  }
  const prevDate = getAdjacentDate(date, -1)
  const nextDate = getAdjacentDate(date, 1)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading workouts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[800px] mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">{title || formatDate(date)}</h1>
              <p className="mt-2 text-gray-600"></p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/categories?date=${date}`}
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
              >
                + Add Workout
              </Link>
              <BackButton>← Home</BackButton>
            </div>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <Button href={`/day/${prevDate}`} variant="outline" size="sm">← Prev</Button>
          <span className="text-gray-700 font-medium">{formatDate(date)}</span>
          <Button href={`/day/${nextDate}`} variant="outline" size="sm">Next →</Button>
        </div>

        {/* Summary */}
        {groupedWorkouts.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 p-[1px] rounded-lg shadow-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{groupedWorkouts.length}</div>
                <div className="text-sm text-gray-600">Exercise{groupedWorkouts.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 p-[1px] rounded-lg shadow-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{getTotalSets()}</div>
                <div className="text-sm text-gray-600">Total Set{getTotalSets() !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <CommentInput date={date} />

        {/* Grouped Workouts */}
        {groupedWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏋️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No workouts {title ? 'today' : 'recorded'}</h3>
            <p className="text-gray-500 mb-6">
              Get the fuck up, dude.
            </p>
            <Button
              href={`/categories?date=${date}`}
              variant="secondary"
              size="lg"
            >
              Start Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedWorkouts.map((group) => (
              <div key={group.exercise.id} className="bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 p-[1px] rounded-lg shadow-sm">
                <div className="bg-white rounded-lg overflow-hidden">
                  {/* Exercise Header */}
                  <div className="bg-purple-100 text-purple-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{group.exercise.name}</h3>
                        <p className="text-purple-600 text-sm">{group.exercise.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{group.sets.length}</div>
                        <div className="text-xs text-purple-600">set{group.sets.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* Sets */}
                  <div className="divide-y divide-gray-100">
                    {group.sets.map((workout, index) => (
                      <div
                        key={workout.id}
                        className="px-6 py-4 hover:bg-purple-50 cursor-pointer transition-colors"
                        onClick={() => handleEditWorkout(workout)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-100 to-purple-100 text-purple-700 text-sm font-medium">
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
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-400">
                              {new Date(`${workout.date}T12:00:00`).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-purple-500">
                              <FontAwesomeIcon icon={faEdit} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Another Set */}
                  <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
                    <Button
                      href={`/exercises/${group.exercise.id}/add?date=${date}`}
                      variant="ghost"
                      size="sm"
                    >
                      + Add another set
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {groupedWorkouts.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              href={`/categories?date=${date}`}
              variant="secondary"
              size="lg"
            >
              Add Exercise
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedLayout from '@/components/ProtectedLayout'
import Button from '@/components/ui/Button'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Exercise, WeightUnit, DistanceUnit, WorkoutData } from '@/lib/types'
import GradientBorderContainer from '@/components/ui/GradientBorderContainer'
import BackButton from '@/components/ui/BackButton'

export default function AddWorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const exerciseId = params.id as string
  const dateParam = searchParams.get('date')

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [weightUnits, setWeightUnits] = useState<WeightUnit[]>([])
  const [distanceUnits, setDistanceUnits] = useState<DistanceUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    date: dateParam || new Date().toISOString().split('T')[0], // Use date parameter or today's date
    weight: '',
    weight_unit: '',
    reps: '',
    distance: '',
    distance_unit: '',
    time: '',
    comment: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exercise info
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select(`
            id,
            name,
            category,
            measurement_type:measurement_types(name),
            categories(name)
          `)
          .eq('id', exerciseId)
          .single()

        if (exerciseError) {
          throw exerciseError
        }

        // Fetch weight units
        const { data: weightData, error: weightError } = await supabase
          .from('weight_units')
          .select('id, name')
          .order('name')

        if (weightError) {
          throw weightError
        }

        // Fetch distance units
        const { data: distanceData, error: distanceError } = await supabase
          .from('distance_units')
          .select('id, name')
          .order('name')

        if (distanceError) {
          throw distanceError
        }

        setExercise(exerciseData as unknown as Exercise)
        setWeightUnits(weightData || [])
        setDistanceUnits(distanceData || [])

        // Set default units
        if (weightData?.length > 0) {
          setFormData(prev => ({ ...prev, weight_unit: weightData[0].id.toString() }))
        }
        if (distanceData?.length > 0) {
          setFormData(prev => ({ ...prev, distance_unit: distanceData[0].id.toString() }))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch exercise data')
      } finally {
        setLoading(false)
      }
    }

    if (exerciseId) {
      fetchData()
    }
  }, [exerciseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!exercise) {
        throw new Error('Exercise data not found')
      }

      const workoutData: WorkoutData = {
        date: formData.date,
        exercise: parseInt(exerciseId),
        category: exercise?.category || 0,
        comment: formData.comment || ''
      }

      // Add measurement-specific fields
      if (formData.weight) {
        workoutData.weight = parseFloat(formData.weight)
        workoutData.weight_unit = parseInt(formData.weight_unit)
      }

      if (formData.reps) {
        workoutData.reps = parseInt(formData.reps)
      }

      if (formData.distance) {
        workoutData.distance = parseFloat(formData.distance)
        workoutData.distance_unit = parseInt(formData.distance_unit)
      }

      if (formData.time) {
        workoutData.time = formData.time
      }

      const { error } = await supabase
        .from('workouts')
        .insert(workoutData)

      if (error) {
        throw error
      }

      // Success! Redirect to the day's workouts page
      router.push(`/day/${workoutData.date}`)
    } catch (err) {
      console.error('Error saving workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to save workout')
    } finally {
      setSubmitting(false)
    }
  }

  const measurementType = exercise?.measurement_type?.name

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exercise...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !exercise) {
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
                  Error loading exercise
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
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Workout</h1>
                <p className="mt-2 text-gray-600">
                  {exercise?.name} • {exercise?.categories?.name}
                </p>
              </div>
              <BackButton>← Back to Exercises</BackButton>
            </div>
          </div>

          {/* Form */}
          <GradientBorderContainer>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>



              {/* Weight & Reps (for reps-based exercises) */}
              {measurementType === 'reps' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="weight"
                        step="0.5"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="25"
                      />
                      <select
                        value={formData.weight_unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight_unit: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {weightUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-2">
                      Reps
                    </label>
                    <input
                      type="number"
                      id="reps"
                      min="1"
                      required
                      value={formData.reps}
                      onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12"
                    />
                  </div>
                </div>
              )}

              {/* Distance & Time (for distance-based exercises) */}
              {measurementType === 'distance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                      Distance
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="distance"
                        step="0.1"
                        min="0"
                        required
                        value={formData.distance}
                        onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="5.0"
                      />
                      <select
                        value={formData.distance_unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, distance_unit: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {distanceUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Time (optional)
                    </label>
                    <input
                      type="text"
                      id="time"
                      pattern="^[0-9]+:[0-5][0-9]:[0-5][0-9]$"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00:30:00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: HH:MM:SS (e.g., 00:30:00)
                    </p>
                  </div>
                </div>
              )}

              {/* Time (for time-based exercises) */}
              {measurementType === 'time' && (
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time (HH:MM:SS)
                  </label>
                  <input
                    type="text"
                    id="time"
                    required
                    pattern="^[0-9]+:[0-5][0-9]:[0-5][0-9]$"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="00:30:00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: hours:minutes:seconds (e.g., 00:30:00 for 30 minutes)
                  </p>
                </div>
              )}

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Felt good today, increased weight..."
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="rainbow"
                  className="flex-1"
                >
                  {submitting ? 'Saving...' : 'Save Workout'}
                </Button>

                <Button
                  href={`/categories/${exercise?.category || ''}`}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </GradientBorderContainer>
        </div>
      </div>
    </ProtectedLayout>
  )
}
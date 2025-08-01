'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons'

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
  exercises?: { name: string }
  categories?: { name: string }
  weight_units?: { name: string }
  distance_units?: { name: string }
}

interface WeightUnit {
  id: number
  name: string
}

interface DistanceUnit {
  id: number
  name: string
}

interface EditWorkoutModalProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditWorkoutModal({ workout, isOpen, onClose, onSuccess }: EditWorkoutModalProps) {
  const [weightUnits, setWeightUnits] = useState<WeightUnit[]>([])
  const [distanceUnits, setDistanceUnits] = useState<DistanceUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [measurementType, setMeasurementType] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    weight: '',
    weight_unit: '',
    reps: '',
    distance: '',
    distance_unit: '',
    time: '',
    comment: ''
  })

  useEffect(() => {
    if (workout && isOpen) {
      // Pre-populate form with workout data
      setFormData({
        date: workout.date,
        weight: workout.weight?.toString() || '',
        weight_unit: workout.weight_unit?.toString() || '',
        reps: workout.reps?.toString() || '',
        distance: workout.distance?.toString() || '',
        distance_unit: workout.distance_unit?.toString() || '',
        time: workout.time || '',
        comment: workout.comment || ''
      })

      // Fetch measurement type and units
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout, isOpen])

  const fetchData = async () => {
    if (!workout) return

    try {
      // Get measurement type for this exercise
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('measurement_type, measurement_types(name)')
        .eq('id', workout.exercise)
        .single()

      if (exerciseError) throw exerciseError
      setMeasurementType(exerciseData.measurement_types?.[0]?.name || '')

      // Fetch units
      const [weightResponse, distanceResponse] = await Promise.all([
        supabase.from('weight_units').select('id, name').order('name'),
        supabase.from('distance_units').select('id, name').order('name')
      ])

      if (weightResponse.error) throw weightResponse.error
      if (distanceResponse.error) throw distanceResponse.error

      setWeightUnits(weightResponse.data || [])
      setDistanceUnits(distanceResponse.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workout) return

    setLoading(true)
    setError(null)

    try {
      const updateData: Partial<Workout> = {
        date: formData.date,
        comment: formData.comment || ''
      }

      // Add measurement-specific fields
      if (formData.weight) {
        updateData.weight = parseFloat(formData.weight)
        updateData.weight_unit = parseInt(formData.weight_unit)
      }

      if (formData.reps) {
        updateData.reps = parseInt(formData.reps)
      }

      if (formData.distance) {
        updateData.distance = parseFloat(formData.distance)
        updateData.distance_unit = parseInt(formData.distance_unit)
      }

      if (formData.time) {
        updateData.time = formData.time
      }

      const { error } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', workout.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error updating workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to update workout')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!workout || !confirm('Are you sure you want to delete this workout?')) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workout.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error deleting workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete workout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Edit Workout</h2>
          <p className="text-sm text-gray-600">{workout?.exercises?.name}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:cursor-pointer text-xl"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
          />
        </div>

        {/* Weight & Reps (for reps-based exercises) */}
        {measurementType === 'reps' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="weight"
                  step="0.5"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
                <select
                  value={formData.weight_unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight_unit: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                >
                  {weightUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-1">
                Reps
              </label>
              <input
                type="number"
                id="reps"
                min="1"
                required
                value={formData.reps}
                onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* Distance (for distance-based exercises) */}
        {measurementType === 'distance' && (
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
              <select
                value={formData.distance_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, distance_unit: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                {distanceUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Time (for time-based exercises) */}
        {measurementType === 'time' && (
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time (HH:MM:SS)
            </label>
            <input
              type="text"
              id="time"
              required
              pattern="^[0-9]+:[0-5][0-9]:[0-5][0-9]$"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              placeholder="00:30:00"
            />
          </div>
        )}

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            id="comment"
            rows={3}
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            placeholder="Notes about this set..."
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            variant="secondary"
            className="flex-1"
          >
            {loading ? '💫 Saving...' : '✨ Save Changes'}
          </Button>

                     <Button
             type="button"
             onClick={handleDelete}
             variant="outline"
             disabled={loading}
             className="border-red-300 text-red-600 hover:bg-red-50"
           >
             <FontAwesomeIcon icon={faTrash} className="mr-2" />
             Delete
           </Button>

          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
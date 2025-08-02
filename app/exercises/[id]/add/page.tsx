'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedLayout from '@/components/ProtectedLayout'
import { useParams, useSearchParams } from 'next/navigation'
import { Exercise, WeightUnit, DistanceUnit, WorkoutData, Workout } from '@/lib/types'
import BackButton from '@/components/ui/BackButton'
import Modal from '@/components/ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'

function AddWorkoutContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const exerciseId = params.id as string
  const dateParam = searchParams.get('date')

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [weightUnits, setWeightUnits] = useState<WeightUnit[]>([])
  const [distanceUnits, setDistanceUnits] = useState<DistanceUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sets, setSets] = useState<Workout[]>([])

  // Edit mode state
  const [editingSetId, setEditingSetId] = useState<number | null>(null)

  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [commentingSetId, setCommentingSetId] = useState<number | null>(null)
  const [commentText, setCommentText] = useState('')

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingSetId, setDeletingSetId] = useState<number | null>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<'TRACK' | 'HISTORY' | 'GRAPH'>('TRACK')
  const [allSets, setAllSets] = useState<Workout[]>([])

  // Tracking state for current set
  const [currentSet, setCurrentSet] = useState({
    date: dateParam || new Date().toISOString().split('T')[0],
    weight: 0,
    weight_unit: '',
    reps: 1,
    distance: 0,
    distance_unit: '',
    time: '',
    comment: ''
  })

  const fetchSets = useCallback(async () => {
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
        .eq('exercise', exerciseId)
        .eq('date', currentSet.date)
        .order('id', { ascending: true })

      if (error) throw error
      setSets(data || [])
    } catch (err) {
      console.error('Error fetching sets:', err)
    }
  }, [exerciseId, currentSet.date])

  const fetchAllSets = useCallback(async () => {
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
        .eq('exercise', exerciseId)
        .order('date', { ascending: false })
        .order('id', { ascending: true })

      if (error) throw error
      setAllSets(data || [])
    } catch (err) {
      console.error('Error fetching all sets:', err)
    }
  }, [exerciseId])

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
          setCurrentSet(prev => ({ ...prev, weight_unit: weightData[0].id.toString() }))
        }
        if (distanceData?.length > 0) {
          setCurrentSet(prev => ({ ...prev, distance_unit: distanceData[0].id.toString() }))
        }

        // Fetch existing sets for this exercise on this date
        await fetchSets()
        // Also fetch all sets for history/graph tabs
        await fetchAllSets()
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
  }, [exerciseId, fetchSets, fetchAllSets])

  const saveSet = async () => {
    setSaving(true)
    setError(null)

    try {
      if (!exercise) {
        throw new Error('Exercise data not found')
      }

      const workoutData: WorkoutData = {
        date: currentSet.date,
        exercise: parseInt(exerciseId),
        category: exercise?.category || 0,
        comment: currentSet.comment || ''
      }

      // Add measurement-specific fields based on measurement type
      const measurementType = exercise?.measurement_type?.name

      if (measurementType === 'reps') {
        workoutData.reps = currentSet.reps
        if (currentSet.weight > 0) {
          workoutData.weight = currentSet.weight
          workoutData.weight_unit = parseInt(currentSet.weight_unit)
        }
      }

      if (measurementType === 'distance') {
        workoutData.distance = currentSet.distance
        workoutData.distance_unit = parseInt(currentSet.distance_unit)
        if (currentSet.time) {
          workoutData.time = currentSet.time
        }
      }

      if (measurementType === 'time') {
        workoutData.time = currentSet.time
      }

      let error
      if (editingSetId) {
        // Update existing set
        const result = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', editingSetId)
        error = result.error
      } else {
        // Insert new set
        const result = await supabase
          .from('workouts')
          .insert(workoutData)
        error = result.error
      }

      if (error) throw error

      // Refresh sets list
      await fetchSets()
      await fetchAllSets()

      // Reset edit mode and current set for next entry
      setEditingSetId(null)
      if (measurementType === 'reps') {
        setCurrentSet(prev => ({ ...prev, reps: 1, comment: '' }))
      } else if (measurementType === 'distance') {
        setCurrentSet(prev => ({ ...prev, distance: 0, time: '', comment: '' }))
      } else if (measurementType === 'time') {
        setCurrentSet(prev => ({ ...prev, time: '', comment: '' }))
      }

    } catch (err) {
      console.error('Error saving set:', err)
      setError(err instanceof Error ? err.message : 'Failed to save set')
    } finally {
      setSaving(false)
    }
  }

  const clearSet = () => {
    const measurementType = exercise?.measurement_type?.name
    setEditingSetId(null)
    if (measurementType === 'reps') {
      setCurrentSet(prev => ({ ...prev, weight: 0, reps: 1, comment: '' }))
    } else if (measurementType === 'distance') {
      setCurrentSet(prev => ({ ...prev, distance: 0, time: '', comment: '' }))
    } else if (measurementType === 'time') {
      setCurrentSet(prev => ({ ...prev, time: '', comment: '' }))
    }
  }

  const handleSetClick = (set: Workout) => {
    // If clicking on the same set that's already being edited, deselect it
    if (editingSetId === set.id) {
      clearSet()
      return
    }

    const measurementType = exercise?.measurement_type?.name
    setEditingSetId(set.id)

    if (measurementType === 'reps') {
      setCurrentSet(prev => ({
        ...prev,
        weight: set.weight || 0,
        weight_unit: set.weight_unit?.toString() || prev.weight_unit,
        reps: set.reps || 1,
        comment: set.comment || ''
      }))
    } else if (measurementType === 'distance') {
      setCurrentSet(prev => ({
        ...prev,
        distance: set.distance || 0,
        distance_unit: set.distance_unit?.toString() || prev.distance_unit,
        time: set.time || '',
        comment: set.comment || ''
      }))
    } else if (measurementType === 'time') {
      setCurrentSet(prev => ({
        ...prev,
        time: set.time || '',
        comment: set.comment || ''
      }))
    }
  }

  const handleCommentClick = (e: React.MouseEvent, set: Workout) => {
    e.stopPropagation()
    setCommentingSetId(set.id)
    setCommentText(set.comment || '')
    setCommentModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, set: Workout) => {
    e.stopPropagation()
    setDeletingSetId(set.id)
    setDeleteModalOpen(true)
  }

  const saveComment = async () => {
    if (!commentingSetId) return

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ comment: commentText })
        .eq('id', commentingSetId)

      if (error) throw error

      await fetchSets()
      await fetchAllSets()
      setCommentModalOpen(false)
      setCommentingSetId(null)
      setCommentText('')
    } catch (err) {
      console.error('Error saving comment:', err)
      setError(err instanceof Error ? err.message : 'Failed to save comment')
    }
  }

  const deleteSet = async () => {
    if (!deletingSetId) return

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', deletingSetId)

      if (error) throw error

      await fetchSets()
      await fetchAllSets()
      setDeleteModalOpen(false)
      setDeletingSetId(null)

      // If we were editing this set, clear edit mode
      if (editingSetId === deletingSetId) {
        clearSet()
      }
    } catch (err) {
      console.error('Error deleting set:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete set')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[600px] mx-auto">
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
        <div className="max-w-[600px] mx-auto">
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[600px] mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exercise?.name}</h1>
              <p className="mt-1 text-gray-600">{exercise?.categories?.name}</p>
            </div>
            <BackButton>← Back</BackButton>
          </div>
        </div>

        {/* Tab Navigation - Right at the top! */}
        <div className="bg-white rounded-t-lg shadow-md border-2 border-gray-300 border-b-0 mb-0 relative z-10">
          <div className="flex border-b border-gray-200">
            {(['TRACK', 'HISTORY', 'GRAPH'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-sm font-bold transition-colors relative ${activeTab === tab
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-md border-2 border-gray-300 border-t-0 overflow-hidden relative z-10">
          {activeTab === 'TRACK' && (
            <TrackTab
              currentSet={currentSet}
              setCurrentSet={setCurrentSet}
              saveSet={saveSet}
              clearSet={clearSet}
              saving={saving}
              error={error}
              sets={sets}
              editingSetId={editingSetId}
              handleSetClick={handleSetClick}
              handleCommentClick={handleCommentClick}
              handleDeleteClick={handleDeleteClick}
              exercise={exercise}
              weightUnits={weightUnits}
              distanceUnits={distanceUnits}
              fetchSets={fetchSets}
            />
          )}

          {activeTab === 'HISTORY' && (
            <HistoryTab
              allSets={allSets}
              exercise={exercise}
            />
          )}

          {activeTab === 'GRAPH' && (
            <GraphTab
              allSets={allSets}
              exercise={exercise}
            />
          )}
        </div>

        {/* Comment Modal */}
        <Modal isOpen={commentModalOpen} onClose={() => setCommentModalOpen(false)} maxWidth="sm">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add a note about this set..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveComment}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => setCommentModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Set</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this set? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={deleteSet}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

// TrackTab Component
interface TrackTabProps {
  currentSet: {
    date: string
    weight: number
    weight_unit: string
    reps: number
    distance: number
    distance_unit: string
    time: string
    comment: string
  }
  setCurrentSet: React.Dispatch<React.SetStateAction<{
    date: string
    weight: number
    weight_unit: string
    reps: number
    distance: number
    distance_unit: string
    time: string
    comment: string
  }>>
  saveSet: () => void
  clearSet: () => void
  saving: boolean
  error: string | null
  sets: Workout[]
  editingSetId: number | null
  handleSetClick: (set: Workout) => void
  handleCommentClick: (e: React.MouseEvent, set: Workout) => void
  handleDeleteClick: (e: React.MouseEvent, set: Workout) => void
  exercise: Exercise | null
  weightUnits: WeightUnit[]
  distanceUnits: DistanceUnit[]
  fetchSets: () => void
}

function TrackTab({
  currentSet,
  setCurrentSet,
  saveSet,
  clearSet,
  saving,
  error,
  sets,
  editingSetId,
  handleSetClick,
  handleCommentClick,
  handleDeleteClick,
  exercise,
  weightUnits,
  distanceUnits,
  fetchSets
}: TrackTabProps) {
  const measurementType = exercise?.measurement_type?.name

  return (
    <div className="p-6">
      {/* Date Selection */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={currentSet.date}
          onChange={(e) => {
            setCurrentSet(prev => ({ ...prev, date: e.target.value }))
            // Refresh sets when date changes
            setTimeout(() => fetchSets(), 100)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Weight & Reps Tracking (for reps-based exercises) */}
      {measurementType === 'reps' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WEIGHT ({weightUnits.find(u => u.id === parseInt(currentSet.weight_unit))?.name || 'kg'}):
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentSet(prev => ({ ...prev, weight: Math.max(0, prev.weight - 2.5) }))}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center text-xl font-bold"
              >
                −
              </button>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={currentSet.weight}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                />
              </div>
              <button
                type="button"
                onClick={() => setCurrentSet(prev => ({ ...prev, weight: prev.weight + 2.5 }))}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              REPS:
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentSet(prev => ({ ...prev, reps: Math.max(1, prev.reps - 1) }))}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center text-xl font-bold"
              >
                −
              </button>
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  value={currentSet.reps}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: parseInt(e.target.value) || 1 }))}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                />
              </div>
              <button
                type="button"
                onClick={() => setCurrentSet(prev => ({ ...prev, reps: prev.reps + 1 }))}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distance & Time Tracking (for distance-based exercises) */}
      {measurementType === 'distance' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DISTANCE ({distanceUnits.find(u => u.id === parseInt(currentSet.distance_unit))?.name || 'km'}):
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentSet(prev => ({ ...prev, distance: Math.max(0, prev.distance - 0.1) }))}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center text-xl font-bold"
              >
                −
              </button>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={currentSet.distance}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                />
              </div>
              <button
                type="button"
                onClick={() => setCurrentSet(prev => ({ ...prev, distance: prev.distance + 0.1 }))}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TIME (HH:MM:SS):
            </label>
            <input
              type="text"
              pattern="^[0-9]+:[0-5][0-9]:[0-5][0-9]$"
              value={currentSet.time}
              onChange={(e) => setCurrentSet(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl"
              placeholder="00:30:00"
            />
          </div>
        </div>
      )}

      {/* Time Tracking (for time-based exercises) */}
      {measurementType === 'time' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TIME (HH:MM:SS):
          </label>
          <input
            type="text"
            pattern="^[0-9]+:[0-5][0-9]:[0-5][0-9]$"
            value={currentSet.time}
            onChange={(e) => setCurrentSet(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl"
            placeholder="00:30:00"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={saveSet}
          disabled={saving}
          className={`flex-1 font-medium py-3 px-4 rounded-md disabled:opacity-50 text-white ${editingSetId
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
        >
          {saving ? 'SAVING...' : editingSetId ? 'UPDATE' : 'SAVE'}
        </button>
        <button
          type="button"
          onClick={clearSet}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md"
        >
          CLEAR
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Sets History */}
      {sets.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Today&apos;s Sets</h3>
          <div className="space-y-2">
            {sets.map((set, index) => (
              <div
                key={set.id}
                className={`flex items-center justify-between bg-gray-50 p-3 rounded border cursor-pointer hover:bg-gray-100 transition-colors ${editingSetId === set.id ? 'ring-2 ring-green-400 bg-green-50' : ''
                  }`}
                onClick={() => handleSetClick(set)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className={`flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full ${editingSetId === set.id ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {index + 1}
                  </span>
                  <div className="text-sm">
                    {measurementType === 'reps' && (
                      <span>
                        {set.weight ? `${set.weight} ${set.weight_units?.name || ''} × ` : ''}
                        {set.reps} reps
                      </span>
                    )}
                    {measurementType === 'distance' && (
                      <span>
                        {set.distance} {set.distance_units?.name || ''}
                        {set.time && ` in ${set.time}`}
                      </span>
                    )}
                    {measurementType === 'time' && (
                      <span>{set.time}</span>
                    )}
                  </div>
                  {set.comment && (
                    <div className="text-xs text-gray-500 italic truncate max-w-32">
                      &ldquo;{set.comment}&rdquo;
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleCommentClick(e, set)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Add/edit comment"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, set)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete set"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-gray-500 min-w-16 text-right">
                    {new Date(`${set.date}T12:00:00`).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// HistoryTab Component
interface HistoryTabProps {
  allSets: Workout[]
  exercise: Exercise | null
}

function HistoryTab({ allSets, exercise }: HistoryTabProps) {
  const measurementType = exercise?.measurement_type?.name

  // Group sets by date
  const setsByDate = allSets.reduce((acc: Record<string, Workout[]>, set) => {
    if (!acc[set.date]) {
      acc[set.date] = []
    }
    acc[set.date].push(set)
    return acc
  }, {})

  const dates = Object.keys(setsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Exercise History</h3>

      {dates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
          <p className="text-gray-500">
            Start tracking this exercise to see your progress over time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <div key={date} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <span className="text-sm text-gray-500">
                  {setsByDate[date].length} set{setsByDate[date].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {setsByDate[date].map((set, index) => (
                  <div key={set.id} className="flex items-center gap-3 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {index + 1}
                    </span>
                    <div>
                      {measurementType === 'reps' && (
                        <span>
                          {set.weight ? `${set.weight} ${set.weight_units?.name || ''} × ` : ''}
                          {set.reps} reps
                        </span>
                      )}
                      {measurementType === 'distance' && (
                        <span>
                          {set.distance} {set.distance_units?.name || ''}
                          {set.time && ` in ${set.time}`}
                        </span>
                      )}
                      {measurementType === 'time' && (
                        <span>{set.time}</span>
                      )}
                    </div>
                    {set.comment && (
                      <div className="text-xs text-gray-500 italic">
                        &ldquo;{set.comment}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// GraphTab Component
interface GraphTabProps {
  allSets: Workout[]
  exercise: Exercise | null
}

function GraphTab({ allSets, exercise }: GraphTabProps) {
  const measurementType = exercise?.measurement_type?.name

  // Calculate stats
  const totalSets = allSets.length
  const uniqueDates = new Set(allSets.map(set => set.date)).size

  let maxWeight = 0
  let maxReps = 0
  let maxDistance = 0

  if (measurementType === 'reps') {
    maxWeight = Math.max(...allSets.map(set => set.weight || 0))
    maxReps = Math.max(...allSets.map(set => set.reps || 0))
  } else if (measurementType === 'distance') {
    maxDistance = Math.max(...allSets.map(set => set.distance || 0))
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Overview</h3>

      {allSets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-500">
            Complete some workouts to see your progress charts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{totalSets}</div>
              <div className="text-sm text-blue-800">Total Sets</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{uniqueDates}</div>
              <div className="text-sm text-green-800">Workout Days</div>
            </div>
          </div>

          {/* Personal Records */}
          {measurementType === 'reps' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{maxWeight}</div>
                <div className="text-sm text-purple-800">Max Weight</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{maxReps}</div>
                <div className="text-sm text-orange-800">Max Reps</div>
              </div>
            </div>
          )}

          {measurementType === 'distance' && (
            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-600">{maxDistance}</div>
              <div className="text-sm text-cyan-800">Max Distance</div>
            </div>
          )}

          {/* Placeholder for future charts */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-500">
              Progress charts coming soon!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AddWorkoutPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-[600px] mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading exercise...</p>
            </div>
          </div>
        </div>
      }>
        <AddWorkoutContent />
      </Suspense>
    </ProtectedLayout>
  )
}
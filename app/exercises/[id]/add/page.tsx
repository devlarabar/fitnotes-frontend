'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useSearchParams } from 'next/navigation'
import { Exercise, WeightUnit, DistanceUnit, WorkoutData, Workout } from '@/lib/types'
import BackButton from '@/components/ui/BackButton'
import Modal from '@/components/ui/Modal'
import ExerciseTabs from '@/components/exercise/ExerciseTabs'
import Button from '@/components/ui/Button'
import SuspenseFallback from '@/components/misc/SuspenseFallback'

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
        setLoading(true)

        // Fetch exercise details
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select(`
            *,
            categories(name),
            measurement_type:measurement_types(name)
          `)
          .eq('id', exerciseId)
          .single()

        if (exerciseError) throw exerciseError
        setExercise(exerciseData)

        // Set default units for new exercises
        setCurrentSet(prev => ({
          ...prev,
          weight_unit: '1', // kg
          distance_unit: '1', // km
        }))

        // Fetch weight and distance units
        const [weightUnitsResponse, distanceUnitsResponse] = await Promise.all([
          supabase.from('weight_units').select('*').order('name'),
          supabase.from('distance_units').select('*').order('name')
        ])

        if (weightUnitsResponse.error) throw weightUnitsResponse.error
        if (distanceUnitsResponse.error) throw distanceUnitsResponse.error

        setWeightUnits(weightUnitsResponse.data || [])
        setDistanceUnits(distanceUnitsResponse.data || [])

        // Fetch today's sets and all sets
        await Promise.all([fetchSets(), fetchAllSets()])

      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load exercise data')
      } finally {
        setLoading(false)
      }
    }

    if (exerciseId) {
      fetchData()
    }
  }, [exerciseId, fetchSets, fetchAllSets])

  const saveSet = async () => {
    if (!exercise) return

    try {
      setSaving(true)
      setError(null)

      const workoutData: WorkoutData = {
        date: currentSet.date,
        exercise: parseInt(exerciseId),
        category: exercise.category!,
        weight: exercise.measurement_type?.name === 'reps' ? currentSet.weight : null,
        weight_unit: exercise.measurement_type?.name === 'reps' ? parseInt(currentSet.weight_unit) : null,
        reps: exercise.measurement_type?.name === 'reps' ? currentSet.reps : null,
        distance: exercise.measurement_type?.name === 'distance' ? currentSet.distance : null,
        distance_unit: exercise.measurement_type?.name === 'distance' ? parseInt(currentSet.distance_unit) : null,
        time: (exercise.measurement_type?.name === 'distance' || exercise.measurement_type?.name === 'time') ? currentSet.time : null,
        comment: currentSet.comment || null
      }

      let result
      if (editingSetId) {
        // Update existing set
        result = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', editingSetId)
          .select()
      } else {
        // Insert new set
        result = await supabase
          .from('workouts')
          .insert([workoutData])
          .select()
      }

      if (result.error) throw result.error

      // Refresh both sets and allSets
      await Promise.all([fetchSets(), fetchAllSets()])

      // Keep the form values as-is after saving

      // Clear edit mode
      setEditingSetId(null)

    } catch (err) {
      console.error('Error saving set:', err)
      setError('Failed to save set')
    } finally {
      setSaving(false)
    }
  }

  const clearSet = () => {
    // Only clear editing state, keep input values
    setEditingSetId(null)
    setError(null)
  }

  const handleSetClick = (set: Workout) => {
    if (editingSetId === set.id) {
      // If the same set is clicked again, clear the form
      clearSet()
      return
    }

    // Populate the form with the set's data
    setCurrentSet(prev => ({
      ...prev,
      weight: set.weight || 0,
      reps: set.reps || 1,
      distance: set.distance || 0,
      time: set.time || '',
      comment: set.comment || ''
    }))
    setEditingSetId(set.id)
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
        .update({ comment: commentText || null })
        .eq('id', commentingSetId)

      if (error) throw error

      // Refresh both sets and allSets
      await Promise.all([fetchSets(), fetchAllSets()])

      setCommentModalOpen(false)
      setCommentingSetId(null)
      setCommentText('')
    } catch (err) {
      console.error('Error saving comment:', err)
      setError('Failed to save comment')
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

      // If we were editing this set, clear the edit mode
      if (editingSetId === deletingSetId) {
        clearSet()
      }

      // Refresh both sets and allSets
      await Promise.all([fetchSets(), fetchAllSets()])

      setDeleteModalOpen(false)
      setDeletingSetId(null)
    } catch (err) {
      console.error('Error deleting set:', err)
      setError('Failed to delete set')
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

        {/* Exercise Tabs */}
        <ExerciseTabs
          currentSet={currentSet}
          setCurrentSet={setCurrentSet}
          saveSet={saveSet}
          clearSet={clearSet}
          saving={saving}
          error={error}
          sets={sets}
          allSets={allSets}
          editingSetId={editingSetId}
          handleSetClick={handleSetClick}
          handleCommentClick={handleCommentClick}
          handleDeleteClick={handleDeleteClick}
          exercise={exercise}
          weightUnits={weightUnits}
          distanceUnits={distanceUnits}
          fetchSets={fetchSets}
        />

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
              <Button
                onClick={saveComment}
                variant="primary"
                className="flex-1"
              >
                Save
              </Button>
              <Button
                onClick={() => setCommentModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
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
              <Button
                onClick={deleteSet}
                variant="danger"
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                onClick={() => setDeleteModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default function AddWorkoutPage() {
  return (
    <SuspenseFallback>
      <AddWorkoutContent />
    </SuspenseFallback>
  )
}
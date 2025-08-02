'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedLayout from '@/components/ProtectedLayout'
import { useParams, useSearchParams } from 'next/navigation'
import { Exercise, WeightUnit, DistanceUnit, WorkoutData, Workout } from '@/lib/types'
import BackButton from '@/components/ui/BackButton'
import Modal from '@/components/ui/Modal'
import TrackTab from '@/components/exercise/TrackTab'
import HistoryTab from '@/components/exercise/HistoryTab'
import GraphTab from '@/components/exercise/GraphTab'

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

      // Clear the form if it was a new set
      if (!editingSetId) {
        setCurrentSet(prev => ({
          ...prev,
          weight: 0,
          reps: 1,
          distance: 0,
          time: '',
          comment: ''
        }))
      }

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
    setCurrentSet(prev => ({
      ...prev,
      weight: 0,
      reps: 1,
      distance: 0,
      time: '',
      comment: ''
    }))
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg shadow-md border-2 border-gray-300 border-b-0 mb-0 relative z-10">
          <div className="flex border-b border-gray-200">
            {(['TRACK', 'HISTORY', 'GRAPH'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`hover:cursor-pointer flex-1 py-4 px-6 text-sm font-bold transition-colors relative ${activeTab === tab
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
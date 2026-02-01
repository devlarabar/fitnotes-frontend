'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'

import { useRouter } from 'next/navigation'
import { DayWorkoutsProps, GroupedWorkout, Workout } from '@/lib/types'
import CommentInput from './CommentInput'
import CustomSpinner from './ui/Spinner'
import GroupedExercises from './exercise/GroupedExercises'
import { ErrorPageCallout } from './ui/Callout'
import PageWrapper from './ui/PageWrapper'
import { WeightIcon } from 'lucide-react'


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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  if (loading) { return <CustomSpinner /> }
  if (error) {
    return <ErrorPageCallout title="Error Loading Workouts" message={error} />;
  }

  return (
    <PageWrapper>
      <div className="max-w-[1000px] mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title || formatDate(date)}</h1>

            {/* Summary */}
            {groupedWorkouts.length > 0 && (
              <div className="max-w-sm grid grid-cols-2 gap-2">
                <div className="">
                  <div className="text-xl font-bold text-deep-sky-blue">{groupedWorkouts.length}</div>
                  <div className="text-sm">Exercise{groupedWorkouts.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="">
                  <div className="text-xl font-bold text-rose-kiss">{getTotalSets()}</div>
                  <div className="text-sm">Total Set{getTotalSets() !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Day Navigation */}
        <div className="flex justify-between items-center gap-4">
          <Button href={`/day/${prevDate}`} variant="outline" size="sm">← Prev</Button>
          <span className="text-gray-700 font-medium">{formatDate(date)}</span>
          <Button href={`/day/${nextDate}`} variant="outline" size="sm">Next →</Button>
        </div>

        {/* Comment Input */}
        <CommentInput date={date} />

        {/* Grouped Workouts */}
        {groupedWorkouts.length === 0 ? (
          <div className="text-center flex flex-col gap-3 justify-center items-center">
            <div className="text-6xl flex justify-center items-center"><WeightIcon /></div>
            <h3 className="text-xl font-medium">No workouts {title ? 'today' : 'recorded'}</h3>
            <p>
              Get the fuck up, dude.
            </p>
            <Button
              href={`/categories?date=${date}`}
            >
              Start Workout
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedWorkouts.map((group, index) => (
              <GroupedExercises key={index} group={group} handleEditWorkout={handleEditWorkout} date={date} />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {groupedWorkouts.length > 0 && (
          <div className="mt-2 flex justify-center items-center">
            <Button
              href={`/categories?date=${date}`}
              variant="tertiary"
              className="w-sm flex justify-between items-center gap-3"
            >
              <WeightIcon />
              Add Exercise
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Exercise, Category } from '@/lib/types'
import GradientBorderContainer from '@/components/ui/GradientBorderContainer'
import BackButton from '@/components/ui/BackButton'
import SuspenseFallback from '@/components/misc/SuspenseFallback'

function ExercisesContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const categoryId = params.id as string
  const date = searchParams.get('date')

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category info
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name')
          .eq('id', categoryId)
          .single()

        if (categoryError) {
          throw categoryError
        }

        // Fetch exercises in this category
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select(`
            id,
            name,
            category,
            measurement_type:measurement_types(name)
          `)
          .eq('category', categoryId)
          .order('name', { ascending: true })

        if (exerciseError) {
          throw exerciseError
        }

        setCategory(categoryData)
        setExercises((exerciseData || []) as unknown as Exercise[])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch exercises')
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchData()
    }
  }, [categoryId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exercises...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[1300px] mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading exercises
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <BackButton>← Back to Categories</BackButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-[1300px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {category?.name} Exercises
              </h1>
              <p className="mt-2 text-gray-600">
                Choose an exercise to add to your workout
              </p>
            </div>
            <BackButton>← Back to Categories</BackButton>
          </div>
        </div>

        {/* Exercises List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}/add${date ? `?date=${date}` : ''}`}
              className="group"
            >
              <GradientBorderContainer>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Measurement: {exercise.measurement_type?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Add workout →
                    </span>
                  </div>
                </div>
              </GradientBorderContainer>
            </Link>
          ))}
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🏋️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-500">
              No exercises available in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExercisesPage() {
  return (
    <SuspenseFallback>
      <ExercisesContent />
    </SuspenseFallback>
  )
}
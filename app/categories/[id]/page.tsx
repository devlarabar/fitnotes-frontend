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
import CustomSpinner from '@/components/ui/Spinner'
import PageWrapper from '@/components/ui/PageWrapper'
import { ErrorPageCallout } from '@/components/ui/Callout'
import { PlusCircleIcon } from 'lucide-react'

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
    return <CustomSpinner />
  }

  if (error) {
    return (
      <PageWrapper>
        <ErrorPageCallout title="Error Loading Exercises" message={error} />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
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
            <BackButton>Categories</BackButton>
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
                      <PlusCircleIcon className="text-deep-sky-blue" />
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
    </PageWrapper>
  )
}

export default function ExercisesPage() {
  return (
    <SuspenseFallback>
      <ExercisesContent />
    </SuspenseFallback>
  )
}
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedLayout from '@/components/ProtectedLayout'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Exercise {
  id: number
  name: string
  category: number
  measurement_type: number
  measurement_types?: {
    name: string
  }[]
}

interface Category {
  id: number
  name: string
}

export default function ExercisesPage() {
  const params = useParams()
  const categoryId = params.id as string

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
            measurement_type,
            measurement_types(name)
          `)
          .eq('category', categoryId)
          .order('name', { ascending: true })

        if (exerciseError) {
          throw exerciseError
        }

        setCategory(categoryData)
        setExercises(exerciseData || [])
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
            <Link
              href="/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Categories
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedLayout>
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
              <Link
                href="/categories"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Categories
              </Link>
            </div>
          </div>

          {/* Exercises List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}/add`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Measurement: {exercise.measurement_types?.[0]?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Add workout →
                    </span>
                  </div>
                </div>
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
    </ProtectedLayout>
  )
}
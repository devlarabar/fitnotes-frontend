'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedLayout from '@/components/ProtectedLayout'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Category } from '@/lib/types'
import BackButton from '@/components/ui/BackButton'
import GradientBorderContainer from '@/components/ui/GradientBorderContainer'

function CategoriesContent() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true })

        if (error) {
          throw error
        }

        setCategories(data || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
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
                  Error loading categories
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <BackButton>← Back to Home</BackButton>
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
              <h1 className="text-3xl font-bold text-gray-900">Exercise Categories</h1>
              <p className="mt-2 text-gray-600">
                Choose a category to see exercises and add workouts
              </p>
            </div>
            <BackButton>← Back to Home</BackButton>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}${date ? `?date=${date}` : ''}`}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden"
            >
              <GradientBorderContainer>
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4 mx-auto group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">
                    {getCategoryEmoji(category.name)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  View exercises →
                </p>
              </GradientBorderContainer>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🏋️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">
              Make sure your database has exercise categories.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


function getCategoryEmoji(categoryName: string): string {
  const emojiMap: { [key: string]: string } = {
    'Biceps': '💪',
    'Triceps': '🔥',
    'Chest': '🦾',
    'Back': '🗿',
    'Shoulders': '🏔️',
    'Legs': '🦵',
    'Abs': '⚡',
    'Cardio': '❤️',
    'Full Body': '🏃'
  }

  return emojiMap[categoryName] || '🏋️'
}

export default function CategoriesPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-[1300px] mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      }>
        <CategoriesContent />
      </Suspense>
    </ProtectedLayout>
  )
}

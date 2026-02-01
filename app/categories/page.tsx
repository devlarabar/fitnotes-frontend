'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Category } from '@/lib/types'
import BackButton from '@/components/ui/BackButton'
import GradientBorderContainer from '@/components/ui/GradientBorderContainer'
import SuspenseFallback from '@/components/misc/SuspenseFallback'
import CustomSpinner from '@/components/ui/Spinner'
import PageWrapper from '@/components/ui/PageWrapper'
import { ErrorPageCallout } from '@/components/ui/Callout'

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
    return <CustomSpinner />
  }

  if (error) {
    return (
      <PageWrapper>
        <ErrorPageCallout title="Error Loading Categories" message={error} />
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
              <h1 className="text-3xl font-bold text-gray-900">Exercise Categories</h1>
              <p className="mt-2 text-gray-600">
                Choose a category to see exercises and add workouts
              </p>
            </div>
            <BackButton>← Back to Home</BackButton>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}${date ? `?date=${date}` : ''}`}
              className="group block transition-shadow duration-200 mx-1 my-1"
            >
              <GradientBorderContainer>
                <div className="flex flex-row items-center space-x-4 p-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <span className="text-2xl">
                      {getCategoryEmoji(category.name)}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      View exercises →
                    </p>
                  </div>
                </div>
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
    </PageWrapper>
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
    <SuspenseFallback>
      <CategoriesContent />
    </SuspenseFallback>
  )
}

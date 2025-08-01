'use client'

// Force dynamic rendering to prevent build-time data fetching
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import WorkoutTable from '@/components/WorkoutTable'
import ProtectedLayout from '@/components/ProtectedLayout'
import Link from 'next/link'

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
  // Foreign key resolved fields
  exercises?: {
    name: string
  }
  categories?: {
    name: string
  }
  weight_units?: {
    name: string
  }
  distance_units?: {
    name: string
  }
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const RECORDS_PER_PAGE = 100

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true)
      try {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE
        const endIndex = startIndex + RECORDS_PER_PAGE - 1

        // Get total count for pagination info
        const { count } = await supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })

        // Fetch workouts with foreign key relationships and pagination
        const { data, error } = await supabase
          .from('workouts')
          .select(`
            *,
            exercises(name),
            categories(name),
            weight_units(name),
            distance_units(name)
          `)
          .order('date', { ascending: false })
          .order('id', { ascending: false })
          .range(startIndex, endIndex)

        if (error) {
          throw error
        }

        setWorkouts(data || [])
        setTotalCount(count || 0)
        setHasMore((data?.length || 0) === RECORDS_PER_PAGE && endIndex + 1 < (count || 0))
      } catch (err) {
        console.error('Error fetching workouts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch workouts')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [currentPage])

  const initialLoading = loading && currentPage === 1

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading workouts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading workouts
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-2">
                    This might happen if the workouts table doesn&apos;t exist yet in your Supabase database.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Home
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
                <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
                <p className="mt-2 text-gray-600">
                  Track and review your fitness progress
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Workouts Table */}
          {loading && currentPage > 1 ? (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto h-[60vh] relative">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading page {currentPage}...</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <WorkoutTable workouts={workouts} />
          )}

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * RECORDS_PER_PAGE) + 1} to {Math.min(currentPage * RECORDS_PER_PAGE, totalCount)} of {totalCount.toLocaleString()} workouts
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    disabled={loading}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Array.from({ length: Math.ceil(totalCount / RECORDS_PER_PAGE) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-700">
                    of {Math.ceil(totalCount / RECORDS_PER_PAGE)}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasMore || loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
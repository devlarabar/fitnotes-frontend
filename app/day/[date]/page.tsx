'use client'

export const dynamic = 'force-dynamic'

import { useParams } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'
import DayWorkouts from '@/components/DayWorkouts'

export default function DayPage() {
  const params = useParams()
  const date = params.date as string

  // Validate date format (basic check)
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-[800px] mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Invalid Date
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Please provide a valid date in YYYY-MM-DD format.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <DayWorkouts date={date} />
    </ProtectedLayout>
  )
}
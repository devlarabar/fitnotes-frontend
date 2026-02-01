'use client'

export const dynamic = 'force-dynamic'

import { useParams } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'
import DayWorkouts from '@/components/DayWorkouts'
import PageWrapper from '@/components/ui/PageWrapper'
import { ErrorPageCallout } from '@/components/ui/Callout'

export default function DayPage() {
  const params = useParams()
  const date = params.date as string

  // Validate date format (basic check)
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <ProtectedLayout>
        <PageWrapper>
          <ErrorPageCallout title="Invalid Date" message="Please provide a valid date in YYYY-MM-DD format." />
        </PageWrapper>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <DayWorkouts date={date} />
    </ProtectedLayout>
  )
}
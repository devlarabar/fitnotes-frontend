'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedLayout from '@/components/ProtectedLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import GradientBorderContainer from '@/components/ui/GradientBorderContainer'

interface WorkoutDay {
  date: string
  count: number
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([])
  const [loading, setLoading] = useState(true)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Recalculate these values when currentDate changes
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days - recalculate on every render
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday

  useEffect(() => {
    fetchWorkouts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate])

  const fetchWorkouts = async () => {
    setLoading(true)
    try {
      // Calculate dates fresh each time
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const currentDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

      const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
      const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDaysInMonth).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('workouts')
        .select('date')
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      // Group workouts by date and count them
      const workoutsByDate = (data || []).reduce((acc: Record<string, number>, workout) => {
        acc[workout.date] = (acc[workout.date] || 0) + 1
        return acc
      }, {})

      const workoutDaysList = Object.entries(workoutsByDate).map(([date, count]) => ({
        date,
        count
      }))

      setWorkoutDays(workoutDaysList)
    } catch (err) {
      console.error('Error fetching workouts:', err)
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const currentYear = prev.getFullYear()
      const currentMonth = prev.getMonth()

      if (direction === 'prev') {
        return new Date(currentYear, currentMonth - 1, 1)
      } else {
        return new Date(currentYear, currentMonth + 1, 1)
      }
    })
  }

  const hasWorkout = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return workoutDays.find(wd => wd.date === dateStr)
  }

    const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    router.push(`/day/${dateStr}`)
  }

  // Generate calendar days - recalculate every time
  const generateCalendarDays = () => {
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <GradientBorderContainer className="mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
              </button>

              <div className="text-center">
                <h1 className="text-3xl font-bold text-purple-800">
                  {monthNames[month]} {year}
                </h1>
                <p className="text-gray-600 mt-1">Workout Calendar</p>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-gray-600" />
              </button>
            </div>
          </GradientBorderContainer>

          {/* Calendar */}
          <GradientBorderContainer>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center py-3 text-sm font-semibold text-gray-500 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-16"></div>
                }

                const workout = hasWorkout(day)
                const today = isToday(day)

                return (
                  <div
                    key={`day-${index}-${day}`}
                    onClick={() => handleDayClick(day)}
                    className={`
                      h-16 flex items-center justify-center relative border rounded-md transition-colors cursor-pointer
                      ${today ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'border-gray-200 hover:bg-gray-50'}
                      ${workout ? 'ring-1 ring-emerald-400 ring-opacity-60' : ''}
                    `}
                  >
                    <span className="text-sm">{day}</span>
                    {workout && (
                      <>
                        {workout.count >= 1 && (
                          <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold leading-none">{workout.count}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-1 border-blue-200 bg-blue-50 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-1 border-emerald-400 rounded relative">
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
                <span>Has workouts</span>
              </div>
            </div>

            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </GradientBorderContainer>
        </div>
      </div>
    </ProtectedLayout>
  )
}
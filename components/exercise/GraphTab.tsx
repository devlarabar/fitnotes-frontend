'use client'

import { useState } from 'react'
import { Exercise, Workout } from '@/lib/types'
import ProgressChart, { ChartDataPoint } from '@/components/charts/ProgressChart'

interface GraphTabProps {
  allSets: Workout[]
  exercise: Exercise | null
}

export default function GraphTab({ allSets, exercise }: GraphTabProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('line')
  const [dateRange, setDateRange] = useState<'30' | '90' | 'all' | 'custom'>('30')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const measurementType = exercise?.measurement_type?.name

  // Filter sets based on date range
  const getFilteredSets = (): Workout[] => {
    if (!allSets.length) return []

    const now = new Date()
    let startDate: Date

    switch (dateRange) {
      case '30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        if (!customStartDate) return allSets
        startDate = new Date(customStartDate)
        const endDate = customEndDate ? new Date(customEndDate) : now
        return allSets.filter(set => {
          const setDate = new Date(set.date)
          return setDate >= startDate && setDate <= endDate
        })
      case 'all':
      default:
        return allSets
    }

    return allSets.filter(set => new Date(set.date) >= startDate)
  }

  // Calculate progress data based on measurement type
  const calculateProgressData = (): ChartDataPoint[] => {
    const filteredSets = getFilteredSets()
    if (!filteredSets.length) return []

    const dailyData = new Map<string, Workout[]>()

    // Group sets by date
    filteredSets.forEach(set => {
      const date = set.date
      if (!dailyData.has(date)) {
        dailyData.set(date, [])
      }
      dailyData.get(date)!.push(set)
    })

    // Calculate progress metric for each day
    const progressData: ChartDataPoint[] = []

    dailyData.forEach((sets, date) => {
      let value: number
      let label: string

      if (measurementType === 'reps') {
        // For weight + reps: calculate volume (weight × reps) or max weight
        const hasWeight = sets.some(set => set.weight && set.weight > 0)
        if (hasWeight) {
          // Total volume for the day
          value = sets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0)
          label = 'Volume (weight×reps)'
        } else {
          // Just reps
          value = sets.reduce((sum, set) => sum + (set.reps || 0), 0)
          label = 'Total Reps'
        }
      } else if (measurementType === 'distance') {
        const hasTime = sets.some(set => set.time)
        if (hasTime) {
          // Distance per time (speed)
          const totalDistance = sets.reduce((sum, set) => sum + (set.distance || 0), 0)
          const totalTimeMinutes = sets.reduce((sum, set) => {
            if (!set.time) return sum
            const [minutes, seconds] = set.time.split(':').map(Number)
            return sum + minutes + (seconds || 0) / 60
          }, 0)
          value = totalTimeMinutes > 0 ? totalDistance / totalTimeMinutes : totalDistance
          label = 'Speed (km/min)'
        } else {
          // Just distance
          value = sets.reduce((sum, set) => sum + (set.distance || 0), 0)
          label = 'Total Distance'
        }
      } else {
        // Default: count sets
        value = sets.length
        label = 'Sets Completed'
      }

      progressData.push({
        date,
        value: Math.round(value * 100) / 100, // Round to 2 decimal places
        label
      })
    })

    // Sort by date
    return progressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const progressData = calculateProgressData()
  const progressLabel = progressData[0]?.label || 'Progress'

  // Calculate stats
  const totalSets = allSets.length
  const uniqueDates = new Set(allSets.map(set => set.date)).size

  let maxWeight = 0
  let maxReps = 0
  let maxDistance = 0

  if (measurementType === 'reps') {
    maxWeight = Math.max(...allSets.map(set => set.weight || 0))
    maxReps = Math.max(...allSets.map(set => set.reps || 0))
  } else if (measurementType === 'distance') {
    maxDistance = Math.max(...allSets.map(set => set.distance || 0))
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Overview</h3>

      {allSets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-500">
            Complete some workouts to see your progress charts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{totalSets}</div>
              <div className="text-sm text-blue-800">Total Sets</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{uniqueDates}</div>
              <div className="text-sm text-green-800">Workout Days</div>
            </div>
          </div>

          {/* Personal Records */}
          {measurementType === 'reps' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{maxWeight}</div>
                <div className="text-sm text-purple-800">Max Weight</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{maxReps}</div>
                <div className="text-sm text-orange-800">Max Reps</div>
              </div>
            </div>
          )}

          {measurementType === 'distance' && (
            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-600">{maxDistance}</div>
              <div className="text-sm text-cyan-800">Max Distance</div>
            </div>
          )}

          {/* Progress Chart (always render controls and chart) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Chart Controls */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Progress Over Time</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${chartType === 'line'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${chartType === 'bar'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bar
                  </button>
                </div>
              </div>

              {/* Date Range Controls */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '30', label: 'Last 30 Days' },
                    { value: '90', label: 'Last 90 Days' },
                    { value: 'all', label: 'All Time' },
                    { value: 'custom', label: 'Custom' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateRange(option.value as '30' | '90' | 'all' | 'custom')}
                      className={`hover:cursor-pointer px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${dateRange === option.value
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Inputs */}
                {dateRange === 'custom' && (
                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">From:</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">To:</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart or No Data Message */}
            {progressData.length > 0 ? (
              <ProgressChart
                data={progressData}
                type={chartType}
                label={progressLabel}
              />
            ) : (
              <div className="text-center text-gray-400 py-12">
                No data for this exercise in the selected date range.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { Exercise, Workout } from '@/lib/types'

interface HistoryTabProps {
  allSets: Workout[]
  exercise: Exercise | null
}

export default function HistoryTab({ allSets, exercise }: HistoryTabProps) {
  const measurementType = exercise?.measurement_type?.name

  // Group sets by date
  const setsByDate = allSets.reduce((acc: Record<string, Workout[]>, set) => {
    if (!acc[set.date]) {
      acc[set.date] = []
    }
    acc[set.date].push(set)
    return acc
  }, {})

  const dates = Object.keys(setsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Exercise History</h3>

      {dates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
          <p className="text-gray-500">
            Start tracking this exercise to see your progress over time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <div key={date} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <span className="text-sm text-gray-500">
                  {setsByDate[date].length} set{setsByDate[date].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {setsByDate[date].map((set, index) => (
                  <div key={set.id} className="flex items-center gap-3 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {index + 1}
                    </span>
                    <div>
                      {measurementType === 'reps' && (
                        <span>
                          {set.weight ? `${set.weight} ${set.weight_units?.name || ''} × ` : ''}
                          {set.reps} reps
                        </span>
                      )}
                      {measurementType === 'distance' && (
                        <span>
                          {set.distance} {set.distance_units?.name || ''}
                          {set.time && ` in ${set.time}`}
                        </span>
                      )}
                      {measurementType === 'time' && (
                        <span>{set.time}</span>
                      )}
                    </div>
                    {set.comment && (
                      <div className="text-xs text-gray-500 italic">
                        &ldquo;{set.comment}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
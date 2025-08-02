'use client'

import { Exercise, WeightUnit, DistanceUnit, Workout } from '@/lib/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import Button from '../ui/Button'

interface TrackTabProps {
  currentSet: {
    date: string
    weight: number
    weight_unit: string
    reps: number
    distance: number
    distance_unit: string
    time: string
    comment: string
  }
  setCurrentSet: React.Dispatch<React.SetStateAction<{
    date: string
    weight: number
    weight_unit: string
    reps: number
    distance: number
    distance_unit: string
    time: string
    comment: string
  }>>
  saveSet: () => void
  clearSet: () => void
  saving: boolean
  error: string | null
  sets: Workout[]
  editingSetId: number | null
  handleSetClick: (set: Workout) => void
  handleCommentClick: (e: React.MouseEvent, set: Workout) => void
  handleDeleteClick: (e: React.MouseEvent, set: Workout) => void
  exercise: Exercise | null
  weightUnits: WeightUnit[]
  distanceUnits: DistanceUnit[]
  fetchSets: () => void
}

export default function TrackTab({
  currentSet,
  setCurrentSet,
  saveSet,
  clearSet,
  saving,
  error,
  sets,
  editingSetId,
  handleSetClick,
  handleCommentClick,
  handleDeleteClick,
  exercise,
  weightUnits,
  distanceUnits,
  fetchSets
}: TrackTabProps) {
  const measurementType = exercise?.measurement_type?.name

  return (
    <div className="p-6">
      {/* Date Selection */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={currentSet.date}
          onChange={(e) => {
            setCurrentSet(prev => ({ ...prev, date: e.target.value }))
            // Refresh sets when date changes
            setTimeout(() => fetchSets(), 100)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Weight & Reps Tracking (for reps-based exercises) */}
      {measurementType === 'reps' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WEIGHT ({weightUnits.find(u => u.id === parseInt(currentSet.weight_unit))?.name || 'kg'}):
            </label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentSet(prev => ({ ...prev, weight: Math.max(0, prev.weight - 2.5) }))}
                className="w-12 h-12"
              >
                −
              </Button>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={currentSet.weight}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentSet(prev => ({ ...prev, weight: prev.weight + 2.5 }))}
                className="w-12 h-12"
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              REPS:
            </label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentSet(prev => ({ ...prev, reps: Math.max(1, prev.reps - 1) }))}
                className="w-12 h-12"
              >
                −
              </Button>
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  value={currentSet.reps}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: parseInt(e.target.value) || 1 }))}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentSet(prev => ({ ...prev, reps: prev.reps + 1 }))}
                className="w-12 h-12"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Distance & Time Tracking (for distance-based exercises) */}
      {measurementType === 'distance' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DISTANCE ({distanceUnits.find(u => u.id === parseInt(currentSet.distance_unit))?.name || 'km'}):
            </label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentSet(prev => ({ ...prev, distance: Math.max(0, prev.distance - 0.1) }))}
                className="w-12 h-12"
              >
                −
              </Button>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={currentSet.distance}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentSet(prev => ({ ...prev, distance: prev.distance + 0.1 }))}
                className="w-12 h-12"
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TIME (HH:MM:SS):
            </label>
            <input
              type="text"
              pattern="^[0-9]+:[0-5][0-9]:[0-5][0-9]$"
              value={currentSet.time}
              onChange={(e) => setCurrentSet(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl"
              placeholder="00:30:00"
            />
          </div>
        </div>
      )}

      {/* Time Tracking (for time-based exercises) */}
      {measurementType === 'time' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TIME (HH:MM:SS):
          </label>
          <input
            type="text"
            pattern="^[0-9]+:[0-5][0-9]:[0-5][0-9]$"
            value={currentSet.time}
            onChange={(e) => setCurrentSet(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl"
            placeholder="00:30:00"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          type="button"
          variant={editingSetId ? 'primary' : 'secondary'}
          onClick={saveSet}
          disabled={saving}
          className={`flex-1 font-medium py-3 px-4 rounded-md disabled:opacity-50 text-white ${editingSetId
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
        >
          {saving ? 'SAVING...' : editingSetId ? 'UPDATE' : 'SAVE'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clearSet}
          className="flex-1"
        >
          CLEAR
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Sets History */}
      {sets.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Today&apos;s Sets</h3>
          <div className="space-y-2">
            {sets.map((set, index) => (
              <div
                key={set.id}
                className={`flex items-center justify-between bg-gray-50 p-3 rounded border cursor-pointer hover:bg-gray-100 transition-colors ${editingSetId === set.id ? 'ring-2 ring-green-400 bg-green-50' : ''
                  }`}
                onClick={() => handleSetClick(set)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className={`flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full ${editingSetId === set.id ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {index + 1}
                  </span>
                  <div className="text-sm">
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
                    <div className="text-xs text-gray-500 italic truncate max-w-32">
                      &ldquo;{set.comment}&rdquo;
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleCommentClick(e, set)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Add/edit comment"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, set)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete set"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-gray-500 min-w-16 text-right">
                    {new Date(`${set.date}T12:00:00`).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
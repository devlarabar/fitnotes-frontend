'use client'

import { useState } from 'react'
import { Exercise, WeightUnit, DistanceUnit, Workout } from '@/lib/types'
import TrackTab from './TrackTab'
import HistoryTab from './HistoryTab'
import GraphTab from './GraphTab'
import GradientBorderContainer from '../ui/GradientBorderContainer'

interface ExerciseTabsProps {
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
  allSets: Workout[]
  editingSetId: number | null
  handleSetClick: (set: Workout) => void
  handleCommentClick: (e: React.MouseEvent, set: Workout) => void
  handleDeleteClick: (e: React.MouseEvent, set: Workout) => void
  exercise: Exercise | null
  weightUnits: WeightUnit[]
  distanceUnits: DistanceUnit[]
  fetchSets: () => void
}

export default function ExerciseTabs({
  currentSet,
  setCurrentSet,
  saveSet,
  clearSet,
  saving,
  error,
  sets,
  allSets,
  editingSetId,
  handleSetClick,
  handleCommentClick,
  handleDeleteClick,
  exercise,
  weightUnits,
  distanceUnits,
  fetchSets
}: ExerciseTabsProps) {
  const [activeTab, setActiveTab] = useState<'TRACK' | 'HISTORY' | 'GRAPH'>('TRACK')

  return (
    <GradientBorderContainer>
      {/* Tab Navigation */}
      <div className="bg-white rounded-t-lg mb-0 relative z-10">
        <div className="flex border-b border-gray-200">
          {(['TRACK', 'HISTORY', 'GRAPH'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`hover:cursor-pointer flex-1 py-4 px-6 text-sm font-bold transition-colors relative ${activeTab === tab
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg overflow-hidden relative z-10">
        {activeTab === 'TRACK' && (
          <TrackTab
            currentSet={currentSet}
            setCurrentSet={setCurrentSet}
            saveSet={saveSet}
            clearSet={clearSet}
            saving={saving}
            error={error}
            sets={sets}
            editingSetId={editingSetId}
            handleSetClick={handleSetClick}
            handleCommentClick={handleCommentClick}
            handleDeleteClick={handleDeleteClick}
            exercise={exercise}
            weightUnits={weightUnits}
            distanceUnits={distanceUnits}
            fetchSets={fetchSets}
          />
        )}

        {activeTab === 'HISTORY' && (
          <HistoryTab
            allSets={allSets}
            exercise={exercise}
          />
        )}

        {activeTab === 'GRAPH' && (
          <GraphTab
            allSets={allSets}
            exercise={exercise}
          />
        )}
      </div>
    </GradientBorderContainer>
  )
}
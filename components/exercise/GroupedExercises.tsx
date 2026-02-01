import { GroupedWorkout, Workout } from "@/lib/types"
import { faEdit } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Button from "../ui/Button"
import GradientBorderContainer from "../ui/GradientBorderContainer"

export default function GroupedExercises({
  group,
  handleEditWorkout,
  date,
}: {
  group: GroupedWorkout
  handleEditWorkout: (workout: Workout) => void,
  date: string,
}) {

  const formatWorkoutDetails = (workout: Workout): string => {
    const parts: string[] = []
    if (workout.weight) {
      parts.push(`${workout.weight} ${workout.weight_units?.name || ''}`)
    }
    if (workout.reps) {
      parts.push(`${workout.reps} reps`)
    }
    if (workout.distance) {
      parts.push(`${workout.distance} ${workout.distance_units?.name || ''}`)
    }
    if (workout.time) {
      parts.push(`${workout.time}`)
    }
    return parts.join(' × ')
  }

  return (
    <GradientBorderContainer>
      {/* Exercise Header */}
      <div className="px-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg text-deep-sky-blue font-semibold">{group.exercise.name}</h3>
            <p className="text-sm">{group.exercise.category}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{group.sets.length}</div>
            <div className="text-xs">set{group.sets.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Sets */}
      <div className="divide-y divide-gray-100">
        {group.sets.map((workout, index) => (
          <div
            key={workout.id}
            className="px-2 py-2 hover:bg-baby-blue-ice/10 cursor-pointer transition-colors"
            onClick={() => handleEditWorkout(workout)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center justify-center 
                  w-8 h-8 rounded-fulltext-sm rounded-full font-medium bg-baby-blue-ice`}>
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-charcoal-blue">
                    {formatWorkoutDetails(workout) || 'Completed'}
                  </div>
                  {workout.comment && (
                    <div className="text-sm text-charcoal-blue-light mt-1">
                      {workout.comment}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-charcoal-blue-light">
                  {new Date(`${workout.date}T12:00:00`).toLocaleDateString()}
                </div>
                <div className="text-xs text-watermelon">
                  <FontAwesomeIcon icon={faEdit} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Add Another Set */}
      <div className="flex justify-end w-full border-t-baby-blue-ice/40 border-t-1 pt-2 mt-2">
        <Button
          href={`/exercises/${group.exercise.id}/add?date=${date}`}
          variant="secondary"
          size="sm"
        >
          + Add another set
        </Button>
      </div>
    </GradientBorderContainer>
  )
}
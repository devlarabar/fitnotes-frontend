'use client'

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
  exercises?: { name: string }
  categories?: { name: string }
  weight_units?: { name: string }
  distance_units?: { name: string }
}

interface WorkoutTableProps {
  workouts: Workout[]
}

const tableStyles = {
  container: "bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200",
  wrapper: "overflow-x-auto h-[60vh] relative workout-table-wrapper",
  table: "min-w-full text-sm",
  header: "sticky top-0 z-10 bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b border-purple-300",
  row: "hover:bg-purple-50 transition-colors duration-150",
  cellBase: "px-4 py-3 whitespace-nowrap border-b border-gray-100",
  cellId: "text-gray-500 font-mono text-xs",
  cellPrimary: "text-gray-900 font-medium text-sm",
  cellSecondary: "text-gray-600 text-sm",
  cellComment: "text-gray-500 text-sm max-w-52 truncate"
}

export default function WorkoutTable({ workouts }: WorkoutTableProps) {
  if (workouts.length === 0) {
    return (
      <div className={tableStyles.container}>
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">💪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
          <p className="text-gray-500">
            Start tracking your workouts by adding data to your Supabase database.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={tableStyles.container}>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th className={tableStyles.header}>ID</th>
              <th className={tableStyles.header}>Date</th>
              <th className={tableStyles.header}>Exercise</th>
              <th className={tableStyles.header}>Category</th>
              <th className={tableStyles.header}>Weight</th>
              <th className={tableStyles.header}>Unit</th>
              <th className={tableStyles.header}>Reps</th>
              <th className={tableStyles.header}>Distance</th>
              <th className={tableStyles.header}>Unit</th>
              <th className={tableStyles.header}>Time</th>
              <th className={tableStyles.header}>Comment</th>
            </tr>
          </thead>
                          <tbody>
                  {workouts.map((workout, index) => (
                    <tr key={workout.id} className={`${tableStyles.row} ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellId}`}>
                        {workout.id}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellPrimary}`}>
                        {new Date(workout.date).toLocaleDateString()}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellPrimary}`}>
                        {workout.exercises?.name || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellSecondary}`}>
                        {workout.categories?.name || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellPrimary}`}>
                        {workout.weight || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellSecondary}`}>
                        {workout.weight_units?.name || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellPrimary}`}>
                        {workout.reps || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellPrimary}`}>
                        {workout.distance || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellSecondary}`}>
                        {workout.distance_units?.name || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellPrimary}`}>
                        {workout.time || '-'}
                      </td>
                      <td className={`${tableStyles.cellBase} ${tableStyles.cellComment}`}>
                        {workout.comment || '-'}
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
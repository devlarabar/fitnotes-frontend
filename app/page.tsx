import SupabaseConnection from '@/components/SupabaseConnection'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lara&apos;s FitNotes Backup
          </h1>
          <p className="text-xl text-gray-600">
            I switched to iOS, RIP.
          </p>
        </div>

        {/* Supabase Connection Component */}
        <div className="mb-12">
          <SupabaseConnection />
        </div>

        {/* Navigation */}
        <div className="mb-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/today"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Today&apos;s Workouts 🗓️
            </Link>
            <Link
              href="/workouts"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View All Workouts 📊
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              Add Workout 💪
            </Link>
          </div>
        </div>

        {/* Lorem Ipsum Content */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            About Lara&apos;s FitNotes Backup
          </h2>
          <div className="prose prose-lg text-gray-700 space-y-4">
            <p>
              I used FitNotes on Android for over a decade. Then I broke my phone,
              and switched to an iPhone, and discovered that FitNotes isn&apos;t supported
              on iOS. Heartbreaking. Anyway, here&apos;s my fitness data.
            </p>
            <p>
              I&apos;m using Supabase to store the data, which I had exported from FitNotes
              as a CSV. I re-created a schema and then wrote a Python script to bulk
              insert the data into the new tables. This app was built with Next.js.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
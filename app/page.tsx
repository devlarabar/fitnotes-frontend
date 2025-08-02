import SupabaseConnection from '@/components/SupabaseConnection'
import ProtectedLayout from '@/components/ProtectedLayout'
import Button from '@/components/ui/Button'
import GradientBorderContainer from '@/components/ui/GradientBorderContainer'
import CustomLink from '@/components/typography/CustomLink';

export default function Home() {
  const today = new Date().toISOString().split('T')[0]
  return (
    <ProtectedLayout>
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
              <Button
                href={`/day/${today}`}
                variant="primary"
                size="lg"
              >
                Today&apos;s Workouts
              </Button>
              <Button
                href="/workouts"
                variant="secondary"
                size="lg"
              >
                View All Workouts
              </Button>
              <Button
                href="/categories"
                variant="outline"
                size="lg"
              >
                Add Workout
              </Button>
            </div>
          </div>

          {/* About */}
          <GradientBorderContainer>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              About Lara&apos;s FitNotes Backup
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                I used <CustomLink href="https://www.fitnotesapp.com/">FitNotes</CustomLink> on Android for over a decade. Then I broke my phone,
                and switched to an iPhone, and discovered that FitNotes isn&apos;t supported
                on iOS. Heartbreaking. Anyway, here&apos;s my fitness data.
              </p>
              <p>
                I&apos;m using Supabase to store the data, which I had exported from FitNotes
                as a CSV. I re-created a schema and then wrote a Python script to bulk
                insert the data into the new tables. This app was built with Next.js.
              </p>
            </div>
          </GradientBorderContainer>
        </div>
      </div>
    </ProtectedLayout>
  );
}
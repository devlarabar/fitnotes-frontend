import SupabaseConnection from '@/components/SupabaseConnection'
import ProtectedLayout from '@/components/ProtectedLayout'
import GradientBorderContainer from '@/components/ui/GradientBorderContainer'
import CustomLink from '@/components/typography/CustomLink';
import PageWrapper from '@/components/ui/PageWrapper';

export default function Home() {
  return (
    <ProtectedLayout>
      <PageWrapper>
        <div className="max-w-4xl mx-auto flex flex-col gap-5">
          {/* Header Section */}
          <div className="text-center flex flex-col gap-3">
            <h1 className="text-3xl font-bold">
              Lara&apos;s FitNotes Backup
            </h1>
            <p className="text-xl">
              I switched to iOS, RIP.
            </p>

            <SupabaseConnection />
          </div>

          {/* About */}
          <GradientBorderContainer className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">
              About Lara&apos;s FitNotes Backup
            </h2>
            <div className="prose prose-lg space-y-3 mt-2">
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
              <p>
                <CustomLink href="/workouts">View all recorded workouts</CustomLink>
              </p>
            </div>
          </GradientBorderContainer>
        </div>
      </PageWrapper>
    </ProtectedLayout>
  );
}
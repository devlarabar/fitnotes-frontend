export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen py-12 px-4">
      {children}
    </div>
  )
}
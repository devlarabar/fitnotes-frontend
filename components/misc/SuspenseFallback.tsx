import { Suspense } from "react";
import ProtectedLayout from "../ProtectedLayout";

export default function SuspenseFallback(
  {
    children,
    loadingText = "Loading...",
    loadingColor = "border-blue-600"
  }: {
    children: React.ReactNode,
    loadingText?: string,
    loadingColor?: string
  }
) {
  return (
    <ProtectedLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-[1300px] mx-auto">
            <div className="text-center">
              <div className={
                "animate-spin rounded-full h-12 w-12 border-b-2 "
                + loadingColor + " mx-auto"
              }></div>
              <p className="mt-4 text-gray-600">{loadingText}</p>
            </div>
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </ProtectedLayout>
  )
}
import { Suspense } from "react";
import ProtectedLayout from "../ProtectedLayout";
import CustomSpinner from "../ui/Spinner";

export default function SuspenseFallback(
  {
    children,
  }: {
    children: React.ReactNode,
  }
) {
  return (
    <ProtectedLayout>
      <Suspense fallback={<CustomSpinner />}>
        {children}
      </Suspense>
    </ProtectedLayout>
  )
}
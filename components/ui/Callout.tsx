import { AlertTriangleIcon } from "lucide-react"
import BackButton from "./BackButton";

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-vanilla-custard/30 border-l-4 border-sandy-brown p-4 my-4 flex gap-4 max-w-md">
      <AlertTriangleIcon className="w-6 h-6 text-sandy-brown" />
      <div>{children}</div>
    </div>
  )
}

export function ErrorPageCallout({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return <Callout>
    <div className="text-sm">
      <span className="font-semibold">{title}</span>
      <p>{message}</p>
      <div className="mt-6">
        <BackButton>← Back to Home</BackButton>
      </div>
    </div>
  </Callout >
}
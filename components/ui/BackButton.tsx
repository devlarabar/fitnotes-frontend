import Link from "next/link";

export default function BackButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/"
      className={
        "inline-flex items-center px-4 py-2 border border-blue-300 "
        + "rounded-md shadow-sm text-sm font-medium text-blue-600 "
        + "bg-white hover:bg-blue-50"
      }
    >
      {children}
    </Link>
  )
}
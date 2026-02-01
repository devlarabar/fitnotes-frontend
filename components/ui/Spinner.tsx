"use client";
export default function CustomSpinner() {
  return (
    <div className="w-full flex justify-center items-center p-5">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
export default function GradientBorderContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div
      className={
        "bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 "
        + "p-[1px] shadow-md rounded-lg "
        + className
      }
    >
      <div className="bg-white rounded-lg p-3">
        {children}
      </div>
    </div>
  )
}
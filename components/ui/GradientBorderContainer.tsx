export default function GradientBorderContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div
      className={
        "bg-gradient-to-r from-cool-horizon via-baby-blue-ice to-deep-sky-blue "
        + "p-[1px] "
        + className
      }
    >
      <div className="bg-white p-3">
        {children}
      </div>
    </div>
  )
}
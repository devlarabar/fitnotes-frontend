export default function RoseButton(
  {
    onClick,
    children,
    className
  }: {
    onClick: () => void,
    children: React.ReactNode,
    className?: string
  }
) {
  return (
    <button
      onClick={onClick}
      className={
        "hover:cursor-pointer flex-1 px-4 py-2 text-sm font-medium "
        + "text-white bg-gradient-to-r from-pink-400 to-rose-400 "
        + "rounded-md hover:from-pink-500 hover:to-rose-500 shadow-sm "
        + "transition-all "
        + className
      }
    >
      {children}
    </button>
  )
}
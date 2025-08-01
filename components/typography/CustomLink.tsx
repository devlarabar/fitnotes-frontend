import Link from 'next/link'

export default function CustomLink(
  {
    href,
    children,
    className
  }: {
    href: string,
    children: React.ReactNode,
    className?: string
  }
) {
  return (
    <Link
      href={href}
      className={
        "text-blue-500 hover:text-blue-700 hover:underline "
        + className
      }
    >
      {children}
    </Link>
  )
}
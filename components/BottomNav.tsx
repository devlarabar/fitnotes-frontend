'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: '🏠',
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: '/today',
      icon: '🗓️',
      label: 'Today',
      active: pathname === '/today'
    },
    {
      href: '/categories',
      icon: '+',
      label: 'Add',
      active: pathname.startsWith('/categories') || pathname.startsWith('/exercises'),
      isAdd: true
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                item.active
                  ? item.isAdd
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } ${item.isAdd ? 'transform' : ''}`}
            >
              <div
                className={`text-xl mb-1 ${
                  item.isAdd
                    ? item.active
                      ? 'text-white font-bold'
                      : 'text-blue-600 font-bold text-2xl'
                    : ''
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  item.isAdd && item.active ? 'text-white' : ''
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { useState } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const navItems = [
    {
      href: '/today',
      icon: '🗓️',
      label: 'Today',
      active: pathname === '/today'
    },
    {
      href: '/',
      icon: '🏠',
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: '/categories',
      icon: '+',
      label: 'Add',
      active: pathname.startsWith('/categories') || pathname.startsWith('/exercises'),
      isAdd: true
    },
    {
      href: '#',
      icon: '👤',
      label: 'Profile',
      active: false,
      isProfile: true
    }
  ]

  const handleProfileClick = () => {
    setShowLogout(!showLogout)
  }

  const handleLogout = async () => {
    await signOut()
    setShowLogout(false)
  }

  return (
    <>
      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sign out?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {user?.email}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => (
              item.isProfile ? (
                <button
                  key="profile"
                  onClick={handleProfileClick}
                  className="flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <div className="text-xl mb-1">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </button>
              ) : (
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
              )
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
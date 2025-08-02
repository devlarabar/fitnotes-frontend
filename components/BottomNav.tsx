'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { useState } from 'react'
import RoseButton from './ui/RoseButton'
import Modal from './ui/Modal'

export default function BottomNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  
  const navItems = [
    {
      href: '/',
      icon: '🏠',
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: `/day/${today}`,
      icon: '🗓️',
      label: 'Today',
      active: pathname === `/day/${today}` || pathname === '/today'
    },
    {
      href: '/categories',
      icon: '+',
      label: 'Add',
      active: pathname.startsWith('/categories') || pathname.startsWith('/exercises'),
      isAdd: true
    },
    {
      href: '/calendar',
      icon: '📅',
      label: 'Calendar',
      active: pathname === '/calendar'
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
      <Modal isOpen={showLogout} onClose={() => setShowLogout(false)} maxWidth="sm">
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
              className="hover:cursor-pointer flex-1 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 border border-purple-200 transition-colors"
            >
              Cancel
            </button>
            <RoseButton onClick={handleLogout}>
              Sign out
            </RoseButton>
          </div>
        </div>
      </Modal>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-500 shadow-lg z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center py-3">
            {navItems.map((item) => (
              item.isProfile ? (
                <button
                  key="profile"
                  onClick={handleProfileClick}
                  className="hover:cursor-pointer flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <div className="text-xl">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium mt-1">
                    {item.label}
                  </span>
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-200 ${item.active
                    ? item.isAdd
                      ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg scale-110'
                      : 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } ${item.isAdd ? 'transform' : ''}`}
                >
                  <div
                    className={`${item.isAdd
                      ? item.active
                        ? 'text-white font-bold text-2xl'
                        : 'text-purple-500 font-bold text-3xl'
                      : 'text-xl'
                      }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-xs font-medium mt-1 ${item.isAdd && item.active ? 'text-white' : ''
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
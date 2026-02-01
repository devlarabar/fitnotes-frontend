'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import {
  Calendar1Icon,
  CalendarIcon,
  DoorOpenIcon,
  HomeIcon,
  PlusCircleIcon,
  UserIcon,
} from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const navIconClasses = "h-5 w-5"

  const navItems = [
    {
      href: '/',
      icon: <HomeIcon className={navIconClasses} />,
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: `/day/${today}`,
      icon: <Calendar1Icon className={navIconClasses} />,
      label: 'Today',
      active: pathname === `/day/${today}` || pathname === '/today'
    },
    {
      href: '/categories',
      icon: <PlusCircleIcon className={navIconClasses} />,
      label: 'Add',
      active: pathname.startsWith('/categories') || pathname.startsWith('/exercises'),
      isAdd: true
    },
    {
      href: '/calendar',
      icon: <CalendarIcon className={navIconClasses} />,
      label: 'Calendar',
      active: pathname === '/calendar'
    },
    {
      href: '#',
      icon: <UserIcon className={navIconClasses} />,
      label: 'Sign Out',
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
          <div className="flex justify-center items-center p-3"><DoorOpenIcon className="h-8 w-8" /></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sign out?
          </h3>
          <p className="text-sm text-gray-500 mb-6 flex flex-col gap-1">
            <span>You are currently signed in as:</span>
            <span>{user?.email}</span>
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowLogout(false)}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
            <Button onClick={handleLogout} className="w-full">
              Sign out
            </Button>
          </div>
        </div>
      </Modal>

      <nav className="fixed bottom-0 left-0 right-0 bg-white text-charcoal-blue shadow-lg z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center py-3">
            {navItems.map((item) => (
              (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.isProfile ? handleProfileClick : undefined}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-200 ${item.active
                    ? item.isAdd
                      ? 'bg-rose-kiss'
                      : 'bg-ice-light'
                    : ' hover:bg-ice-light'
                    } ${item.isAdd ? 'transform' : ''}`}
                >
                  <div
                    className={`${item.isAdd
                      ? item.active
                        ? 'text-white font-bold text-2xl'
                        : 'text-3xl'
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
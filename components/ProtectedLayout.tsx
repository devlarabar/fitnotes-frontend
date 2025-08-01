'use client'

import AuthGuard from './AuthGuard'
import BottomNav from './BottomNav'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      <div className="pb-20">
        {children}
      </div>
      <BottomNav />
    </AuthGuard>
  )
}
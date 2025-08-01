'use client'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, children, maxWidth = 'md' }: ModalProps) {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-purple-100/80 via-pink-100/80 to-cyan-100/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/50 p-6 ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>
  )
}
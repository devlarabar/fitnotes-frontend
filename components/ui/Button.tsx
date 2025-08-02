import React from 'react'
import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'rainbow' | 'pink' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseClasses = 'hover:cursor-pointer inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-purple-400 hover:from-cyan-600 hover:to-purple-500 text-white shadow-sm focus:ring-purple-500',
    secondary: 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-sm focus:ring-pink-500',
    rainbow: 'bg-gradient-to-r from-emerald-400 via-cyan-400 via-purple-400 to-pink-400 hover:from-emerald-500 hover:via-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-md focus:ring-purple-500',
    pink: 'bg-gradient-to-r from-pink-300 to-rose-300 hover:from-pink-400 hover:to-rose-400 text-white shadow-sm focus:ring-pink-500',
    outline: 'border-2 border-purple-300 text-purple-600 bg-white hover:bg-purple-50 focus:ring-purple-500',
    ghost: 'text-purple-600 hover:bg-purple-50 hover:text-purple-700 focus:ring-purple-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md'
  }

  const disabledClasses = 'opacity-50 cursor-not-allowed'

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  )
}
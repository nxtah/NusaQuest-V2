import React, { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400 active:bg-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  }

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={finalClassName}
    >
      {isLoading ? '⏳' : children}
    </button>
  )
}

import React from 'react'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
    success: 'bg-status-authentic text-white hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-status-tampered text-white hover:bg-yellow-600 focus:ring-yellow-500',
    danger: 'bg-status-fake text-white hover:bg-red-600 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
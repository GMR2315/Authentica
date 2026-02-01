import React from 'react'

export default function Card({ children, className = '', padding = 'md' }) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <div className={`bg-white shadow rounded-lg ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  )
}

Card.Content = function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  )
}
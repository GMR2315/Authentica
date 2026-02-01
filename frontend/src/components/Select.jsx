import React from 'react'

export default function Select({ 
  label, 
  error, 
  helper, 
  options = [], 
  className = '', 
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
        }`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
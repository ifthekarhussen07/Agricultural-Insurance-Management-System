const colorMap = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
}

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
}

function Badge({ children, color = 'gray', size = 'sm', className = '' }) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorMap[color]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge

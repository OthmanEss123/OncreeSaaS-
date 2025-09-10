interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, max = 100, className, showLabel = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const getColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500"
    if (percent >= 60) return "bg-blue-500"
    if (percent >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

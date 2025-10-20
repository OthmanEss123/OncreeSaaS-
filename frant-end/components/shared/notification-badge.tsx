interface NotificationBadgeProps {
  type: "invoice" | "mission" | "payment" | "system" | "client" | "reminder"
  priority?: "low" | "medium" | "high"
}

export function NotificationBadge({ type, priority = "medium" }: NotificationBadgeProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "invoice":
        return "bg-blue-100 text-blue-800"
      case "mission":
        return "bg-green-100 text-green-800"
      case "payment":
        return "bg-purple-100 text-purple-800"
      case "system":
        return "bg-gray-100 text-gray-800"
      case "client":
        return "bg-orange-100 text-orange-800"
      case "reminder":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴"
      case "medium":
        return "🟡"
      case "low":
        return "🟢"
      default:
        return ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
        {type}
      </span>
      {priority && <span className="text-xs">{getPriorityIndicator(priority)}</span>}
    </div>
  )
}

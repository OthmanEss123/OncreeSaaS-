import type { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  className?: string
}

export function DataTable({ columns, data, className }: DataTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
      case "active":
        return "bg-green-100 text-green-800"
      case "in progress":
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? (
                    column.render(row[column.key], row)
                  ) : column.key === "status" ? (
                    <Badge className={getStatusColor(row[column.key])}>{row[column.key]}</Badge>
                  ) : (
                    row[column.key]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

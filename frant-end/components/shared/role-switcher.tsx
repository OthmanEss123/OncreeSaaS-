"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

const roles = [
  { name: "Client", path: "/client", description: "View client dashboard" },
  { name: "Consultant", path: "/consultant", description: "View consultant dashboard" },
  { name: "Admin", path: "/admin", description: "View admin dashboard" },
]

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState("Demo")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <UserIcon className="h-4 w-4" />
          {currentRole}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {roles.map((role) => (
          <DropdownMenuItem key={role.name} asChild>
            <Link href={role.path} className="flex flex-col items-start" onClick={() => setCurrentRole(role.name)}>
              <span className="font-medium">{role.name}</span>
              <span className="text-sm text-muted-foreground">{role.description}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

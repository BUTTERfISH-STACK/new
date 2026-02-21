'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { HoverTooltip } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  CheckSquare,
  Activity,
  TrendingUp,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'View your sales dashboard and analytics' },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban, tooltip: 'Manage your deals pipeline' },
  { href: '/companies', label: 'Companies', icon: Building2, tooltip: 'Manage business accounts' },
  { href: '/contacts', label: 'Contacts', icon: Users, tooltip: 'Manage your contacts and leads' },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, tooltip: 'Track your tasks and action items' },
  { href: '/activities', label: 'Activities', icon: Activity, tooltip: 'Log and view activities' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">CRM</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <HoverTooltip key={item.href} content={item.tooltip}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </HoverTooltip>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <HoverTooltip content="Configure system settings and preferences">
          <button
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </HoverTooltip>
      </div>
    </div>
  )
}

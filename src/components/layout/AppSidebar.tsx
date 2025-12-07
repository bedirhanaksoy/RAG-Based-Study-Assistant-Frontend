'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  Menu,
  FileUp,
  MessageSquare,
  LogOut,
} from 'lucide-react'

import { UploadPdfDialog } from '@/components/rag/UploadPdfDialog' 
// Bunu az sonra vereceğim. Basit bir modal.

export function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { isCollapsed, toggleCollapse } = useSidebarStore()

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const navItem = {
    name: 'RAG Assistant',
    href: '/rag',
    icon: MessageSquare,
  }

  const isActive = pathname.startsWith(navItem.href)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'app-sidebar flex h-full flex-col bg-sidebar border-sidebar-border border-r transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* HEADER */}
        <div
          className={cn(
            'flex h-16 items-center group',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          {isCollapsed ? (
            <div className="relative flex items-center justify-center w-full">
              <Image
                src="/logo.svg"
                alt="RAG"
                width={32}
                height={32}
                className="transition-opacity group-hover:opacity-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="absolute text-sidebar-foreground hover:bg-sidebar-accent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="RAG" width={32} height={32} />
                <span className="text-base font-medium text-sidebar-foreground">
                  RAG Assistant
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* NAVIGATION - Only RAG */}
        <nav className={cn('flex-1 space-y-1 py-4', isCollapsed ? 'px-2' : 'px-3')}>
          <div className="space-y-1">
            <Link href={navItem.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full gap-3 text-sidebar-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  isCollapsed ? 'justify-center px-2' : 'justify-start'
                )}
              >
                <navItem.icon className="h-4 w-4" />
                {!isCollapsed && <span>{navItem.name}</span>}
              </Button>
            </Link>

            {/* PDF Upload Button */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    variant="ghost"
                    className="w-full justify-center"
                  >
                    <FileUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Upload PDF</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={() => setUploadDialogOpen(true)}
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <FileUp className="h-4 w-4" />
                Upload PDF
              </Button>
            )}
          </div>
        </nav>

        {/* FOOTER */}
        <div className={cn('border-t border-sidebar-border p-3 space-y-2', isCollapsed && 'px-2')}>
          <div className={cn('flex', isCollapsed ? 'justify-center' : 'justify-start')}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ThemeToggle iconOnly />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Theme</TooltipContent>
              </Tooltip>
            ) : (
              <ThemeToggle />
            )}
          </div>

        </div>
      </div>

      {/* PDF UPLOAD MODAL */}
      <UploadPdfDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </TooltipProvider>
  )
}

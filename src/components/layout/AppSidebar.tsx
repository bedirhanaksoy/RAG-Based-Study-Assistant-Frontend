'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useBookStore } from '@/lib/stores/book-store'
import { getBooks, getChatHistory } from '@/lib/rag-api'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChevronLeft,
  Menu,
  FileUp,
  BookOpen,
  Plus,
} from 'lucide-react'

import { UploadPdfDialog } from '@/components/rag/UploadPdfDialog'

export function AppSidebar() {
  const { isCollapsed, toggleCollapse } = useSidebarStore()
  const { books, setBooks, selectedBook, setSelectedBook, addBook, setChatHistory, chatHistory } = useBookStore()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch chat history when a book is selected
  const handleSelectBook = async (book: string) => {
    setSelectedBook(book)
    
    // Only fetch if we don't already have history for this book
    if (!chatHistory[book]?.messages?.length) {
      try {
        const history = await getChatHistory(book)
        if (history && history.length > 0) {
          setChatHistory(book, history)
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error)
      }
    }
  }

  // Fetch books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const bookList = await getBooks()
        setBooks(bookList)
        // Select first book if none selected
        if (bookList.length > 0 && !selectedBook) {
          handleSelectBook(bookList[0])
        }
      } catch (error) {
        console.error('Failed to fetch books:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBooks()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUploadSuccess = (filename: string) => {
    const bookName = filename.replace(/\.pdf$/i, '')
    addBook(bookName)
    setSelectedBook(bookName)
    setUploadDialogOpen(false)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'app-sidebar flex h-full flex-col bg-sidebar border-sidebar-border border-r transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-72'
        )}
      >
        {/* HEADER */}
        <div
          className={cn(
            'flex h-16 items-center group border-b border-sidebar-border',
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
                  Study Assistant
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

        {/* NEW CHAT / UPLOAD BUTTON */}
        <div className={cn('p-3', isCollapsed && 'px-2')}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  variant="outline"
                  className="w-full justify-center"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Upload New Book</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() => setUploadDialogOpen(true)}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <FileUp className="h-4 w-4" />
              Upload New Book
            </Button>
          )}
        </div>

        {/* BOOKS LIST */}
        <div className={cn('flex-1 overflow-hidden', isCollapsed ? 'px-2' : 'px-3')}>
          {!isCollapsed && (
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Your Books
            </p>
          )}
          
          <ScrollArea className="h-full">
            <div className="space-y-1 pb-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground px-2 py-4">
                  Loading books...
                </div>
              ) : books.length === 0 ? (
                <div className="text-sm text-muted-foreground px-2 py-4">
                  {isCollapsed ? '' : 'No books yet. Upload a PDF to get started.'}
                </div>
              ) : (
                books.map((book) => (
                  <Tooltip key={book}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedBook === book ? 'secondary' : 'ghost'}
                        onClick={() => handleSelectBook(book)}
                        className={cn(
                          'w-full text-sidebar-foreground',
                          selectedBook === book && 'bg-sidebar-accent text-sidebar-accent-foreground',
                          isCollapsed ? 'justify-center px-2' : 'justify-start gap-3'
                        )}
                      >
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate text-left flex-1">
                            {book}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">{book}</TooltipContent>
                    )}
                  </Tooltip>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* FOOTER */}
        <div className={cn('border-t border-sidebar-border p-3', isCollapsed && 'px-2')}>
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
      <UploadPdfDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </TooltipProvider>
  )
}

"use client"

import { useRef, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { askRag, generateFlashcards, FlashcardItem } from "@/lib/rag-api"
import { useBookStore } from "@/lib/stores/book-store"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { useState } from "react"
import { ChevronDown, ChevronUp, FileText, MessageSquare, GraduationCap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ChatMode = "ask" | "flashcard"

export default function RagPage() {
  const { selectedBook, chatHistory, addMessage } = useBookStore()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set())
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set())
  const [chatMode, setChatMode] = useState<ChatMode>("ask")
  const [questionCount, setQuestionCount] = useState(3)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Get messages for current book
  const messages = selectedBook ? chatHistory[selectedBook]?.messages || [] : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const toggleContext = (key: string) => {
    setExpandedContexts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const toggleAnswer = (key: string) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleSend = async () => {
    if (!input.trim() || !selectedBook) return

    const question = input.trim()
    setInput("")

    if (chatMode === "ask") {
      addMessage(selectedBook, { role: "user", content: question })

      try {
        setIsLoading(true)
        const res = await askRag(question, selectedBook)
        addMessage(selectedBook, { 
          role: "assistant", 
          content: res.answer,
          context: res.context 
        })
      } catch {
        addMessage(selectedBook, { 
          role: "assistant", 
          content: "⚠ An error occurred while processing your request." 
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Flashcard mode - add to same message history
      addMessage(selectedBook, { role: "flashcard-request", content: question })

      try {
        setIsLoading(true)
        const res = await generateFlashcards(question, selectedBook, questionCount)
        addMessage(selectedBook, { 
          role: "flashcard", 
          content: "",
          topic: res.topic,
          flashcards: res.flashcards 
        })
      } catch {
        addMessage(selectedBook, { 
          role: "assistant", 
          content: "⚠ An error occurred while generating flashcards." 
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const renderMessage = (msg: typeof messages[number], idx: number) => {
    // Render flashcard request (user message for flashcard)
    if (msg.role === "flashcard-request") {
      return (
        <div key={idx} className="flex justify-end">
          <div className="rounded-2xl px-4 py-3 max-w-[80%] bg-primary text-primary-foreground">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="m-0">{msg.content}</p>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
              <GraduationCap className="h-3 w-3" />
              <span>Flashcard</span>
            </div>
          </div>
        </div>
      )
    }

    if (msg.role === "flashcard" && msg.flashcards) {
      // Render flashcard response
      return (
        <div key={`flashcard-${idx}`} className="flex justify-start">
          <div className="rounded-2xl px-4 py-3 max-w-[85%] bg-muted">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {msg.flashcards.length} Flashcards: {msg.topic}
              </span>
            </div>
            <div className="space-y-3">
              {msg.flashcards.map((card, cardIdx) => {
                const answerKey = `${idx}-${cardIdx}-answer`
                const contextKey = `${idx}-${cardIdx}-context`
                
                return (
                  <div key={cardIdx} className="bg-background/50 rounded-lg p-3">
                    {/* Question */}
                    <p className="font-medium text-sm mb-2">
                      Q{cardIdx + 1}: {card.question}
                    </p>
                    
                    {/* Answer Toggle */}
                    <button
                      onClick={() => toggleAnswer(answerKey)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>Show Answer</span>
                      {expandedAnswers.has(answerKey) ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    
                    {/* Answer Content */}
                    {expandedAnswers.has(answerKey) && (
                      <div className="mt-2 pl-3 border-l-2 border-primary/30">
                        <p className="text-sm text-muted-foreground">
                          {card.answer}
                        </p>
                        
                        {/* Context Toggle for Answer */}
                        {card.context && card.context.length > 0 && (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleContext(contextKey)}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{card.context.length} sources</span>
                              {expandedContexts.has(contextKey) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                            
                            {expandedContexts.has(contextKey) && (
                              <div className="mt-2 space-y-2">
                                {card.context.map((ctx, ctxIdx) => (
                                  <div 
                                    key={ctxIdx} 
                                    className="bg-muted rounded-lg p-2 text-xs"
                                  >
                                    <span className="font-semibold text-primary">
                                      Page {ctx.page_number}
                                    </span>
                                    <p className="text-muted-foreground mt-1 leading-relaxed">
                                      {ctx.sentence_chunk}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    // Regular message (user or assistant)
    return (
      <div
        key={idx}
        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 max-w-[80%] ${
            msg.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
          
          {/* Context Toggle Button */}
          {msg.role === "assistant" && msg.context && msg.context.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => toggleContext(`msg-${idx}`)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{msg.context.length} sources</span>
                {expandedContexts.has(`msg-${idx}`) ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              
              {/* Context Dropdown */}
              {expandedContexts.has(`msg-${idx}`) && (
                <div className="mt-2 space-y-2 border-t pt-2">
                  {msg.context.map((ctx, ctxIdx) => (
                    <div 
                      key={ctxIdx} 
                      className="bg-background/50 rounded-lg p-3 text-xs"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-primary">
                          Page {ctx.page_number}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {ctx.sentence_chunk}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h1 className="text-xl font-semibold">
              {selectedBook ? selectedBook : "Select a Book"}
            </h1>
            {selectedBook && (
              <p className="text-sm text-muted-foreground">
                Ask questions about this book
              </p>
            )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!selectedBook ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">No book selected</p>
                <p className="text-sm">Select a book from the sidebar or upload a new one</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground max-w-md">
                <p className="text-lg mb-2">Start a conversation</p>
                <p className="text-sm">
                  Ask any question about <strong>{selectedBook}</strong> and I'll help you find answers.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg, idx) => renderMessage(msg, idx))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="border-t px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-3 max-w-4xl mx-auto items-end"
          >
            <Textarea
              rows={1}
              value={input}
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                chatMode === "ask" 
                  ? (selectedBook ? `Ask about ${selectedBook}...` : "Select a book first...")
                  : (selectedBook ? `Enter a topic for flashcards...` : "Select a book first...")
              }
              disabled={!selectedBook}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            
            {/* Mode Toggle & Question Count */}
            <div className="flex items-center gap-2">
              {/* Question Count (only visible in flashcard mode) */}
              {chatMode === "flashcard" && (
                <Select 
                  value={questionCount.toString()} 
                  onValueChange={(v) => setQuestionCount(parseInt(v))}
                >
                  <SelectTrigger className="w-[70px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {/* Mode Toggle Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    {chatMode === "ask" ? (
                      <MessageSquare className="h-4 w-4" />
                    ) : (
                      <GraduationCap className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setChatMode("ask")}
                    className={chatMode === "ask" ? "bg-accent" : ""}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setChatMode("flashcard")}
                    className={chatMode === "flashcard" ? "bg-accent" : ""}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Flashcard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !selectedBook || !input.trim()}
              size="lg"
            >
              {isLoading ? "..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  )
}

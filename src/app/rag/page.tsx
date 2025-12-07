"use client"

import { useState, useRef, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { askRag, uploadRagPdf } from "@/lib/rag-api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function RagPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPdf, setCurrentPdf] = useState<string>("human") 
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim()) return

    const question = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: question }])

    try {
      setIsLoading(true)
      const res = await askRag(question, currentPdf)
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ Backend isteği sırasında bir hata oluştu." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      const res = await uploadRagPdf(file)
      const nameWithoutExt = res.filename.replace(/\.pdf$/i, "")
      setCurrentPdf(nameWithoutExt)

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `📄 ${res.filename} yüklendi.` }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ PDF yüklenemedi." }
      ])
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full w-full p-4 gap-4">

        {/* HEADER */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-xl font-semibold">Local RAG Study Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Aktif PDF: <span className="font-medium">{currentPdf}.pdf</span>
            </p>
          </div>

          <div>
            <label htmlFor="pdf-upload">
              <Button variant="outline" size="sm">PDF Yükle</Button>
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleUpload(f)
              }}
            />
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="flex-1 border rounded-lg p-4 overflow-y-auto bg-background/60 space-y-3 w-full">

          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Bir PDF yükleyebilir veya mevcut <code>human.pdf</code> üzerinden soru sorarak başlayabilirsin.
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground self-end ml-auto max-w-[85%]"
                  : "bg-muted text-foreground mr-auto max-w-[85%]"
              }`}
            >
              <strong className="block mb-1 text-xs opacity-70">
                {msg.role === "user" ? "You" : "Assistant"}
              </strong>

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}

          {isLoading && (
            <div className="bg-muted text-foreground rounded-lg px-3 py-2 w-fit animate-pulse">
              Asistan yazıyor...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2 w-full"
        >
          <Textarea
            rows={2}
            value={input}
            className="flex-1"
            onChange={(e) => setInput(e.target.value)}
            placeholder="PDF hakkında bir soru sor..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Yanıtlanıyor..." : "Gönder"}
          </Button>
        </form>
      </div>
    </AppShell>
  )
}

// src/lib/rag-api.ts
import apiClient from "@/lib/api/client"

// === GET BOOKS ===
export async function getBooks(): Promise<string[]> {
  const response = await apiClient.get<{ books: string[] }>("/books")
  return response.data.books
}

// === ASK RAG ===
export async function askRag(query: string, pdfName: string = "human") {
  const payload = {
    query,
    pdf_name: pdfName,
    temperature: 0.7,
    max_new_tokens: 256,
    return_context: true,
  }

  const response = await apiClient.post<{
    answer: string
    context?: any[]
  }>("/ask", payload)

  return response.data
}

// === GET CHAT HISTORY ===
export type ChatHistoryMessage = {
  role: "user" | "assistant"
  content: string
  context?: { page_number: number; sentence_chunk: string }[]
}

export async function getChatHistory(bookName: string): Promise<ChatHistoryMessage[]> {
  const response = await apiClient.get<{
    book_name: string
    history: ChatHistoryMessage[]
  }>(`/chat/${encodeURIComponent(bookName)}`)
  return response.data.history
}

// === FLASHCARDS ===
export type FlashcardItem = {
  question: string
  answer: string
  context: { page_number: number; sentence_chunk: string }[]
}

export type FlashcardsResponse = {
  topic: string
  file_name: string
  question_count: number
  flashcards: FlashcardItem[]
}

export async function generateFlashcards(
  topic: string, 
  fileName: string, 
  questionCount: number
): Promise<FlashcardsResponse> {
  const response = await apiClient.post<FlashcardsResponse>("/flashcards", {
    topic,
    file_name: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
    question_count: questionCount,
  })
  return response.data
}

// === UPLOAD PDF ===
export async function uploadRagPdf(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiClient.post<{
    message: string
    filename: string
  }>("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

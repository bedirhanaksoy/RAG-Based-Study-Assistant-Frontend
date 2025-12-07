// src/lib/rag-api.ts
import apiClient from "@/lib/api/client"

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

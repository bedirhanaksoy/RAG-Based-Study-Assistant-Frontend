export const sourceChatApi = {
  createSession: async () => {
    return {
      id: "default",
      source_id: "local",
      title: "RAG Session",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
    }
  },

  listSessions: async () => {
    return [
      {
        id: "default",
        source_id: "local",
        title: "RAG Session",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },

  getSession: async () => {
    return {
      id: "default",
      source_id: "local",
      title: "RAG Session",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
    }
  },

  updateSession: async () => {},

  deleteSession: async () => {},

  sendMessage: async (_sourceId: string, _sessionId: string, data: { content: string }) => {
    const response = await fetch("http://192.168.1.101:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: data.content,
        pdf_name: "human",
        temperature: 0.7,
        max_new_tokens: 256,
        return_context: false
      })
    })

    if (!response.ok) {
      throw new Error("Backend request failed")
    }

    const result = await response.json()

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(result.answer))
        controller.close()
      }
    })

    return stream
  }
}

import { create } from 'zustand'

type ContextItem = {
  page_number: number
  sentence_chunk: string
}

type FlashcardItem = {
  question: string
  answer: string
  context: ContextItem[]
}

type ChatMessage = {
  role: "user" | "assistant" | "flashcard-request" | "flashcard"
  content: string
  context?: ContextItem[]
  flashcards?: FlashcardItem[]
  topic?: string
}

type BookChat = {
  messages: ChatMessage[]
}

interface BookStore {
  // Currently selected book
  selectedBook: string | null
  setSelectedBook: (book: string | null) => void
  
  // Chat history per book
  chatHistory: Record<string, BookChat>
  addMessage: (book: string, message: ChatMessage) => void
  setChatHistory: (book: string, messages: ChatMessage[]) => void
  clearChat: (book: string) => void
  
  // Books list
  books: string[]
  setBooks: (books: string[]) => void
  addBook: (book: string) => void
  removeBook: (book: string) => void
}

export const useBookStore = create<BookStore>((set) => ({
  selectedBook: null,
  setSelectedBook: (book) => set({ selectedBook: book }),
  
  chatHistory: {},
  addMessage: (book, message) =>
    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [book]: {
          messages: [...(state.chatHistory[book]?.messages || []), message],
        },
      },
    })),
  setChatHistory: (book, messages) =>
    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [book]: { messages },
      },
    })),
  clearChat: (book) =>
    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [book]: { messages: [] },
      },
    })),
  
  books: [],
  setBooks: (books) => set({ books }),
  addBook: (book) =>
    set((state) => ({
      books: state.books.includes(book) ? state.books : [...state.books, book],
    })),
  removeBook: (book) =>
    set((state) => {
      const { [book]: _, ...restChatHistory } = state.chatHistory
      return {
        books: state.books.filter((b) => b !== book),
        chatHistory: restChatHistory,
        selectedBook: state.selectedBook === book ? null : state.selectedBook,
      }
    }),
}))

import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import Button from './Button'

type Message = {
    id: string
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
}

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            text: "Hi! I'm your Scholarly AI Assistant. I can help you find courses, explain topics, or answer questions about your exams. How can I help today?",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // Simulate AI Delay and Response
        setTimeout(() => {
            const responseText = generateMockResponse(userMsg.text)
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: responseText,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    const generateMockResponse = (query: string): string => {
        const q = query.toLowerCase()
        if (q.includes('physics') || q.includes('science')) return "Physics is fascinating! Are you stuck on mechanics, thermodynamics, or electromagnetism? I can look up formulas for you."
        if (q.includes('math') || q.includes('calculus')) return "I love Math! Do you need help with derivatives, integrals, or algebra?"
        if (q.includes('exam') || q.includes('quiz')) return "To prepare for exams, I recommend taking our mock quizzes. Go to the Quizzes tab to practice!"
        if (q.includes('hello') || q.includes('hi')) return "Hello there! Ready to learn something new?"
        if (q.includes('teacher') || q.includes('tutor')) return "Our teachers are expert vetted. You can browse them in the 'Find Tutors' section."
        return "That's an interesting question. As an AI Demo, I'm limited, but normally I would fetch that info from our knowledge base! Try asking about 'Physics' or 'Exams'."
    }

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-r from-brand-600 to-purple-600'
                    }`}
            >
                {isOpen ? (
                    <XMarkIcon className="h-6 w-6 text-white" />
                ) : (
                    <div className="relative">
                        <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 animate-slide-up overflow-hidden ring-1 ring-slate-900/5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-4 flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur text-white">
                            <SparklesIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-tight">Scholarly AI</h3>
                            <p className="text-brand-100 text-xs">Always here to help</p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-brand-600 text-white rounded-tr-none shadow-sm'
                                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSend()
                            }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about courses, exams..."
                                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default AIChatBot

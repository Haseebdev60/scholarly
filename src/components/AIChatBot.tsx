import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
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
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-glow transition-colors flex items-center justify-center ${isOpen ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-gradient-to-r from-brand-600 to-electric-blue text-white'}`}
            >
                {isOpen ? (
                    <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
                        <XMarkIcon className="h-7 w-7" />
                    </motion.div>
                ) : (
                    <motion.div initial={{ rotate: 90 }} animate={{ rotate: 0 }} className="relative">
                        <ChatBubbleLeftRightIcon className="h-7 w-7" />
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-blue opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-electric-blue border-2 border-brand-600"></span>
                        </span>
                    </motion.div>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden glass-panel border border-white/20 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-brand-600 to-electric-blue p-5 flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[30px] rounded-full mix-blend-overlay pointer-events-none" />
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md text-white shadow-sm ring-1 ring-white/30">
                                <SparklesIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black font-display text-white text-lg leading-tight tracking-tight">Scholarly AI</h3>
                                <p className="text-brand-100 text-sm font-medium">Always here to help</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl custom-scrollbar relative">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-brand-600 to-electric-blue text-white rounded-br-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/5 rounded-bl-sm'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-sm border border-slate-200/50 dark:border-white/5 shadow-sm flex gap-2 items-center h-[52px]">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-brand-500 opacity-70" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-brand-500 opacity-40" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} className="h-1" />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/10">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleSend()
                                }}
                                className="flex gap-3"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-5 py-3 focus:ring-2 focus:ring-brand-500 transition-all text-sm font-medium dark:text-white dark:placeholder-slate-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="p-3 bg-gradient-to-r from-brand-600 to-electric-blue text-white rounded-xl shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center justify-center"
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default AIChatBot

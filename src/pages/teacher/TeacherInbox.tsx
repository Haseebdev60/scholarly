
import { useEffect, useState } from 'react'
import { teacherApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/Button'

const TeacherInbox = () => {
    const { user } = useAuth()
    const [conversations, setConversations] = useState<{ _id: string, name: string, lastMessage: any }[]>([])
    const [activeConversation, setActiveConversation] = useState<string | null>(null)
    const [chatHistory, setChatHistory] = useState<any[]>([])
    const [chatInput, setChatInput] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        try {
            const convs = await teacherApi.getConversations()
            setConversations(convs)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectConversation = async (id: string) => {
        setActiveConversation(id)
        try {
            const thread = await teacherApi.getThread(id)
            setChatHistory(thread)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSendMessage = async () => {
        if (!activeConversation || !chatInput.trim()) return
        try {
            await teacherApi.sendMessage(activeConversation, chatInput)
            setChatInput('')
            const thread = await teacherApi.getThread(activeConversation)
            setChatHistory(thread)
            // Refresh list to update last message
            loadConversations()
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) return <div>Loading messages...</div>

    return (
        <div className="flex h-[calc(100vh-12rem)] min-h-[500px] gap-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="w-1/3 border-r border-slate-100 flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-700">Conversations</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {conversations.length === 0 ? (
                        <p className="text-sm text-slate-400 p-4 text-center">No chats yet.</p>
                    ) : (
                        <ul className="space-y-1">
                            {conversations.map(c => (
                                <li
                                    key={c._id}
                                    onClick={() => handleSelectConversation(c._id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${activeConversation === c._id ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-100' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    <div className="font-semibold text-sm">{c.name}</div>
                                    <div className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage?.content}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-slate-50/50">
                {activeConversation ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {chatHistory.map((msg, idx) => {
                                const isMe = msg.senderId === user?._id
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                            <input
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                placeholder="Type a message..."
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendMessage()
                                }}
                            />
                            <Button size="sm" onClick={handleSendMessage}>Send</Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherInbox

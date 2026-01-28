import { useState } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import Button from './Button'

type MessageModalProps = {
    isOpen: boolean
    onClose: () => void
    recipientName: string
    onSubmit: (data: { subject: string; message: string }) => void
}

const MessageModal = ({ isOpen, onClose, recipientName, onSubmit }: MessageModalProps) => {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isSending, setIsSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject.trim() || !message.trim()) {
            setError('Please fill in all fields')
            return
        }

        setIsSending(true)
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        onSubmit({ subject, message })
        setSubject('')
        setMessage('')
        setError('')
        setIsSending(false)
        onClose()
    }

    return (
        <Modal open={isOpen} onClose={onClose} title={`Message ${recipientName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this about?"
                />

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Message</label>
                    <textarea
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Write your message to ${recipientName}...`}
                    />
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default MessageModal

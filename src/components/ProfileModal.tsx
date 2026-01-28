import { useState, useEffect } from 'react'
import Modal from './Modal'
import FormField from './FormField'
import Button from './Button'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../lib/api'
import AlertDialog from './AlertDialog'

type ProfileModalProps = {
    open: boolean
    onClose: () => void
}

const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
    const { user, updateUser } = useAuth()
    const [name, setName] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'confirm' }>({
        open: false,
        title: '',
        message: '',
        type: 'info'
    })

    useEffect(() => {
        if (user) {
            setName(user.name)
            setPreview(user.avatar || '')
            setFile(null)
            setError('')
        }
    }, [user, open])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            if (f.size > 2 * 1024 * 1024) {
                setError('File too large (max 2MB)')
                return
            }
            setFile(f)
            setPreview(URL.createObjectURL(f))
            setError('')
        }
    }

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let avatar = user?.avatar
            if (file) {
                avatar = await convertToBase64(file)
            }

            const res = await authApi.updateProfile({ name, avatar })
            if (res.success) {
                if (user) {
                    updateUser({ ...user, ...res.user })
                }
                setAlertState({ open: true, title: 'Success', message: 'Profile updated successfully', type: 'success' })
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="Edit Profile">
            <AlertDialog
                open={alertState.open}
                onClose={() => {
                    setAlertState(prev => ({ ...prev, open: false }))
                    if (alertState.type === 'success') {
                        onClose()
                    }
                }}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative h-24 w-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                        {preview ? (
                            <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-4xl text-slate-300">?</span>
                        )}
                    </div>
                    <label className="cursor-pointer rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200">
                        Change Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>

                <FormField label="Full Name" value={name} onChange={e => setName(e.target.value)} required />

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </form>
        </Modal>
    )
}

export default ProfileModal

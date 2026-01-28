
import { useEffect, useState } from 'react'
import { adminApi, publicApi } from '../../lib/api'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import AlertDialog, { type AlertDialogProps } from '../../components/AlertDialog'
import {
    TrashIcon,
    DocumentArrowUpIcon,
    FilmIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline'

const AdminResources = () => {
    const [resources, setResources] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeModal, setActiveModal] = useState<'upload-select' | 'upload-doc' | 'upload-video' | null>(null)

    // Upload Forms
    const [uploadDoc, setUploadDoc] = useState({ title: '', file: null as File | null, isPremium: false })
    const [uploadVideo, setUploadVideo] = useState({ title: '', type: 'file' as 'file' | 'link', file: null as File | null, url: '', isPremium: false })
    const [modalError, setModalError] = useState('')

    const [alertState, setAlertState] = useState<Omit<AlertDialogProps, 'onClose' | 'onConfirm'> & { open: boolean }>({
        open: false, title: '', message: '', type: 'info'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await publicApi.getDownloads()
            setResources(data)
        } catch (error) {
            console.error('Failed to load resources:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteResource = async (resourceId: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return
        try {
            await adminApi.deleteResource(resourceId)
            loadData()
            setAlertState({ open: true, title: 'Success', message: 'Resource deleted successfully', type: 'success' })
        } catch (error: any) {
            setAlertState({ open: true, title: 'Error', message: error.message || 'Failed to delete resource', type: 'error' })
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

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!uploadDoc.title || !uploadDoc.file) return
        setModalError('')
        try {
            const base64 = await convertToBase64(uploadDoc.file)
            await adminApi.uploadResource({
                title: uploadDoc.title,
                type: uploadDoc.file.name.split('.').pop() || 'doc',
                url: '',
                fileType: uploadDoc.file.type || 'application/octet-stream',
                size: (uploadDoc.file.size / 1024).toFixed(2) + ' KB',
                fileData: base64,
                fileName: uploadDoc.file.name,
                isPremium: uploadDoc.isPremium
            })
            setAlertState({ open: true, title: 'Success', message: 'Document uploaded successfully!', type: 'success' })
            setActiveModal(null)
            setUploadDoc({ title: '', file: null, isPremium: false })
            loadData()
        } catch (error: any) {
            setModalError(error.message || 'Upload failed')
        }
    }

    const generateVideoThumbnail = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.src = URL.createObjectURL(file)
            video.onloadedmetadata = () => { video.currentTime = 1 }
            video.onseeked = () => {
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL('image/jpeg', 0.7))
            }
        })
    }

    const getYouTubeThumbnail = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
        }
        return ''
    }

    const handleUploadVideo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!uploadVideo.title) return
        if (uploadVideo.type === 'file' && !uploadVideo.file) return
        if (uploadVideo.type === 'link' && !uploadVideo.url) return

        setModalError('')
        try {
            let base64 = ''
            let url = uploadVideo.url
            let thumb = ''

            if (uploadVideo.type === 'file' && uploadVideo.file) {
                base64 = await convertToBase64(uploadVideo.file)
                url = ''
                try { thumb = await generateVideoThumbnail(uploadVideo.file) } catch (e) { }
            } else if (uploadVideo.type === 'link') {
                thumb = getYouTubeThumbnail(uploadVideo.url)
            }

            await adminApi.uploadResource({
                title: uploadVideo.title,
                type: uploadVideo.type === 'file' ? 'video' : 'link',
                url: url,
                fileType: uploadVideo.type === 'file' ? uploadVideo.file!.type : 'video/link',
                fileData: base64 || undefined,
                fileName: uploadVideo.file?.name,
                isPremium: uploadVideo.isPremium,
                thumbnail: thumb
            })
            setAlertState({ open: true, title: 'Success', message: 'Video resource added successfully!', type: 'success' })
            setActiveModal(null)
            setUploadVideo({ title: '', type: 'file', file: null, url: '', isPremium: false })
            loadData()
        } catch (error: any) {
            setModalError(error.message || 'Upload failed')
        }
    }

    const documents = resources.filter(r => ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(r.type) || r.type === 'pdf')
    const videos = resources.filter(r => ['video', 'mp4', 'mkv', 'avi', 'mov', 'link'].includes(r.type) || r.type === 'video')

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <AlertDialog
                open={alertState.open}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Manage Resources</h2>
                <Button onClick={() => setActiveModal('upload-select')} className="flex items-center gap-2">
                    <ArrowUpTrayIcon className="h-4 w-4" />
                    Upload
                </Button>
            </div>

            <Card>
                <div className="space-y-8">
                    <div>
                        <h4 className="mb-2 font-semibold text-slate-800 border-b pb-2">Documents</h4>
                        {documents.length === 0 ? (
                            <p className="text-slate-500 italic">No documents found.</p>
                        ) : (
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div key={doc._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="rounded-full bg-blue-100 p-2 text-blue-600 shrink-0"><DocumentArrowUpIcon className="h-5 w-5" /></div>
                                            <div className="truncate">
                                                <div className="font-medium text-slate-900 truncate">{doc.title}</div>
                                                <div className="text-xs text-slate-500 uppercase">{doc.type} • {doc.uploadedBy ? `By ${doc.uploadedBy}` : 'Unknown'}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="shrink-0 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteResource(doc._id)} title="Delete Document"><TrashIcon className="h-5 w-5" /></Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="mb-2 font-semibold text-slate-800 border-b pb-2">Videos</h4>
                        {videos.length === 0 ? (
                            <p className="text-slate-500 italic">No videos found.</p>
                        ) : (
                            <div className="space-y-2">
                                {videos.map((video) => (
                                    <div key={video._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="rounded-full bg-red-100 p-2 text-red-600 shrink-0"><FilmIcon className="h-5 w-5" /></div>
                                            <div className="truncate">
                                                <div className="font-medium text-slate-900 truncate">{video.title}</div>
                                                <div className="text-xs text-slate-500 uppercase">{video.type} • {video.uploadedBy ? `By ${video.uploadedBy}` : 'Unknown'}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="shrink-0 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteResource(video._id)} title="Delete Video"><TrashIcon className="h-5 w-5" /></Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Modal open={activeModal === 'upload-select'} onClose={() => setActiveModal(null)} title="Select Upload Type">
                <div className="grid grid-cols-2 gap-4 p-4">
                    <button onClick={() => setActiveModal('upload-doc')} className="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-100 p-6 transition hover:border-brand-200 hover:bg-brand-50">
                        <div className="rounded-full bg-blue-100 p-4 text-blue-600"><DocumentArrowUpIcon className="h-8 w-8" /></div>
                        <span className="font-semibold text-slate-900">Document</span>
                    </button>
                    <button onClick={() => setActiveModal('upload-video')} className="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-100 p-6 transition hover:border-brand-200 hover:bg-brand-50">
                        <div className="rounded-full bg-red-100 p-4 text-red-600"><FilmIcon className="h-8 w-8" /></div>
                        <span className="font-semibold text-slate-900">Video</span>
                    </button>
                </div>
            </Modal>

            <Modal open={activeModal === 'upload-doc'} onClose={() => setActiveModal(null)} title="Upload Document">
                <form onSubmit={handleUploadDoc} className="space-y-4">
                    <FormField label="Document Title" value={uploadDoc.title} onChange={(e) => setUploadDoc({ ...uploadDoc, title: e.target.value })} required />
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Select File</label>
                        <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={(e) => setUploadDoc({ ...uploadDoc, file: e.target.files ? e.target.files[0] : null })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" required />
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={uploadDoc.isPremium} onChange={(e) => setUploadDoc({ ...uploadDoc, isPremium: e.target.checked })} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                            <label className="text-sm text-slate-700">Premium Resource</label>
                        </div>
                    </div>
                    {modalError && <div className="text-sm text-red-600">{modalError}</div>}
                    <Button type="submit" className="w-full">Upload Document</Button>
                </form>
            </Modal>

            <Modal open={activeModal === 'upload-video'} onClose={() => setActiveModal(null)} title="Upload Video">
                <form onSubmit={handleUploadVideo} className="space-y-4">
                    <FormField label="Video Title" value={uploadVideo.title} onChange={(e) => setUploadVideo({ ...uploadVideo, title: e.target.value })} required />
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" checked={uploadVideo.type === 'file'} onChange={() => setUploadVideo({ ...uploadVideo, type: 'file' })} />
                            <span>Upload File</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" checked={uploadVideo.type === 'link'} onChange={() => setUploadVideo({ ...uploadVideo, type: 'link' })} />
                            <span>External Link</span>
                        </label>
                    </div>
                    {uploadVideo.type === 'file' ? (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Select Video File</label>
                            <input type="file" accept=".mp4,.mkv,.avi,.mov" onChange={(e) => setUploadVideo({ ...uploadVideo, file: e.target.files ? e.target.files[0] : null })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" required />
                        </div>
                    ) : (
                        <FormField label="Video Link" value={uploadVideo.url} onChange={(e) => setUploadVideo({ ...uploadVideo, url: e.target.value })} placeholder="https://youtube.com/..." required />
                    )}
                    {modalError && <div className="text-sm text-red-600">{modalError}</div>}
                    <Button type="submit" className="w-full">{uploadVideo.type === 'file' ? 'Upload Video' : 'Save Video Link'}</Button>
                </form>
            </Modal>
        </div >
    )
}

export default AdminResources

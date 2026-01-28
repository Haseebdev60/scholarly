
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teacherApi, publicApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import {
    BookOpenIcon,
    DocumentArrowUpIcon,
    FilmIcon,
    TrashIcon,
} from '@heroicons/react/24/outline'

type ClassItem = {
    _id: string
    title: string
    scheduledDate: string
    duration: number
    subjectId: { _id: string; title: string }
    classType: 'live' | 'recorded'
    meetingLink?: string
}

type ResourceItem = {
    _id: string
    title: string
    type: 'pdf' | 'video' | 'link'
    url: string
    subjectId: { _id: string; title: string }
}

type SubjectItem = {
    _id: string
    title: string
}

const TeacherOverview = () => {
    const { user } = useAuth()
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [resources, setResources] = useState<ResourceItem[]>([])
    const [subjects, setSubjects] = useState<SubjectItem[]>([])
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [activeModal, setActiveModal] = useState<'createClass' | 'upload-select' | 'upload-doc' | 'upload-video' | null>(null)
    const [classForm, setClassForm] = useState({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live' as 'live' | 'recorded', meetingLink: '' })
    const [uploadDoc, setUploadDoc] = useState({ title: '', subjectId: '', file: null as File | null, isPremium: false })
    const [uploadVideo, setUploadVideo] = useState({ title: '', subjectId: '', type: 'file' as 'file' | 'link', file: null as File | null, url: '', isPremium: false })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [dash, subs] = await Promise.all([
                teacherApi.getDashboard(),
                teacherApi.getAssignedSubjects()
            ])
            setClasses(dash.classes)
            setResources(dash.resources)
            setSubjects(subs)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await teacherApi.createClass({
                ...classForm,
                duration: Number(classForm.duration),
            })
            setActiveModal(null)
            setClassForm({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' })
            loadData()
        } catch (err) {
            alert('Failed to create class')
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
        if (!uploadDoc.title || !uploadDoc.file || !uploadDoc.subjectId) return

        try {
            const base64 = await convertToBase64(uploadDoc.file)
            await teacherApi.createResource({
                title: uploadDoc.title,
                subjectId: uploadDoc.subjectId,
                type: uploadDoc.file.name.split('.').pop() || 'doc',
                url: '',
                fileType: uploadDoc.file.type || 'application/octet-stream',
                size: (uploadDoc.file.size / 1024).toFixed(2) + ' KB',
                fileData: base64,
                fileName: uploadDoc.file.name,
                format: uploadDoc.file.name.split('.').pop()?.toUpperCase(),
                isPremium: uploadDoc.isPremium
            })
            alert('Document uploaded successfully!')
            setActiveModal(null)
            setUploadDoc({ title: '', subjectId: '', file: null, isPremium: false })
            loadData()
        } catch (err: any) {
            alert(`Failed to upload document: ${err.message || err}`)
        }
    }

    const generateVideoThumbnail = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.src = URL.createObjectURL(file)
            video.currentTime = 1
            video.onloadeddata = () => { }
            video.onseeked = () => {
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL('image/jpeg', 0.7))
            }
            video.currentTime = 1
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
        if (!uploadVideo.title || !uploadVideo.subjectId) return
        if (uploadVideo.type === 'file' && !uploadVideo.file) return
        if (uploadVideo.type === 'link' && !uploadVideo.url) return

        try {
            let base64 = ''
            let url = uploadVideo.url
            let thumb = ''

            if (uploadVideo.type === 'file' && uploadVideo.file) {
                base64 = await convertToBase64(uploadVideo.file)
                url = ''
                try {
                    thumb = await generateVideoThumbnail(uploadVideo.file)
                } catch (e) { console.error('Thumb gen failed', e) }
            } else if (uploadVideo.type === 'link') {
                thumb = getYouTubeThumbnail(uploadVideo.url)
            }

            await teacherApi.createResource({
                title: uploadVideo.title,
                subjectId: uploadVideo.subjectId,
                type: uploadVideo.type === 'file' ? 'video' : 'link',
                url: url,
                fileType: uploadVideo.type === 'file' ? uploadVideo.file!.type : 'video/link',
                fileData: base64 || undefined,
                fileName: uploadVideo.file?.name,
                isPremium: uploadVideo.isPremium,
                thumbnail: thumb
            })
            alert('Video resource added successfully!')
            setActiveModal(null)
            setUploadVideo({ title: '', subjectId: '', type: 'file', file: null, url: '', isPremium: false })
            loadData()
        } catch (err: any) {
            console.error(err)
            alert(`Failed to upload video: ${err.message || err}`)
        }
    }

    const handleDeleteResource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return
        try {
            await teacherApi.deleteResource(id)
            loadData()
        } catch (err) {
            alert('Failed to delete resource')
        }
    }

    const filteredClasses = selectedSubjectId
        ? classes.filter(c => c.subjectId?._id === selectedSubjectId)
        : classes

    const filteredResources = selectedSubjectId
        ? resources.filter(r => r.subjectId?._id === selectedSubjectId)
        : resources

    if (isLoading) return <div className="p-8">Loading...</div>

    return (
        <div className="space-y-8">
            {/* Quick Actions */}
            <div className="flex gap-2 pb-4 border-b border-slate-100">
                <Button variant="secondary" onClick={() => setActiveModal('upload-select')}>+ New Upload</Button>
                <Button onClick={() => {
                    setActiveModal('createClass')
                    setClassForm({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' })
                }}>+ New Class</Button>
                <Link to="/dashboard/teacher/inbox" className="ml-auto">
                    <Button variant="outline">Messages</Button>
                </Link>
            </div>

            {/* Assigned Subjects */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Assigned Subjects</h3>
                {subjects.length === 0 ? (
                    <Card className="text-center text-slate-500 py-6">
                        You have not been assigned any subjects yet.
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {subjects.map((subject) => {
                            const isSelected = selectedSubjectId === subject._id
                            return (
                                <Card
                                    key={subject._id}
                                    onClick={() => setSelectedSubjectId(isSelected ? null : subject._id)}
                                    className={`flex items-center gap-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${isSelected ? 'border-l-brand-600 bg-brand-50 ring-2 ring-brand-200' : 'border-l-brand-500'}`}
                                >
                                    <div className={`rounded-full p-3 ${isSelected ? 'bg-brand-200 text-brand-700' : 'bg-brand-100 text-brand-600'}`}>
                                        <BookOpenIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{subject.title}</h4>
                                        <p className="text-xs text-slate-500">{isSelected ? 'Selected' : 'Subject Coordinator'}</p>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Upcoming Sessions */}
                <Card className="space-y-4 h-full">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Upcoming Sessions</h3>
                        {selectedSubjectId && <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => setSelectedSubjectId(null)}>Clear Filter</Button>}
                    </div>
                    {filteredClasses.length === 0 ? (
                        <p className="text-sm text-slate-500">No upcoming classes {selectedSubjectId ? 'for this subject' : ''}.</p>
                    ) : (
                        <ul className="space-y-3">
                            {filteredClasses.slice(0, 5).map((cls) => (
                                <li key={cls._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                    <div>
                                        <div className="font-semibold text-slate-900">{cls.title}</div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(cls.scheduledDate).toLocaleString()} • {cls.subjectId?.title || 'Unknown Subject'}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {filteredClasses.length > 5 && (
                                <div className="text-center pt-2">
                                    <Link to="/dashboard/teacher/classes" className="text-sm text-brand-600 hover:underline">View all sessions</Link>
                                </div>
                            )}
                        </ul>
                    )}
                </Card>

                {/* Uploads */}
                <Card className="space-y-4 h-full">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Recent Uploads</h3>
                    </div>
                    {filteredResources.length === 0 ? (
                        <p className="text-sm text-slate-500">No resources uploaded {selectedSubjectId ? 'for this subject' : ''}.</p>
                    ) : (
                        <ul className="space-y-3">
                            {filteredResources.map((res) => (
                                <li key={res._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                    <div className="overflow-hidden">
                                        <div className="font-semibold text-slate-900 truncate">{res.title}</div>
                                        <div className="text-xs text-slate-500 uppercase">{res.type} • {res.subjectId?.title || 'General'}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={res.url} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-brand-600">
                                            <DocumentArrowUpIcon className="h-4 w-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDeleteResource(res._id)}
                                            className="p-1 text-slate-400 hover:text-red-600"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            {/* Modals for Quick Actions */}
            <Modal open={activeModal === 'createClass'} onClose={() => setActiveModal(null)} title="Create New Class">
                <form onSubmit={handleCreateClass} className="space-y-4">
                    <FormField label="Title" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} />
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                        <select
                            className="w-full rounded-md border border-slate-300 p-2 text-sm"
                            value={classForm.subjectId}
                            onChange={e => setClassForm({ ...classForm, subjectId: e.target.value })}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>
                    <FormField label="Date & Time" type="datetime-local" value={classForm.scheduledDate} onChange={e => setClassForm({ ...classForm, scheduledDate: e.target.value })} />
                    <FormField label="Duration (minutes)" type="number" value={String(classForm.duration)} onChange={e => setClassForm({ ...classForm, duration: Number(e.target.value) })} />
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                        <select
                            className="w-full rounded-md border border-slate-300 p-2 text-sm"
                            value={classForm.classType}
                            onChange={e => setClassForm({ ...classForm, classType: e.target.value as any })}
                        >
                            <option value="live">Live</option>
                            <option value="recorded">Recorded</option>
                        </select>
                    </div>
                    {classForm.classType === 'live' && (
                        <FormField label="Meeting Link (e.g. Zoom/Meet)" value={classForm.meetingLink} onChange={e => setClassForm({ ...classForm, meetingLink: e.target.value })} placeholder="https://..." />
                    )}
                    <Button type="submit" className="w-full">Create Class</Button>
                </form>
            </Modal>

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
                        <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                        <select className="w-full rounded-md border border-slate-300 p-2 text-sm" value={uploadDoc.subjectId} onChange={e => setUploadDoc({ ...uploadDoc, subjectId: e.target.value })} required>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Select File (PDF, DOC, etc)</label>
                        <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={(e) => setUploadDoc({ ...uploadDoc, file: e.target.files ? e.target.files[0] : null })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" required />
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={uploadDoc.isPremium} onChange={(e) => setUploadDoc({ ...uploadDoc, isPremium: e.target.checked })} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                            <label className="text-sm text-slate-700">Premium Resource</label>
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Upload Document</Button>
                </form>
            </Modal>

            <Modal open={activeModal === 'upload-video'} onClose={() => setActiveModal(null)} title="Upload Video">
                <form onSubmit={handleUploadVideo} className="space-y-4">
                    <FormField label="Video Title" value={uploadVideo.title} onChange={(e) => setUploadVideo({ ...uploadVideo, title: e.target.value })} required />
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                        <select className="w-full rounded-md border border-slate-300 p-2 text-sm" value={uploadVideo.subjectId} onChange={e => setUploadVideo({ ...uploadVideo, subjectId: e.target.value })} required>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>
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
                    <Button type="submit" className="w-full">{uploadVideo.type === 'file' ? 'Upload Video' : 'Save Video Link'}</Button>
                </form>
            </Modal>
        </div>
    )
}

export default TeacherOverview

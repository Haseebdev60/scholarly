import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teacherApi } from '../../lib/api'
import Button from '../../components/Button'
import { GlassCard } from '../../components/GlassCard'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import Badge from '../../components/Badge'
import AlertDialog, { type AlertDialogProps } from '../../components/AlertDialog'
import {
    BookOpenIcon,
    DocumentArrowUpIcon,
    FilmIcon,
    TrashIcon,
    VideoCameraIcon,
    PlusIcon
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
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [resources, setResources] = useState<ResourceItem[]>([])
    const [subjects, setSubjects] = useState<SubjectItem[]>([])
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [activeModal, setActiveModal] = useState<'createClass' | 'upload-select' | 'upload-doc' | 'upload-video' | null>(null)
    const [classForm, setClassForm] = useState({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live' as 'live' | 'recorded', meetingLink: '' })
    const [uploadDoc, setUploadDoc] = useState({ title: '', subjectId: '', file: null as File | null, isPremium: false })
    const [uploadVideo, setUploadVideo] = useState({ title: '', subjectId: '', type: 'file' as 'file' | 'link', file: null as File | null, url: '', isPremium: false })
    const [alertState, setAlertState] = useState<Omit<AlertDialogProps, 'onClose' | 'onConfirm'> & { open: boolean }>({
        open: false, title: '', message: '', type: 'info'
    })

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
            setAlertState({
                open: true,
                title: 'Success',
                message: 'Class scheduled successfully!',
                type: 'success'
            })
        } catch (err: any) {
            setAlertState({
                open: true,
                title: 'Error',
                message: err.message || 'Failed to create class',
                type: 'error'
            })
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
            setActiveModal(null)
            setUploadDoc({ title: '', subjectId: '', file: null, isPremium: false })
            loadData()
            setAlertState({
                open: true,
                title: 'Success',
                message: 'Document uploaded successfully!',
                type: 'success'
            })
        } catch (err: any) {
            setAlertState({
                open: true,
                title: 'Error',
                message: `Failed to upload document: ${err.message || err}`,
                type: 'error'
            })
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
            setActiveModal(null)
            setUploadVideo({ title: '', subjectId: '', type: 'file', file: null, url: '', isPremium: false })
            loadData()
            setAlertState({
                open: true,
                title: 'Success',
                message: 'Video resource added successfully!',
                type: 'success'
            })
        } catch (err: any) {
            console.error(err)
            setAlertState({
                open: true,
                title: 'Error',
                message: `Failed to upload video: ${err.message || err}`,
                type: 'error'
            })
        }
    }

    const handleDeleteResource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return
        try {
            await teacherApi.deleteResource(id)
            loadData()
            setAlertState({
                open: true,
                title: 'Deleted',
                message: 'Resource deleted successfully.',
                type: 'success'
            })
        } catch (err: any) {
            setAlertState({
                open: true,
                title: 'Error',
                message: err.message || 'Failed to delete resource',
                type: 'error'
            })
        }
    }

    const filteredClasses = selectedSubjectId
        ? classes.filter(c => c.subjectId?._id === selectedSubjectId)
        : classes

    const filteredResources = selectedSubjectId
        ? resources.filter(r => r.subjectId?._id === selectedSubjectId)
        : resources

    if (isLoading) return <div className="p-8 font-bold animate-pulse text-slate-500">Loading...</div>

    return (
        <div className="space-y-8">
            <AlertDialog
                open={alertState.open}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
            {/* Quick Actions */}
            <div className="flex gap-4 pb-6 border-b border-slate-200/50 dark:border-white/5">
                <Button className="bg-gradient-to-r from-brand-600 to-electric-blue border-none shadow-glow font-bold h-12 px-6 rounded-xl text-white" onClick={() => setActiveModal('upload-select')}>
                    <PlusIcon className="w-5 h-5 mr-2" /> New Upload
                </Button>
                <Button className="font-bold h-12 px-6 rounded-xl" onClick={() => {
                    setActiveModal('createClass')
                    setClassForm({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' })
                }}>
                    <VideoCameraIcon className="w-5 h-5 mr-2" /> New Class
                </Button>
                <Link to="/dashboard/teacher/inbox" className="ml-auto">
                    <Button variant="outline" className="h-12 font-bold rounded-xl border-slate-200 dark:border-white/10 dark:text-white bg-white/50 dark:bg-slate-800/50">Messages</Button>
                </Link>
            </div>

            {/* Assigned Subjects */}
            <div className="space-y-4">
                <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white">Assigned Subjects</h3>
                {subjects.length === 0 ? (
                    <GlassCard className="text-center font-bold text-slate-500 dark:text-slate-400 py-10">
                        You have not been assigned any subjects yet.
                    </GlassCard>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {subjects.map((subject) => {
                            const isSelected = selectedSubjectId === subject._id
                            return (
                                <GlassCard
                                    key={subject._id}
                                    onClick={() => setSelectedSubjectId(isSelected ? null : subject._id)}
                                    className={`flex items-center gap-4 cursor-pointer overflow-hidden group ${isSelected ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 shadow-glow ring-1 ring-brand-500' : 'hover:border-brand-300 dark:hover:border-brand-500/30'}`}
                                >
                                    <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${isSelected ? 'bg-brand-500' : 'bg-transparent group-hover:bg-brand-300'}`} />
                                    <div className={`rounded-xl p-3 shadow-sm ${isSelected ? 'bg-brand-500 text-white shadow-glow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors'}`}>
                                        <BookOpenIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{subject.title}</h4>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{isSelected ? 'Filtering...' : 'Subject Coordinator'}</p>
                                    </div>
                                </GlassCard>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming Sessions */}
                <GlassCard className="space-y-6 h-full p-8 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">Upcoming Sessions</h3>
                        {selectedSubjectId && <Button variant="ghost" className="text-xs px-3 py-1 font-bold rounded-lg border border-slate-200 dark:border-white/10" onClick={() => setSelectedSubjectId(null)}>Clear Filter</Button>}
                    </div>
                    {filteredClasses.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl p-6 text-center">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No upcoming classes {selectedSubjectId ? 'for this subject' : ''}.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3 flex-1">
                            {filteredClasses.slice(0, 5).map((cls) => (
                                <li key={cls._id} className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{cls.title}</div>
                                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                            <Badge className="px-1.5 py-0 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border-none">{cls.subjectId?.title || 'Unknown'}</Badge>
                                            {new Date(cls.scheduledDate).toLocaleString()} 
                                        </div>
                                    </div>
                                    <Badge color={cls.classType === 'live' ? 'red' : 'brand'} className="animate-pulse">{cls.classType}</Badge>
                                </li>
                            ))}
                            {filteredClasses.length > 5 && (
                                <div className="text-center pt-4">
                                    <Link to="/dashboard/teacher/classes" className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline">View all sessions →</Link>
                                </div>
                            )}
                        </ul>
                    )}
                </GlassCard>

                {/* Uploads */}
                <GlassCard className="space-y-6 h-full p-8 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">Recent Uploads</h3>
                    </div>
                    {filteredResources.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl p-6 text-center">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No resources uploaded {selectedSubjectId ? 'for this subject' : ''}.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3 flex-1">
                            {filteredResources.slice(0,5).map((res) => (
                                <li key={res._id} className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 p-4 shadow-sm group hover:border-brand-200 dark:hover:border-brand-500/30 transition-colors">
                                    <div className="overflow-hidden pr-4">
                                        <div className="font-bold text-slate-900 dark:text-white truncate">{res.title}</div>
                                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                            <Badge className="px-1.5 py-0 bg-slate-100 dark:bg-slate-700 border-none uppercase">{res.type}</Badge>
                                            {res.subjectId?.title || 'General'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a href={res.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-50 dark:bg-slate-900 rounded-lg transition-colors">
                                            <DocumentArrowUpIcon className="h-5 w-5" />
                                        </a>
                                        <button
                                            onClick={() => handleDeleteResource(res._id)}
                                            className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-900 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </GlassCard>
            </div>

            {/* Modals for Quick Actions */}
            <Modal open={activeModal === 'createClass'} onClose={() => setActiveModal(null)} title="Create New Class">
                <form onSubmit={handleCreateClass} className="space-y-4">
                    <FormField label="Title" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} />
                    <div>
                        <label className="mb-1 block text-sm font-bold text-slate-900 dark:text-white">Subject</label>
                        <select
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 dark:text-white"
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
                        <label className="mb-1 block text-sm font-bold text-slate-900 dark:text-white">Type</label>
                        <select
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 dark:text-white"
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
                    <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-glow bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white">Create Class</Button>
                </form>
            </Modal>

            <Modal open={activeModal === 'upload-select'} onClose={() => setActiveModal(null)} title="Select Upload Type">
                <div className="grid grid-cols-2 gap-4 p-4">
                    <button onClick={() => setActiveModal('upload-doc')} className="flex flex-col items-center gap-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 p-8 transition-all hover:border-brand-300 dark:hover:border-brand-500/30 hover:bg-brand-50 dark:hover:bg-brand-500/10">
                        <div className="rounded-2xl bg-blue-100 dark:bg-blue-900/30 p-4 text-blue-600 dark:text-blue-400 shadow-sm"><DocumentArrowUpIcon className="h-10 w-10" /></div>
                        <span className="font-bold text-slate-900 dark:text-white text-lg">Document</span>
                    </button>
                    <button onClick={() => setActiveModal('upload-video')} className="flex flex-col items-center gap-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 p-8 transition-all hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <div className="rounded-2xl bg-red-100 dark:bg-red-900/30 p-4 text-red-600 dark:text-red-400 shadow-sm"><FilmIcon className="h-10 w-10" /></div>
                        <span className="font-bold text-slate-900 dark:text-white text-lg">Video</span>
                    </button>
                </div>
            </Modal>

            <Modal open={activeModal === 'upload-doc'} onClose={() => setActiveModal(null)} title="Upload Document">
                <form onSubmit={handleUploadDoc} className="space-y-5">
                    <FormField label="Document Title" value={uploadDoc.title} onChange={(e) => setUploadDoc({ ...uploadDoc, title: e.target.value })} required />
                    <div>
                        <label className="mb-1 block text-sm font-bold text-slate-900 dark:text-white">Subject</label>
                        <select className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 dark:text-white" value={uploadDoc.subjectId} onChange={e => setUploadDoc({ ...uploadDoc, subjectId: e.target.value })} required>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">Select File (PDF, DOC, etc)</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={(e) => setUploadDoc({ ...uploadDoc, file: e.target.files ? e.target.files[0] : null })} className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-400 hover:file:bg-brand-100 cursor-pointer mx-auto" required />
                        </div>
                        <div className="flex items-center gap-3 mt-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20">
                            <input type="checkbox" id="premiumDoc" checked={uploadDoc.isPremium} onChange={(e) => setUploadDoc({ ...uploadDoc, isPremium: e.target.checked })} className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 w-5 h-5 cursor-pointer" />
                            <label htmlFor="premiumDoc" className="text-sm font-bold text-amber-900 dark:text-amber-400 cursor-pointer">Mark as Premium Resource</label>
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-glow bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white">Upload Document</Button>
                </form>
            </Modal>

            <Modal open={activeModal === 'upload-video'} onClose={() => setActiveModal(null)} title="Upload Video">
                <form onSubmit={handleUploadVideo} className="space-y-5">
                    <FormField label="Video Title" value={uploadVideo.title} onChange={(e) => setUploadVideo({ ...uploadVideo, title: e.target.value })} required />
                    <div>
                        <label className="mb-1 block text-sm font-bold text-slate-900 dark:text-white">Subject</label>
                        <select className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 dark:text-white" value={uploadVideo.subjectId} onChange={e => setUploadVideo({ ...uploadVideo, subjectId: e.target.value })} required>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg cursor-pointer transition-colors font-bold text-sm ${uploadVideo.type === 'file' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                            <input type="radio" checked={uploadVideo.type === 'file'} onChange={() => setUploadVideo({ ...uploadVideo, type: 'file' })} className="sr-only" />
                            <span>Upload File</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg cursor-pointer transition-colors font-bold text-sm ${uploadVideo.type === 'link' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                            <input type="radio" checked={uploadVideo.type === 'link'} onChange={() => setUploadVideo({ ...uploadVideo, type: 'link' })} className="sr-only" />
                            <span>External Link</span>
                        </label>
                    </div>
                    
                    {uploadVideo.type === 'file' ? (
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">Select Video File</label>
                            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <input type="file" accept=".mp4,.mkv,.avi,.mov" onChange={(e) => setUploadVideo({ ...uploadVideo, file: e.target.files ? e.target.files[0] : null })} className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-400 hover:file:bg-brand-100 cursor-pointer mx-auto" required />
                            </div>
                        </div>
                    ) : (
                        <FormField label="Video Link" value={uploadVideo.url} onChange={(e) => setUploadVideo({ ...uploadVideo, url: e.target.value })} placeholder="https://youtube.com/..." required />
                    )}

                    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20">
                        <input type="checkbox" id="premiumVid" checked={uploadVideo.isPremium} onChange={(e) => setUploadVideo({ ...uploadVideo, isPremium: e.target.checked })} className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 w-5 h-5 cursor-pointer" />
                        <label htmlFor="premiumVid" className="text-sm font-bold text-amber-900 dark:text-amber-400 cursor-pointer">Mark as Premium Resource</label>
                    </div>

                    <Button type="submit" className="w-full h-12 font-bold rounded-xl shadow-glow bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white">{uploadVideo.type === 'file' ? 'Upload Video' : 'Save Video Link'}</Button>
                </form>
            </Modal>
        </div>
    )
}

export default TeacherOverview

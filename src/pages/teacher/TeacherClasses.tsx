
import { useEffect, useState } from 'react'
import { teacherApi } from '../../lib/api'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'

type ClassItem = {
    _id: string
    title: string
    scheduledDate: string
    duration: number
    subjectId: { _id: string; title: string }
    classType: 'live' | 'recorded'
    meetingLink?: string
}

type SubjectItem = {
    _id: string
    title: string
}

const TeacherClasses = () => {
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [subjects, setSubjects] = useState<SubjectItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null)
    const [editingClassId, setEditingClassId] = useState<string | null>(null)
    const [classForm, setClassForm] = useState({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live' as 'live' | 'recorded', meetingLink: '' })

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
            setSubjects(subs)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
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

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingClassId) return
        try {
            await teacherApi.updateClass(editingClassId, {
                title: classForm.title,
                scheduledDate: classForm.scheduledDate,
                duration: Number(classForm.duration),
                meetingLink: classForm.meetingLink
            })
            setActiveModal(null)
            setEditingClassId(null)
            loadData()
        } catch (err) {
            alert('Failed to update class')
        }
    }

    const openEditClass = (cls: ClassItem) => {
        const date = new Date(cls.scheduledDate)
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
        const dateStr = date.toISOString().slice(0, 16)

        setClassForm({
            title: cls.title,
            subjectId: cls.subjectId._id,
            scheduledDate: dateStr,
            duration: cls.duration,
            classType: cls.classType,
            meetingLink: cls.meetingLink || ''
        })
        setEditingClassId(cls._id)
        setActiveModal('edit')
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Manage Classes</h2>
                <Button onClick={() => {
                    setActiveModal('create')
                    setEditingClassId(null)
                    setClassForm({ title: '', subjectId: '', scheduledDate: '', duration: 60, classType: 'live', meetingLink: '' })
                }}>+ New Class</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No classes scheduled yet.</p>
                        <Button variant="ghost" className="mt-2" onClick={() => setActiveModal('create')}>Schedule your first class</Button>
                    </div>
                ) : (
                    classes.map(cls => (
                        <Card key={cls._id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="mb-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{cls.title}</h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${cls.classType === 'live' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {cls.classType}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{cls.subjectId?.title}</p>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="text-sm text-slate-600">
                                    <div>{new Date(cls.scheduledDate).toLocaleDateString()} at {new Date(cls.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div>Duration: {cls.duration} mins</div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditClass(cls)}>Edit</Button>
                                    {cls.meetingLink && <Button variant="secondary" size="sm" className="flex-1" onClick={() => window.open(cls.meetingLink, '_blank')}>Join</Button>}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal open={activeModal === 'create'} onClose={() => setActiveModal(null)} title="Create New Class">
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

            <Modal open={activeModal === 'edit'} onClose={() => setActiveModal(null)} title="Edit Class Session">
                <form onSubmit={handleUpdateClass} className="space-y-4">
                    <FormField label="Title" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} />
                    <FormField label="Date & Time" type="datetime-local" value={classForm.scheduledDate} onChange={e => setClassForm({ ...classForm, scheduledDate: e.target.value })} />
                    <FormField label="Duration (minutes)" type="number" value={String(classForm.duration)} onChange={e => setClassForm({ ...classForm, duration: Number(e.target.value) })} />
                    {classForm.classType === 'live' && (
                        <FormField label="Meeting Link" value={classForm.meetingLink} onChange={e => setClassForm({ ...classForm, meetingLink: e.target.value })} placeholder="https://..." />
                    )}
                    <Button type="submit" className="w-full">Update Session</Button>
                </form>
            </Modal>
        </div>
    )
}

export default TeacherClasses

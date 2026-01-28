
import { useEffect, useState } from 'react'
import { subjectApi, adminSubjectApi } from '../../lib/api'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import AlertDialog, { type AlertDialogProps } from '../../components/AlertDialog'
import { TrashIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

type Subject = {
    _id: string
    title: string
    teacherId: { _id: string; name: string } | null
}

const AdminCourses = () => {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeModal, setActiveModal] = useState<'create' | null>(null)
    const [newCourseTitle, setNewCourseTitle] = useState('')
    const [modalError, setModalError] = useState('')
    const [alertState, setAlertState] = useState<Omit<AlertDialogProps, 'onClose' | 'onConfirm'> & { open: boolean }>({
        open: false, title: '', message: '', type: 'info'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await subjectApi.getAll()
            setSubjects(data)
        } catch (error) {
            console.error('Failed to load courses:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCourseTitle.trim()) return
        setModalError('')
        try {
            await adminSubjectApi.create(newCourseTitle)
            loadData()
            setNewCourseTitle('')
            setActiveModal(null)
            setAlertState({ open: true, title: 'Success', message: 'Course created successfully', type: 'success' })
        } catch (error: any) {
            setModalError(error.message || 'Failed to create course')
        }
    }

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course? This implies deleting all related resources and classes.')) return
        try {
            await adminSubjectApi.delete(courseId)
            loadData()
            setAlertState({ open: true, title: 'Success', message: 'Course deleted successfully', type: 'success' })
        } catch (error: any) {
            setAlertState({ open: true, title: 'Error', message: error.message || 'Failed to delete course', type: 'error' })
        }
    }

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
                <h2 className="text-xl font-bold text-slate-900">Course Management</h2>
                <Button onClick={() => setActiveModal('create')} className="flex items-center gap-2">
                    <AcademicCapIcon className="h-4 w-4" />
                    Add Course
                </Button>
            </div>

            <Card>
                <div className="space-y-2">
                    {subjects.length === 0 ? (
                        <p className="text-slate-500">No courses available.</p>
                    ) : (
                        subjects.map((s) => (
                            <div key={s._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                                <div>
                                    <div className="font-medium text-slate-900">{s.title}</div>
                                    <div className="text-xs text-slate-500">{s.teacherId ? `Teacher: ${s.teacherId.name}` : 'No Assigned Teacher'}</div>
                                </div>
                                <Button variant="ghost" className="p-2 text-slate-500 hover:text-red-600" onClick={() => handleDeleteCourse(s._id)}>
                                    <TrashIcon className="h-5 w-5" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Modal open={activeModal === 'create'} onClose={() => setActiveModal(null)} title="Add New Course">
                <form onSubmit={handleCreateCourse} className="space-y-4">
                    <FormField label="Course Name (Subject)" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="e.g. Physics, History..." />
                    {modalError && <div className="text-sm text-red-600">{modalError}</div>}
                    <Button type="submit" className="w-full">Create Course</Button>
                </form>
            </Modal>
        </div>
    )
}

export default AdminCourses

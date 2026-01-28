
import { useEffect, useState } from 'react'
import { adminApi, subjectApi } from '../../lib/api'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import AlertDialog, { type AlertDialogProps } from '../../components/AlertDialog'
import Badge from '../../components/Badge'
import {
    PencilSquareIcon,
    TrashIcon,
    UserCircleIcon,
    EyeIcon,
    PlusIcon,
} from '@heroicons/react/24/outline'

type User = {
    _id: string
    name: string
    email: string
    role: string
    approved: boolean
    enrolledSubjects?: Array<{ _id: string; title: string }>
}

type Subject = {
    _id: string
    title: string
    teacherId: { _id: string; name: string } | null
}

type TeacherStats = {
    studentCount: number
    classCounts: { total: number; thisYear: number; thisMonth: number; thisWeek: number }
    assignedSubjects: Array<{ _id: string; title: string; studentCount: number }>
}

const AdminTeachers = () => {
    const [users, setUsers] = useState<User[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeModal, setActiveModal] = useState<'hire' | 'assign' | 'edit' | 'details' | null>(null)

    // State for modals
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' })
    const [assignForm, setAssignForm] = useState({ teacherId: '', subjectId: '' })
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' })
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [viewingTeacher, setViewingTeacher] = useState<User | null>(null)
    const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null)
    const [modalError, setModalError] = useState('')

    const [alertState, setAlertState] = useState<Omit<AlertDialogProps, 'onClose' | 'onConfirm'> & { open: boolean }>({
        open: false, title: '', message: '', type: 'info'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [usersData, subjectsData] = await Promise.all([adminApi.getUsers(), subjectApi.getAll()])
            setUsers(usersData)
            setSubjects(subjectsData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const resetForms = () => {
        setNewTeacher({ name: '', email: '', password: '' })
        setAssignForm({ teacherId: '', subjectId: '' })
        setEditForm({ name: '', email: '', password: '' })
        setModalError('')
        setActiveModal(null)
        setEditingUser(null)
        setViewingTeacher(null)
        setTeacherStats(null)
    }

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault()
        setModalError('')
        try {
            await adminApi.createTeacher(newTeacher)
            loadData()
            resetForms()
            setAlertState({ open: true, title: 'Success', message: 'Teacher account created', type: 'success' })
        } catch (error: any) {
            setModalError(error.message || 'Failed to create teacher')
        }
    }

    const handleAssignSubject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!assignForm.teacherId || !assignForm.subjectId) return
        setModalError('')
        try {
            await adminApi.assignSubject(assignForm.teacherId, assignForm.subjectId)
            loadData()
            resetForms()
            setAlertState({ open: true, title: 'Success', message: 'Subject assigned successfully', type: 'success' })
        } catch (error: any) {
            setModalError(error.message || 'Failed to assign subject')
        }
    }

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        setModalError('')
        try {
            await adminApi.updateUser(editingUser._id, editForm)
            loadData()
            resetForms()
            setAlertState({ open: true, title: 'Success', message: 'Teacher updated successfully', type: 'success' })
        } catch (error: any) {
            setModalError(error.message || 'Failed to update user')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this teacher? This cannot be undone.')) return
        try {
            await adminApi.deleteUser(userId)
            loadData()
            setAlertState({ open: true, title: 'Success', message: 'Teacher deleted successfully', type: 'success' })
        } catch (error: any) {
            setAlertState({ open: true, title: 'Error', message: error.message || 'Failed to delete user', type: 'error' })
        }
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setEditForm({ name: user.name, email: user.email, password: '' })
        setActiveModal('edit')
    }

    const openTeacherDetails = async (teacher: User) => {
        setViewingTeacher(teacher)
        setTeacherStats(null)
        setActiveModal('details')
        try {
            const stats = await adminApi.getTeacherStats(teacher._id)
            setTeacherStats(stats)
        } catch (error) { console.error('Failed to load stats', error) }
    }

    const teachers = users.filter((u) => u.role === 'teacher')

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
                <h2 className="text-xl font-bold text-slate-900">Teacher Management</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setActiveModal('assign')}>Assign Subject</Button>
                    <Button onClick={() => setActiveModal('hire')} className="flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Add Teacher
                    </Button>
                </div>
            </div>

            <Card>
                <div className="space-y-2">
                    {teachers.length === 0 ? (
                        <p className="text-slate-500">No teachers found.</p>
                    ) : (
                        teachers.map((t) => (
                            <div key={t._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <UserCircleIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{t.name}</div>
                                        <div className="text-xs text-slate-500">{t.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-brand-600" onClick={() => openTeacherDetails(t)}>
                                        <EyeIcon className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-brand-600" onClick={() => openEditModal(t)}>
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-red-600" onClick={() => handleDeleteUser(t._id)}>
                                        <TrashIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Modals */}
            <Modal open={activeModal === 'hire'} onClose={resetForms} title="Add Teacher">
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                    <FormField label="Full Name" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} />
                    <FormField label="Email Address" type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} />
                    <FormField label="Password" type="password" value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} />
                    {modalError && <div className="text-sm text-red-600">{modalError}</div>}
                    <Button type="submit" className="w-full">Create Account</Button>
                </form>
            </Modal>

            <Modal open={activeModal === 'assign'} onClose={resetForms} title="Assign Subject">
                <form onSubmit={handleAssignSubject} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Teacher</label>
                        <select className="w-full rounded-md border border-slate-300 p-2 text-sm" value={assignForm.teacherId} onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}>
                            <option value="">Select Teacher...</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                        <select className="w-full rounded-md border border-slate-300 p-2 text-sm" value={assignForm.subjectId} onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}>
                            <option value="">Select Subject...</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>
                    {modalError && <div className="text-sm text-red-600">{modalError}</div>}
                    <Button type="submit" className="w-full">Assign Subject</Button>
                </form>
            </Modal>

            <Modal open={activeModal === 'edit'} onClose={resetForms} title="Edit User">
                <form onSubmit={handleEditUser} className="space-y-4">
                    <FormField label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    <FormField label="Email Address" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    <div className="border-t border-slate-100 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-slate-900 mb-3">Reset Password</h4>
                        <FormField label="New Password (Optional)" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Leave empty to keep current password" />
                    </div>
                    {modalError && <div className="text-sm text-red-600">{modalError}</div>}
                    <Button type="submit" className="w-full">Save Changes</Button>
                </form>
            </Modal>

            <Modal open={activeModal === 'details'} onClose={resetForms} title="Teacher Details">
                {viewingTeacher && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><UserCircleIcon className="h-8 w-8" /></div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{viewingTeacher.name}</h3>
                                <p className="text-sm text-slate-500">{viewingTeacher.email}</p>
                            </div>
                        </div>
                        {!teacherStats ? (
                            <div className="text-center py-4 text-slate-500">Loading stats...</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-brand-50 p-4">
                                        <div className="text-sm font-medium text-brand-800">Assigned Students</div>
                                        <div className="mt-1 text-2xl font-bold text-brand-900">{teacherStats.studentCount}</div>
                                        <div className="text-xs text-brand-600">Across {teacherStats.assignedSubjects.length} subjects</div>
                                    </div>
                                    <div className="rounded-lg bg-orange-50 p-4">
                                        <div className="text-sm font-medium text-orange-800">Classes Taught</div>
                                        <div className="mt-1 text-2xl font-bold text-orange-900">{teacherStats.classCounts.total}</div>
                                        <div className="text-xs text-orange-600">Total sessions</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Detailed Breakdown</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <div className="font-bold text-slate-900">{teacherStats.classCounts.thisWeek}</div>
                                            <div className="text-xs text-slate-500">This Week</div>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <div className="font-bold text-slate-900">{teacherStats.classCounts.thisMonth}</div>
                                            <div className="text-xs text-slate-500">This Month</div>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <div className="font-bold text-slate-900">{teacherStats.classCounts.thisYear}</div>
                                            <div className="text-xs text-slate-500">This Year</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Assigned Subjects & Enrolled Students</h4>
                                    <div className="flex flex-col gap-2">
                                        {teacherStats.assignedSubjects.length === 0 ? (
                                            <span className="text-xs text-slate-500">No subjects assigned.</span>
                                        ) : (
                                            teacherStats.assignedSubjects.map(s => (
                                                <div key={s._id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                                                    <span className="font-medium text-slate-700">{s.title}</span>
                                                    <Badge>{s.studentCount} Students</Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="pt-2">
                            <Button variant="secondary" className="w-full" onClick={() => setActiveModal(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default AdminTeachers

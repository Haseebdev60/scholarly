
import { useEffect, useState } from 'react'
import { adminApi } from '../../lib/api'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import AlertDialog, { type AlertDialogProps } from '../../components/AlertDialog'
import {
    PencilSquareIcon,
    TrashIcon,
    UserCircleIcon,
    EyeIcon,
} from '@heroicons/react/24/outline'

type User = {
    _id: string
    name: string
    email: string
    role: string
    approved: boolean
    enrolledSubjects?: Array<{ _id: string; title: string }>
}

const AdminStudents = () => {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeModal, setActiveModal] = useState<'edit' | 'student-details' | null>(null)

    // State for modals
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' })
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [viewingStudent, setViewingStudent] = useState<User | null>(null)
    const [modalError, setModalError] = useState('')

    const [alertState, setAlertState] = useState<Omit<AlertDialogProps, 'onClose' | 'onConfirm'> & { open: boolean }>({
        open: false, title: '', message: '', type: 'info'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const usersData = await adminApi.getUsers()
            setUsers(usersData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const resetForms = () => {
        setEditForm({ name: '', email: '', password: '' })
        setModalError('')
        setActiveModal(null)
        setEditingUser(null)
        setViewingStudent(null)
    }

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        setModalError('')
        try {
            await adminApi.updateUser(editingUser._id, editForm)
            loadData()
            resetForms()
            setAlertState({ open: true, title: 'Success', message: 'Student updated successfully', type: 'success' })
        } catch (error: any) {
            setModalError(error.message || 'Failed to update user')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this student? This cannot be undone.')) return
        try {
            await adminApi.deleteUser(userId)
            loadData()
            setAlertState({ open: true, title: 'Success', message: 'Student deleted successfully', type: 'success' })
        } catch (error: any) {
            setAlertState({ open: true, title: 'Error', message: error.message || 'Failed to delete user', type: 'error' })
        }
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setEditForm({ name: user.name, email: user.email, password: '' })
        setActiveModal('edit')
    }

    const students = users.filter((u) => u.role === 'student')

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

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Registered Students</h3>
                    <div className="text-sm text-slate-600">Total: {students.length}</div>
                </div>
                <div className="space-y-2">
                    {students.length === 0 ? (
                        <p className="text-slate-500">No students found.</p>
                    ) : (
                        students.map((s) => (
                            <div key={s._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                                <div>
                                    <div className="font-medium text-slate-900">{s.name}</div>
                                    <div className="text-xs text-slate-500">{s.email}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-brand-600" onClick={() => {
                                        setViewingStudent(s)
                                        setActiveModal('student-details')
                                    }}>
                                        <EyeIcon className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-brand-600" onClick={() => openEditModal(s)}>
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-red-600" onClick={() => handleDeleteUser(s._id)}>
                                        <TrashIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Modals */}
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

            <Modal open={activeModal === 'student-details'} onClose={resetForms} title="Student Details">
                {viewingStudent && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><UserCircleIcon className="h-8 w-8" /></div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{viewingStudent.name}</h3>
                                <p className="text-sm text-slate-500">{viewingStudent.email}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Enrolled Subjects</h4>
                            {viewingStudent.enrolledSubjects && viewingStudent.enrolledSubjects.length > 0 ? (
                                <div className="space-y-2">
                                    {viewingStudent.enrolledSubjects.map((subject: any) => (
                                        <div key={subject._id || Math.random()} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                                            <span className="font-medium text-slate-700">{subject.title || 'Unknown Subject'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No enrolled subjects.</p>
                            )}
                        </div>
                        <div className="pt-2">
                            <Button variant="secondary" className="w-full" onClick={() => setActiveModal(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default AdminStudents

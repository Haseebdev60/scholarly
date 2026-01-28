import { useEffect, useMemo, useState } from 'react'

import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import AlertDialog, { type AlertDialogProps } from '../components/AlertDialog'
import { useAuth } from '../contexts/AuthContext'
import { subjectApi, studentApi } from '../lib/api'
import { BookOpenIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

type CoursesProps = {
  onEnroll: () => void
}

const Courses = ({ onEnroll }: CoursesProps) => {
  const { user, subscriptionStatus } = useAuth()

  const [subjects, setSubjects] = useState<
    Array<{
      _id: string
      title: string
      description: string
      teacherId: { _id: string; name: string } | null
      isPremium: boolean
      studentCount?: number // Assuming API might provide this in future
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'All' | 'Premium' | 'Free'>('All')
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [enrolledSubjectIds, setEnrolledSubjectIds] = useState<Set<string>>(new Set())
  const [alertState, setAlertState] = useState<Omit<AlertDialogProps, 'onClose' | 'onConfirm'> & { open: boolean }>({
    open: false, title: '', message: '', type: 'info'
  })

  useEffect(() => {
    loadSubjects()
    if (user && user.role === 'student') {
      loadEnrolledSubjects()
    }
  }, [user])

  const loadEnrolledSubjects = async () => {
    try {
      const enrolled = await studentApi.getEnrolledSubjects()
      setEnrolledSubjectIds(new Set(enrolled.map(s => s._id)))
    } catch (error) {
      console.error("Failed to load enrolled subjects", error)
    }
  }

  const loadSubjects = async () => {
    try {
      const data = await subjectApi.getAll()
      setSubjects(data)
    } catch (error: any) {
      console.error('Failed to load subjects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return subjects.filter((subject) => {
      if (filter === 'All') return true
      if (filter === 'Premium') return subject.isPremium
      return !subject.isPremium
    })
  }, [subjects, filter])

  const hasActiveSubscription = subscriptionStatus?.isActive ?? false

  const handleEnrollClick = async (subjectId: string) => {
    if (!user) {
      onEnroll()
      return
    }

    if (user.role !== 'student') {
      setAlertState({ open: true, title: 'Access Denied', message: 'Only students can enroll in courses.', type: 'error' })
      return
    }

    if (!hasActiveSubscription) {
      setAlertState({ open: true, title: 'Subscription Required', message: 'You need an active subscription to enroll in courses. Please purchase a subscription first.', type: 'error' })
      return
    }

    setEnrolling(subjectId)
    try {
      await studentApi.enrollSubject(subjectId)
      setEnrolledSubjectIds(prev => new Set(prev).add(subjectId))
      setAlertState({ open: true, title: 'Success', message: 'Successfully enrolled! Access this course in your dashboard.', type: 'success' })
    } catch (error: any) {
      setAlertState({ open: true, title: 'Enrollment Failed', message: `Failed to enroll: ${error.message || 'Please try again'}`, type: 'error' })
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Badge className="mb-4">Catalog</Badge>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Browse Courses</h1>
              <p className="mt-2 text-lg text-slate-600 max-w-2xl">
                Explore our comprehensive library of courses. Join thousands of students learning from the best.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              {(['All', 'Premium', 'Free'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <AlertDialog
          open={alertState.open}
          onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
        />

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <BookOpenIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No courses found</h3>
            <p className="text-slate-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((subject) => {
              const isEnrolled = enrolledSubjectIds.has(subject._id)
              return (
                <Card key={subject._id} className={`group flex flex-col h-full border-2 transition-all duration-300 hover:-translate-y-1 ${isEnrolled ? 'border-brand-100 ring-4 ring-brand-50' : 'border-slate-100 hover:border-brand-100 hover:shadow-xl'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-xl p-3 ${subject.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {subject.isPremium ? <StarIcon className="h-6 w-6" /> : <BookOpenIcon className="h-6 w-6" />}
                    </div>
                    {isEnrolled ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        <CheckCircleIcon className="h-3 w-3" /> Enrolled
                      </span>
                    ) : subject.isPremium ? (
                      <Badge color="amber">Premium</Badge>
                    ) : (
                      <Badge color="blue">Free</Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">{subject.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">
                    {subject.description || 'No description available for this course. Enroll to access materials, quizzes, and lectures.'}
                  </p>

                  <div className="flex items-center gap-3 mb-6 pt-4 border-t border-slate-50">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {subject.teacherId?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900">{subject.teacherId?.name || 'Scholarly Faculty'}</div>
                      <div className="text-slate-500">Instructor</div>
                    </div>
                  </div>

                  <Button
                    variant={isEnrolled ? "outline" : "primary"}
                    onClick={() => handleEnrollClick(subject._id)}
                    disabled={enrolling === subject._id || isEnrolled}
                    className="w-full justify-center"
                  >
                    {isEnrolled ? 'View Course' : enrolling === subject._id ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses

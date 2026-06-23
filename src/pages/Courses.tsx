import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { GlassCard } from '../components/GlassCard'
import AlertDialog, { type AlertDialogProps } from '../components/AlertDialog'
import { useAuth } from '../contexts/AuthContext'
import { subjectApi, studentApi } from '../lib/api'
import { BookOpenIcon, CheckCircleIcon, MagnifyingGlassIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { fadeUp, staggerContainer, scaleIn } from '../lib/utils'

type CoursesProps = {
  onEnroll: () => void
}

const Courses = ({ onEnroll }: CoursesProps) => {
  const { user, subscriptionStatus } = useAuth()

  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'All' | 'Premium' | 'Free'>('All')
  const [searchQuery, setSearchQuery] = useState('')
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
      const matchFilter = filter === 'All' ? true : filter === 'Premium' ? subject.isPremium : !subject.isPremium
      const matchSearch = subject.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchFilter && matchSearch
    })
  }, [subjects, filter, searchQuery])

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative pb-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-electric-blue/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      {/* Header */}
      <div className="relative pt-24 pb-16 z-10 border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <motion.div 
             initial="initial" animate="animate" variants={fadeUp}
             className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="max-w-2xl">
              <Badge className="mb-6 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-none px-4 py-1.5 font-bold uppercase tracking-widest text-xs">Course Catalog</Badge>
              <h1 className="text-5xl md:text-6xl font-black font-display text-slate-900 dark:text-white tracking-tight">Expand Your <span className="text-gradient">Knowledge</span></h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
                Explore our premium library of courses. Join thousands of students learning from the best industry experts.
              </p>
            </div>
          </motion.div>

          <motion.div 
             initial="initial" animate="animate" variants={fadeUp}
             className="mt-12 flex flex-col lg:flex-row items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-soft backdrop-blur-md"
          >
              <div className="relative w-full lg:w-[400px]">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                 </div>
                 <input 
                    type="text" 
                    placeholder="Search for courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                 />
              </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <AlertDialog
          open={alertState.open}
          onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
        />

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-[2rem] bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial="initial" animate="animate" variants={scaleIn} className="text-center py-32 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border border-slate-200/50 dark:border-white/5">
            <div className="mx-auto h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-500 mb-6 shadow-inner">
              <BookOpenIcon className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-4">No courses found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Try adjusting your search query or filters to discover amazing content.</p>
          </motion.div>
        ) : (
          <motion.div 
             variants={staggerContainer}
             initial="initial"
             animate="animate"
             className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((subject) => {
                const isEnrolled = enrolledSubjectIds.has(subject._id)
                const fakeRating = (4 + Math.random()).toFixed(1)
                const fakeReviews = Math.floor(Math.random() * 500) + 50
                const fakeDuration = Math.floor(Math.random() * 20) + 4
                
                return (
                  <motion.div key={subject._id} variants={fadeUp} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <GlassCard glowHover className={`flex flex-col h-full bg-white dark:bg-slate-900/80 rounded-[2.5rem] border ${isEnrolled ? 'border-brand-500/50 shadow-glow' : 'border-slate-200 dark:border-white/10'}`}>
                      
                      {/* Image Thumbnail Placeholder */}
                      <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden rounded-t-[2.5rem]">
                         <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/40 to-electric-blue/40 mix-blend-multiply dark:mix-blend-screen group-hover:scale-110 transition-transform duration-700"></div>
                         <div className="absolute top-4 right-4 z-10 flex gap-2">
                            {isEnrolled && (
                               <span className="flex items-center gap-1 text-xs font-bold text-white bg-green-500 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md">
                                  <CheckCircleIcon className="h-4 w-4" /> Enrolled
                               </span>
                            )}
                         </div>
                         <div className="absolute bottom-4 left-4 z-10 flex gap-2 text-xs font-bold text-white">
                            <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10">
                               <ClockIcon className="h-4 w-4" /> {fakeDuration}h
                            </span>
                            <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-amber-400 border border-white/10">
                               <StarIconSolid className="h-4 w-4" /> {fakeRating} ({fakeReviews})
                            </span>
                         </div>
                      </div>

                      <div className="p-8 flex flex-col flex-1">
                        <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white mb-4 group-hover:text-brand-600 dark:group-hover:text-electric-blue transition-colors line-clamp-2">{subject.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 flex-1 line-clamp-3 leading-relaxed font-medium">
                          {subject.description || 'Dive deep into this comprehensive course. Enroll now to access premium materials, interactive quizzes, and expert lectures.'}
                        </p>

                        <div className="flex flex-col gap-6">
                           <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/10">
                             <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                 {subject.teacherId?.name?.charAt(0) || 'S'}
                               </div>
                               <div>
                                 <div className="text-sm font-bold text-slate-900 dark:text-white">{subject.teacherId?.name || 'Scholarly Faculty'}</div>
                                 <div className="text-xs font-semibold text-brand-600 dark:text-brand-400">Instructor</div>
                               </div>
                             </div>
                             <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                               <UserGroupIcon className="h-4 w-4 mr-1.5" /> {(fakeReviews * 12).toLocaleString()}
                             </div>
                           </div>

                           <Button
                             variant={isEnrolled ? "outline" : "primary"}
                             onClick={() => handleEnrollClick(subject._id)}
                             disabled={enrolling === subject._id}
                             className={`w-full justify-center h-12 text-base font-bold rounded-xl transition-all ${!isEnrolled && 'bg-gradient-to-r from-brand-600 to-electric-blue border-none shadow-glow hover:shadow-glow-hover text-white'}`}
                           >
                             {isEnrolled ? 'Continue Learning' : enrolling === subject._id ? 'Enrolling...' : 'Enroll Now'}
                           </Button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Courses

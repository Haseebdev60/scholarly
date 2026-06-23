import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/Button'
import { GlassCard } from '../components/GlassCard'
import Badge from '../components/Badge'
import { publicApi, studentApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { fadeUp, staggerContainer, scaleIn } from '../lib/utils'
import { StarIcon, AcademicCapIcon, ChatBubbleLeftEllipsisIcon, CalendarIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline'
import AlertDialog, { type AlertDialogProps } from '../components/AlertDialog'

type TeachersProps = {
  onContact: (id: string, name: string) => void
}

const Teachers = ({ onContact }: TeachersProps) => {
  const { subscriptionStatus } = useAuth()
  const hasSubscription = subscriptionStatus?.isActive

  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    publicApi.getTeachers()
      .then(data => setTeachers(data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const [bookingTeacher, setBookingTeacher] = useState<any>(null)
  const [teacherAvailability, setTeacherAvailability] = useState<{ availability: any[], bookings: any[] } | null>(null)
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, startTime: string, duration: number } | null>(null)
  const [notes, setNotes] = useState('')
  const [alertState, setAlertState] = useState<{
    open: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'confirm'
    onConfirm?: () => void
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  })

  const handleBookClick = async (teacher: any) => {
    setBookingTeacher(teacher)
    setLoadingAvail(true)
    setTeacherAvailability(null)
    setSelectedSlot(null)
    try {
      const res = await studentApi.getTeacherAvailability(teacher._id)
      setTeacherAvailability(res)
    } catch (e) {
      console.error(e)
      setAlertState({
        open: true,
        title: 'Error',
        message: 'Failed to load availability',
        type: 'error'
      })
    } finally {
      setLoadingAvail(false)
    }
  }

  const executeBooking = async () => {
    if (!selectedSlot || !bookingTeacher) return
    try {
      await studentApi.bookClass({
        teacherId: bookingTeacher._id,
        date: selectedSlot.date.toISOString(),
        duration: selectedSlot.duration,
        notes
      })
      setBookingTeacher(null)
      setAlertState({
        open: true,
        title: 'Success',
        message: 'Booking confirmed!',
        type: 'success'
      })
    } catch (e: any) {
      setAlertState({
        open: true,
        title: 'Error',
        message: `Booking failed: ${e.message}`,
        type: 'error'
      })
    }
  }

  const confirmBooking = async () => {
    if (!selectedSlot || !bookingTeacher) return
    setAlertState({
      open: true,
      title: 'Confirm Booking',
      message: `Book class with ${bookingTeacher.name} on ${selectedSlot.date.toLocaleDateString()} at ${selectedSlot.startTime}?`,
      type: 'confirm',
      onConfirm: executeBooking
    })
  }

  const getAvailableSlots = () => {
    if (!teacherAvailability) return []
    const slots: { date: Date, startTime: string, duration: number }[] = []
    const today = new Date()

    for (let i = 1; i <= 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })

      const dayConfig = teacherAvailability.availability.find((a: any) => a.day === dayName)
      if (dayConfig && dayConfig.slots) {
        dayConfig.slots.forEach((s: any) => {
          const slotDate = new Date(d)
          const [hours, mins] = s.startTime.split(':').map(Number)
          slotDate.setHours(hours, mins, 0, 0)
          
          const isBooked = teacherAvailability.bookings.some((b: any) => {
            const bDate = new Date(b.date)
            return Math.abs(bDate.getTime() - slotDate.getTime()) < 5 * 60000 
          })

          if (!isBooked) {
            slots.push({
              date: slotDate,
              startTime: s.startTime,
              duration: s.duration || 60
            })
          }
        })
      }
    }
    return slots
  }

  const slots = getAvailableSlots()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-electric-blue/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      {/* Header */}
      <div className="relative pt-24 pb-16 z-10 border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <motion.div initial="initial" animate="animate" variants={fadeUp} className="max-w-3xl">
             <Badge className="mb-6 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-none px-4 py-1.5 font-bold uppercase tracking-widest text-xs inline-flex">Our Faculty</Badge>
             <h1 className="text-5xl md:text-6xl font-black font-display text-slate-900 dark:text-white tracking-tight">Meet the <span className="text-gradient">Experts</span></h1>
             <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
               Learn from verified, experienced educators dedicated to your academic success. Book private classes or message them directly.
             </p>
           </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : !Array.isArray(teachers) || teachers.length === 0 ? (
           <motion.div initial="initial" animate="animate" variants={scaleIn} className="text-center py-32 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border border-slate-200/50 dark:border-white/5">
             <h3 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-4">No teachers found</h3>
           </motion.div>
        ) : (
          <motion.div 
             variants={staggerContainer}
             initial="initial"
             animate="animate"
             className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {teachers.map((teacher) => {
              if (!teacher) return null
              // Simulated metadata
              const rating = (4 + Math.random()).toFixed(1)
              const reviewCount = Math.floor(Math.random() * 200) + 20
              
              return (
                <motion.div key={teacher._id || Math.random()} variants={fadeUp}>
                  <GlassCard glowHover className="group flex flex-col h-full bg-white dark:bg-slate-900/80 rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 overflow-hidden">
                    
                    <div className="p-8 pb-0 flex items-start gap-5">
                       <div className="relative">
                         <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-brand-50 dark:ring-slate-800 shrink-0 shadow-lg group-hover:shadow-brand-500/30 transition-shadow duration-500">
                           <img
                             src={teacher.avatar || 'https://ui-avatars.com/api/?name=' + (teacher.name || 'T') + '&background=random'}
                             alt={teacher.name || 'Teacher'}
                             className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                           />
                         </div>
                         <div className="absolute -bottom-2 -right-2 h-7 w-7 bg-brand-500 rounded-xl border-[3px] border-white dark:border-slate-900 flex items-center justify-center">
                           <CheckBadgeIcon className="h-4 w-4 text-white" />
                         </div>
                       </div>
                       <div className="pt-2">
                         <div className="font-black font-display text-xl text-slate-900 dark:text-white tracking-tight">{teacher.name || 'Unknown'}</div>
                         <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mt-1 mb-2">Senior Instructor</div>
                         <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <StarIcon className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{rating}</span> ({reviewCount} reviews)
                         </div>
                       </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                       <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 line-clamp-3 mb-8 leading-relaxed font-medium">
                         {teacher.bio || 'Experienced educator passionate about helping students achieve their academic goals. Specializes in interactive learning methodologies.'}
                       </p>
                       
                       <div className="space-y-6">
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(teacher.assignedSubjects) && teacher.assignedSubjects.filter((s: any) => s).map((subject: any) => (
                              <span key={subject._id || Math.random()} className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <AcademicCapIcon className="h-3.5 w-3.5" />
                                {subject.title || 'Subject'}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm pt-6 border-t border-slate-100 dark:border-white/5">
                             <div className="font-black text-slate-900 dark:text-white flex items-center gap-1 text-lg">
                                PKR {teacher.hourlyRate || 2000}<span className="text-slate-500 dark:text-slate-400 font-medium text-sm">/hr</span>
                             </div>
                             <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-[50%] truncate bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/50 dark:border-white/5">
                               {Array.isArray(teacher.availability) && teacher.availability.length > 0
                                 ? teacher.availability.map((a: any) => a.day).join(', ')
                                 : 'Flexible availability'}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-3 backdrop-blur-sm">
                      <Button variant="outline" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 h-12 font-bold rounded-xl shadow-sm" onClick={() => onContact(teacher._id, teacher.name)}>
                        <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2" /> Message
                      </Button>
                      {hasSubscription ? (
                        <Button className="w-full h-12 font-bold rounded-xl bg-gradient-to-r from-brand-600 to-electric-blue border-none shadow-glow hover:shadow-glow-hover text-white transition-all" onClick={() => handleBookClick(teacher)}>
                          <CalendarIcon className="h-5 w-5 mr-2" /> Book
                        </Button>
                      ) : (
                        <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed h-12 font-bold rounded-xl" title="Upgrade required">
                           <CalendarIcon className="h-5 w-5 mr-2" /> Premium
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Booking Modal */}
        <AnimatePresence>
          {bookingTeacher && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={() => setBookingTeacher(null)}
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 relative max-h-[90vh] flex flex-col z-10 border border-slate-200 dark:border-white/10"
              >
                <button
                  onClick={() => setBookingTeacher(null)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full p-2 transition-colors"
                >
                  ✕
                </button>
                <h2 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-1">Book a Class</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">with {bookingTeacher.name}</p>

                {loadingAvail ? (
                  <div className="text-center py-12 text-slate-500 animate-pulse font-bold">Checking calendar...</div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 font-medium">No available slots found for the next 14 days.</div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {slots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedSlot === slot
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-sm'
                          : 'border-slate-100 dark:border-white/5 hover:border-brand-200 dark:hover:border-white/10 bg-white dark:bg-slate-800/50'
                          }`}
                      >
                        <div className={`font-black ${selectedSlot === slot ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                          {slot.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 flex justify-between items-center font-medium">
                          <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {slot.startTime} <span className="text-slate-400 mx-1">•</span> {slot.duration} mins</span>
                          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            PKR {Math.round((slot.duration / 60) * (bookingTeacher.hourlyRate || 2000))}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {selectedSlot && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
                      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">Notes for the teacher (Optional)</label>
                      <textarea
                        className="w-full border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm mb-6 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium transition-all"
                        rows={2}
                        placeholder="e.g. I want to review Calculus Chapter 4..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                      <Button className="w-full py-4 text-base font-bold shadow-glow hover:shadow-glow-hover rounded-xl bg-gradient-to-r from-brand-600 to-electric-blue border-none text-white transition-all" onClick={confirmBooking}>
                        Confirm Booking
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog
        open={alertState.open}
        onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={alertState.onConfirm}
      />
    </div>
  )
}

export default Teachers

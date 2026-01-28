import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import { publicApi, studentApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

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
      .then(data => {
        console.log('Teachers data:', data)
        setTeachers(data)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const [bookingTeacher, setBookingTeacher] = useState<any>(null)
  const [teacherAvailability, setTeacherAvailability] = useState<{ availability: any[], bookings: any[] } | null>(null)
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, startTime: string, duration: number } | null>(null)
  const [notes, setNotes] = useState('')

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
      alert('Failed to load availability')
    } finally {
      setLoadingAvail(false)
    }
  }

  const confirmBooking = async () => {
    if (!selectedSlot || !bookingTeacher) return
    if (!confirm(`Book class with ${bookingTeacher.name} on ${selectedSlot.date.toLocaleDateString()} at ${selectedSlot.startTime}?`)) return

    try {
      await studentApi.bookClass({
        teacherId: bookingTeacher._id,
        date: selectedSlot.date.toISOString(),
        duration: selectedSlot.duration,
        notes
      })
      alert('Booking confirmed!')
      setBookingTeacher(null)
    } catch (e: any) {
      alert(`Booking failed: ${e.message}`)
    }
  }

  // Generate next 7 days slots
  const getAvailableSlots = () => {
    if (!teacherAvailability) return []
    const slots: { date: Date, startTime: string, duration: number }[] = []
    const today = new Date()

    for (let i = 1; i <= 14; i++) { // Next 14 days
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })

      const dayConfig = teacherAvailability.availability.find((a: any) => a.day === dayName)
      if (dayConfig && dayConfig.slots) {
        dayConfig.slots.forEach((s: any) => {
          // Check if booked
          const slotDate = new Date(d)
          const [hours, mins] = s.startTime.split(':').map(Number)
          slotDate.setHours(hours, mins, 0, 0)

          // Simple collision check: any booking starting at the same time
          // Robust check: overlapping ranges.
          // For MVP, assume exact slot matching or "start time" collision.
          const isBooked = teacherAvailability.bookings.some((b: any) => {
            const bDate = new Date(b.date)
            return Math.abs(bDate.getTime() - slotDate.getTime()) < 5 * 60000 // within 5 mins
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Meet our instructors</h1>
        <p className="text-slate-600">
          Experienced educators with subject mastery and classroom know-how.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center text-slate-500">Loading teachers...</div>
      ) : !Array.isArray(teachers) ? (
        <div className="mt-8 text-center text-red-500">Error loading teachers data. Please refresh.</div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => {
            if (!teacher) return null
            return (
              <Card key={teacher._id || Math.random()} className="card-hover space-y-3 flex flex-col h-full">
                <div className="flex items-center gap-3">
                  <img
                    src={teacher.avatar || 'https://ui-avatars.com/api/?name=' + (teacher.name || 'T')}
                    alt={teacher.name || 'Teacher'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{teacher.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">Teacher</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 flex-1">{teacher.bio || 'No biography available.'}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  {Array.isArray(teacher.assignedSubjects) && teacher.assignedSubjects.filter((s: any) => s).map((subject: any) => (
                    <span key={subject._id || Math.random()} className="rounded-full bg-slate-100 px-2 py-1">
                      {subject.title || 'Subject'}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  <div className="font-semibold text-brand-700">PKR {teacher.hourlyRate || 2000}/hr</div>
                  <div>
                    {Array.isArray(teacher.availability) && teacher.availability.length > 0
                      ? teacher.availability.map((a: any) => a.day).join(', ')
                      : 'Availability not set'}
                  </div>
                  <div>{teacher.email}</div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex flex-col gap-2">
                  <Button variant="secondary" className="w-full" onClick={() => onContact(teacher._id, teacher.name)}>
                    Message
                  </Button>
                  {hasSubscription ? (
                    <Button className="w-full" onClick={() => handleBookClick(teacher)}>
                      Book Private Class
                    </Button>
                  ) : (
                    <div className="text-center text-xs text-brand-600 font-medium py-2 bg-brand-50 rounded">
                      Upgrade to Book Private Classes
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Booking Modal */}
      {bookingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setBookingTeacher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Book a Class</h2>
            <p className="text-sm text-slate-600 mb-4">with {bookingTeacher.name}</p>

            {loadingAvail ? (
              <div className="text-center py-8">Loading availability...</div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No available slots found for the next 14 days.</div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedSlot === slot
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-brand-300'
                      }`}
                  >
                    <div className="font-semibold text-slate-900">
                      {slot.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-slate-600">
                      {slot.startTime} ({slot.duration} mins)
                      <span className="ml-2 font-semibold text-brand-600">
                        PKR {Math.round((slot.duration / 60) * (bookingTeacher.hourlyRate || 2000))}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full border rounded p-2 text-sm mb-4"
                  rows={2}
                  placeholder="What do you want to learn?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <Button className="w-full" onClick={confirmBooking}>
                  Confirm Booking
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Teachers

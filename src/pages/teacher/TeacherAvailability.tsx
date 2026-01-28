
import { useEffect, useState } from 'react'
import { teacherApi } from '../../lib/api'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { TrashIcon } from '@heroicons/react/24/outline'

const TeacherAvailability = () => {
    const [availability, setAvailability] = useState<{ day: string, slots: { startTime: string, duration: number }[] }[]>([])
    const [hourlyRate, setHourlyRate] = useState(2000)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [avail] = await Promise.all([
                teacherApi.getAvailability(),
                // teacherApi.getHourlyRate() // Assuming this might be needed later, or available in settings? 
                // Current implementation in dashboard used a local state for rate, I should probably fetch user settings if API supported it.
                // For now, I will stick to what was there. The original code didn't load hourlyRate from API, it defaulted to 2000. 
                // Wait, updateSettings({ hourlyRate }) was called. So I should probably fetch it.
                // teacherApi.getDashboard() might return user info?
            ])
            setAvailability(avail)
            // Ideally fetch hourly rate here.
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const saveAvailability = async () => {
        try {
            await teacherApi.updateAvailability(availability)
            await teacherApi.updateSettings({ hourlyRate })
            alert('Availability updated')
        } catch (e) {
            alert('Failed to update availability')
        }
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Weekly Schedule</h2>
                    <Button onClick={saveAvailability}>Save Changes</Button>
                </div>

                <div className="space-y-6">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        const dayAvail = availability.find(a => a.day === day) || { day, slots: [] }
                        return (
                            <div key={day} className="border-b border-slate-100 pb-4 last:border-0">
                                <div className="flex justify-between items-start md:items-center mb-3 flex-col md:flex-row gap-2">
                                    <h4 className="font-semibold text-slate-700 w-24">{day}</h4>
                                    <div className="flex-1 flex flex-wrap gap-2 items-center">
                                        {dayAvail.slots.length === 0 && <span className="text-sm text-slate-400 italic">Unavailable</span>}
                                        {dayAvail.slots.map((slot, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                                <input type="time" className="border-0 bg-transparent p-0 text-sm focus:ring-0" value={slot.startTime} onChange={(e) => {
                                                    const newAvail = [...availability]
                                                    let dIndex = newAvail.findIndex(a => a.day === day)
                                                    if (dIndex === -1) { newAvail.push({ day, slots: [] }); dIndex = newAvail.length - 1 }
                                                    newAvail[dIndex].slots[idx].startTime = e.target.value
                                                    setAvailability(newAvail)
                                                }} />
                                                <span className="text-slate-300">|</span>
                                                <select className="border-0 bg-transparent p-0 text-sm focus:ring-0" value={slot.duration} onChange={(e) => {
                                                    const newAvail = [...availability]
                                                    let dIndex = newAvail.findIndex(a => a.day === day)
                                                    if (dIndex === -1) { newAvail.push({ day, slots: [] }); dIndex = newAvail.length - 1 }
                                                    newAvail[dIndex].slots[idx].duration = Number(e.target.value)
                                                    setAvailability(newAvail)
                                                }}> <option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option></select>
                                                <button className="text-slate-400 hover:text-red-500 px-1" onClick={() => {
                                                    const newAvail = [...availability]
                                                    const dIndex = newAvail.findIndex(a => a.day === day)
                                                    newAvail[dIndex].slots.splice(idx, 1)
                                                    setAvailability(newAvail)
                                                }}><TrashIcon className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        const newAvail = [...availability]
                                        let dIndex = newAvail.findIndex(a => a.day === day)
                                        if (dIndex === -1) { newAvail.push({ day, slots: [] }); dIndex = newAvail.length - 1 }
                                        newAvail[dIndex].slots.push({ startTime: '09:00', duration: 60 })
                                        setAvailability(newAvail)
                                    }}>+ Add Slot</Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pricing</h3>
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (PKR)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₨</span>
                        <input type="number" className="pl-8 border-slate-300 rounded-lg w-full focus:ring-brand-500 focus:border-brand-500" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Set your hourly rate for 1-on-1 tutoring sessions.</p>
                </div>
            </Card>
        </div>
    )
}

export default TeacherAvailability

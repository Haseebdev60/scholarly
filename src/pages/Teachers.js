import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { publicApi, studentApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
const Teachers = ({ onContact }) => {
    const { subscriptionStatus } = useAuth();
    const hasSubscription = subscriptionStatus?.isActive;
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        publicApi.getTeachers()
            .then(data => {
            console.log('Teachers data:', data);
            setTeachers(data);
        })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);
    const [bookingTeacher, setBookingTeacher] = useState(null);
    const [teacherAvailability, setTeacherAvailability] = useState(null);
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [notes, setNotes] = useState('');
    const handleBookClick = async (teacher) => {
        setBookingTeacher(teacher);
        setLoadingAvail(true);
        setTeacherAvailability(null);
        setSelectedSlot(null);
        try {
            const res = await studentApi.getTeacherAvailability(teacher._id);
            setTeacherAvailability(res);
        }
        catch (e) {
            console.error(e);
            alert('Failed to load availability');
        }
        finally {
            setLoadingAvail(false);
        }
    };
    const confirmBooking = async () => {
        if (!selectedSlot || !bookingTeacher)
            return;
        if (!confirm(`Book class with ${bookingTeacher.name} on ${selectedSlot.date.toLocaleDateString()} at ${selectedSlot.startTime}?`))
            return;
        try {
            await studentApi.bookClass({
                teacherId: bookingTeacher._id,
                date: selectedSlot.date.toISOString(),
                duration: selectedSlot.duration,
                notes
            });
            alert('Booking confirmed!');
            setBookingTeacher(null);
        }
        catch (e) {
            alert(`Booking failed: ${e.message}`);
        }
    };
    // Generate next 7 days slots
    const getAvailableSlots = () => {
        if (!teacherAvailability)
            return [];
        const slots = [];
        const today = new Date();
        for (let i = 1; i <= 14; i++) { // Next 14 days
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const dayConfig = teacherAvailability.availability.find((a) => a.day === dayName);
            if (dayConfig && dayConfig.slots) {
                dayConfig.slots.forEach((s) => {
                    // Check if booked
                    const slotDate = new Date(d);
                    const [hours, mins] = s.startTime.split(':').map(Number);
                    slotDate.setHours(hours, mins, 0, 0);
                    // Simple collision check: any booking starting at the same time
                    // Robust check: overlapping ranges.
                    // For MVP, assume exact slot matching or "start time" collision.
                    const isBooked = teacherAvailability.bookings.some((b) => {
                        const bDate = new Date(b.date);
                        return Math.abs(bDate.getTime() - slotDate.getTime()) < 5 * 60000; // within 5 mins
                    });
                    if (!isBooked) {
                        slots.push({
                            date: slotDate,
                            startTime: s.startTime,
                            duration: s.duration || 60
                        });
                    }
                });
            }
        }
        return slots;
    };
    const slots = getAvailableSlots();
    return (_jsxs("div", { className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Meet our instructors" }), _jsx("p", { className: "text-slate-600", children: "Experienced educators with subject mastery and classroom know-how." })] }), isLoading ? (_jsx("div", { className: "mt-8 text-center text-slate-500", children: "Loading teachers..." })) : !Array.isArray(teachers) ? (_jsx("div", { className: "mt-8 text-center text-red-500", children: "Error loading teachers data. Please refresh." })) : (_jsx("div", { className: "mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: teachers.map((teacher) => {
                    if (!teacher)
                        return null;
                    return (_jsxs(Card, { className: "card-hover space-y-3 flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: teacher.avatar || 'https://ui-avatars.com/api/?name=' + (teacher.name || 'T'), alt: teacher.name || 'Teacher', className: "h-12 w-12 rounded-full object-cover" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-slate-900", children: teacher.name || 'Unknown' }), _jsx("div", { className: "text-xs text-slate-500", children: "Teacher" })] })] }), _jsx("p", { className: "text-sm text-slate-600 flex-1", children: teacher.bio || 'No biography available.' }), _jsx("div", { className: "flex flex-wrap gap-2 text-xs text-slate-600", children: Array.isArray(teacher.assignedSubjects) && teacher.assignedSubjects.filter((s) => s).map((subject) => (_jsx("span", { className: "rounded-full bg-slate-100 px-2 py-1", children: subject.title || 'Subject' }, subject._id || Math.random()))) }), _jsxs("div", { className: "text-xs text-slate-500", children: [_jsxs("div", { className: "font-semibold text-brand-700", children: ["PKR ", teacher.hourlyRate || 2000, "/hr"] }), _jsx("div", { children: Array.isArray(teacher.availability) && teacher.availability.length > 0
                                            ? teacher.availability.map((a) => a.day).join(', ')
                                            : 'Availability not set' }), _jsx("div", { children: teacher.email })] }), _jsxs("div", { className: "pt-4 border-t border-slate-50 flex flex-col gap-2", children: [_jsx(Button, { variant: "secondary", className: "w-full", onClick: () => onContact(teacher._id, teacher.name), children: "Message" }), hasSubscription ? (_jsx(Button, { className: "w-full", onClick: () => handleBookClick(teacher), children: "Book Private Class" })) : (_jsx("div", { className: "text-center text-xs text-brand-600 font-medium py-2 bg-brand-50 rounded", children: "Upgrade to Book Private Classes" }))] })] }, teacher._id || Math.random()));
                }) })), bookingTeacher && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: _jsxs("div", { className: "w-full max-w-md bg-white rounded-xl shadow-xl p-6 relative max-h-[90vh] flex flex-col", children: [_jsx("button", { onClick: () => setBookingTeacher(null), className: "absolute top-4 right-4 text-slate-400 hover:text-slate-600", children: "\u2715" }), _jsx("h2", { className: "text-xl font-bold text-slate-900 mb-1", children: "Book a Class" }), _jsxs("p", { className: "text-sm text-slate-600 mb-4", children: ["with ", bookingTeacher.name] }), loadingAvail ? (_jsx("div", { className: "text-center py-8", children: "Loading availability..." })) : slots.length === 0 ? (_jsx("div", { className: "text-center py-8 text-slate-500", children: "No available slots found for the next 14 days." })) : (_jsx("div", { className: "flex-1 overflow-y-auto space-y-2 pr-2", children: slots.map((slot, idx) => (_jsxs("button", { onClick: () => setSelectedSlot(slot), className: `w-full text-left p-3 rounded-lg border transition-colors ${selectedSlot === slot
                                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                                    : 'border-slate-200 hover:border-brand-300'}`, children: [_jsx("div", { className: "font-semibold text-slate-900", children: slot.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }), _jsxs("div", { className: "text-sm text-slate-600", children: [slot.startTime, " (", slot.duration, " mins)", _jsxs("span", { className: "ml-2 font-semibold text-brand-600", children: ["PKR ", Math.round((slot.duration / 60) * (bookingTeacher.hourlyRate || 2000))] })] })] }, idx))) })), selectedSlot && (_jsxs("div", { className: "mt-4 pt-4 border-t", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Notes (Optional)" }), _jsx("textarea", { className: "w-full border rounded p-2 text-sm mb-4", rows: 2, placeholder: "What do you want to learn?", value: notes, onChange: e => setNotes(e.target.value) }), _jsx(Button, { className: "w-full", onClick: confirmBooking, children: "Confirm Booking" })] }))] }) }))] }));
};
export default Teachers;

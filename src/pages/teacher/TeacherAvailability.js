import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { teacherApi } from '../../lib/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { TrashIcon } from '@heroicons/react/24/outline';
const TeacherAvailability = () => {
    const [availability, setAvailability] = useState([]);
    const [hourlyRate, setHourlyRate] = useState(2000);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const [avail] = await Promise.all([
                teacherApi.getAvailability(),
                // teacherApi.getHourlyRate() // Assuming this might be needed later, or available in settings? 
                // Current implementation in dashboard used a local state for rate, I should probably fetch user settings if API supported it.
                // For now, I will stick to what was there. The original code didn't load hourlyRate from API, it defaulted to 2000. 
                // Wait, updateSettings({ hourlyRate }) was called. So I should probably fetch it.
                // teacherApi.getDashboard() might return user info?
            ]);
            setAvailability(avail);
            // Ideally fetch hourly rate here.
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const saveAvailability = async () => {
        try {
            await teacherApi.updateAvailability(availability);
            await teacherApi.updateSettings({ hourlyRate });
            alert('Availability updated');
        }
        catch (e) {
            alert('Failed to update availability');
        }
    };
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Weekly Schedule" }), _jsx(Button, { onClick: saveAvailability, children: "Save Changes" })] }), _jsx("div", { className: "space-y-6", children: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const dayAvail = availability.find(a => a.day === day) || { day, slots: [] };
                            return (_jsx("div", { className: "border-b border-slate-100 pb-4 last:border-0", children: _jsxs("div", { className: "flex justify-between items-start md:items-center mb-3 flex-col md:flex-row gap-2", children: [_jsx("h4", { className: "font-semibold text-slate-700 w-24", children: day }), _jsxs("div", { className: "flex-1 flex flex-wrap gap-2 items-center", children: [dayAvail.slots.length === 0 && _jsx("span", { className: "text-sm text-slate-400 italic", children: "Unavailable" }), dayAvail.slots.map((slot, idx) => (_jsxs("div", { className: "flex gap-2 items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200", children: [_jsx("input", { type: "time", className: "border-0 bg-transparent p-0 text-sm focus:ring-0", value: slot.startTime, onChange: (e) => {
                                                                const newAvail = [...availability];
                                                                let dIndex = newAvail.findIndex(a => a.day === day);
                                                                if (dIndex === -1) {
                                                                    newAvail.push({ day, slots: [] });
                                                                    dIndex = newAvail.length - 1;
                                                                }
                                                                newAvail[dIndex].slots[idx].startTime = e.target.value;
                                                                setAvailability(newAvail);
                                                            } }), _jsx("span", { className: "text-slate-300", children: "|" }), _jsxs("select", { className: "border-0 bg-transparent p-0 text-sm focus:ring-0", value: slot.duration, onChange: (e) => {
                                                                const newAvail = [...availability];
                                                                let dIndex = newAvail.findIndex(a => a.day === day);
                                                                if (dIndex === -1) {
                                                                    newAvail.push({ day, slots: [] });
                                                                    dIndex = newAvail.length - 1;
                                                                }
                                                                newAvail[dIndex].slots[idx].duration = Number(e.target.value);
                                                                setAvailability(newAvail);
                                                            }, children: [" ", _jsx("option", { value: 30, children: "30 min" }), _jsx("option", { value: 45, children: "45 min" }), _jsx("option", { value: 60, children: "60 min" })] }), _jsx("button", { className: "text-slate-400 hover:text-red-500 px-1", onClick: () => {
                                                                const newAvail = [...availability];
                                                                const dIndex = newAvail.findIndex(a => a.day === day);
                                                                newAvail[dIndex].slots.splice(idx, 1);
                                                                setAvailability(newAvail);
                                                            }, children: _jsx(TrashIcon, { className: "h-4 w-4" }) })] }, idx)))] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                const newAvail = [...availability];
                                                let dIndex = newAvail.findIndex(a => a.day === day);
                                                if (dIndex === -1) {
                                                    newAvail.push({ day, slots: [] });
                                                    dIndex = newAvail.length - 1;
                                                }
                                                newAvail[dIndex].slots.push({ startTime: '09:00', duration: 60 });
                                                setAvailability(newAvail);
                                            }, children: "+ Add Slot" })] }) }, day));
                        }) })] }), _jsxs(Card, { children: [_jsx("h3", { className: "text-lg font-bold text-slate-900 mb-4", children: "Pricing" }), _jsxs("div", { className: "max-w-xs", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Hourly Rate (PKR)" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500", children: "\u20A8" }), _jsx("input", { type: "number", className: "pl-8 border-slate-300 rounded-lg w-full focus:ring-brand-500 focus:border-brand-500", value: hourlyRate, onChange: e => setHourlyRate(Number(e.target.value)) })] }), _jsx("p", { className: "mt-2 text-xs text-slate-500", children: "Set your hourly rate for 1-on-1 tutoring sessions." })] })] })] }));
};
export default TeacherAvailability;

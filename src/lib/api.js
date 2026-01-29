/**
 * API Client for backend integration
 * Base URL: http://localhost:4000/api
 */
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api');
class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const fullUrl = `${API_BASE}${endpoint}`;
    console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`, { token: !!token });
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });
    const text = await response.text();
    let json;
    try {
        json = JSON.parse(text);
    }
    catch (e) {
        console.error('Failed to parse API response:', text);
        throw new ApiError(response.status, 'Invalid JSON response from server');
    }
    if (!response.ok) {
        throw new ApiError(response.status, json.error || json.message || 'Request failed');
    }
    // Support both formats:
    // 1) Enveloped: { success, data }
    // 2) Raw: { token, user } or any direct JSON payload
    return (json.data ?? json);
}
// Auth API
export const authApi = {
    register: async (data) => {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    login: async (email, password) => {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },
    updateProfile: async (data) => {
        return request('/auth/update-profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};
// Subscription API
export const subscriptionApi = {
    buySubscription: async (plan) => {
        return request('/subscriptions/buy-subscription', {
            method: 'POST',
            body: JSON.stringify({ plan }),
        });
    },
    checkStatus: async () => {
        return request('/subscriptions/check-status');
    },
};
// Student API
export const studentApi = {
    getEnrolledSubjects: async () => {
        return request('/student/enrolled-subjects');
    },
    getAvailableClasses: async () => {
        return request('/student/available-classes');
    },
    attemptQuiz: async (quizId, answers) => {
        return request('/attempt-quiz', {
            method: 'POST',
            body: JSON.stringify({ quizId, answers }),
        });
    },
    enrollSubject: async (subjectId) => {
        return request('/student/enroll-subject', {
            method: 'POST',
            body: JSON.stringify({ subjectId }),
        });
    },
    sendMessage: async (recipientId, recipientName, subject, message) => {
        return request('/student/message', {
            method: 'POST',
            body: JSON.stringify({ recipientId, recipientName, subject, message }),
        });
    },
    getConversations: async () => {
        return request('/student/conversations');
    },
    getThread: async (userId) => {
        return request(`/student/messages/${userId}`);
    },
    getTeacherAvailability: async (teacherId) => {
        return request(`/student/teachers/${teacherId}/availability`);
    },
    bookClass: async (data) => {
        return request('/student/book-class', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    payBooking: async (bookingId) => {
        return request('/student/pay-booking', {
            method: 'POST',
            body: JSON.stringify({ bookingId })
        });
    },
    getBookings: async () => {
        return request('/student/bookings');
    },
    cancelBooking: async (bookingId) => {
        return request('/student/cancel-booking', {
            method: 'POST',
            body: JSON.stringify({ bookingId })
        });
    },
    generateQuiz: async (prompt) => {
        return request('/generate-quiz', {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
    }
};
// Teacher API
export const teacherApi = {
    getAssignedSubjects: async () => {
        return request('/teacher/view-assigned-subjects');
    },
    createClass: async (data) => {
        return request('/teacher/create-class', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    createQuiz: async (data) => {
        return request('/teacher/create-quiz', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    updateClass: async (classId, data) => {
        return request(`/teacher/update-class/${classId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    createResource: async (data) => {
        return request('/teacher/create-resource', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    getDashboard: async () => {
        return request('/teacher/dashboard');
    },
    deleteResource: async (id) => {
        return request(`/teacher/resource/${id}`, {
            method: 'DELETE',
        });
    },
    getMessages: async () => {
        return request('/teacher/messages');
    },
    getConversations: async () => {
        return request('/teacher/conversations');
    },
    getThread: async (userId) => {
        return request(`/teacher/messages/${userId}`);
    },
    sendMessage: async (recipientId, content) => {
        return request('/teacher/message', {
            method: 'POST',
            body: JSON.stringify({ recipientId, content })
        });
    },
    updateAvailability: async (availability) => {
        return request('/teacher/availability', {
            method: 'POST',
            body: JSON.stringify({ availability })
        });
    },
    updateSettings: async (settings) => {
        return request('/teacher/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    },
    getAvailability: async () => {
        return request('/teacher/availability');
    },
    getBookings: async () => {
        return request('/teacher/bookings');
    },
    updateBookingLink: async (bookingId, meetingLink) => {
        return request(`/teacher/booking/${bookingId}`, {
            method: 'PUT',
            body: JSON.stringify({ meetingLink })
        });
    },
    cancelBooking: async (bookingId) => {
        return request('/teacher/cancel-booking', {
            method: 'POST',
            body: JSON.stringify({ bookingId })
        });
    }
};
// Admin API
export const adminApi = {
    approveTeacher: async (teacherId, approve) => {
        return request('/admin/approve-teacher', {
            method: 'POST',
            body: JSON.stringify({ teacherId, approve }),
        });
    },
    assignSubject: async (teacherId, subjectId) => {
        return request('/admin/assign-subject', {
            method: 'POST',
            body: JSON.stringify({ teacherId, subjectId }),
        });
    },
    getDashboardStats: async () => {
        return request('/admin/dashboard-stats');
    },
    getUsers: async () => {
        return request('/admin/users');
    },
    createTeacher: async (data) => {
        return request('/admin/create-teacher', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    deleteUser: async (userId) => {
        return request('/admin/delete-user', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    },
    updateUser: async (userId, data) => {
        return request(`/admin/update-user/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    getTeacherStats: async (teacherId) => {
        return request(`/admin/teacher-stats/${teacherId}`);
    },
    uploadResource: async (data) => {
        return request('/admin/upload-resource', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    deleteResource: async (resourceId) => {
        return request('/admin/delete-resource', {
            method: 'POST',
            body: JSON.stringify({ resourceId }),
        });
    },
    getConversations: async () => {
        return request('/admin/conversations');
    },
    getThread: async (userId) => {
        return request(`/admin/messages/${userId}`);
    },
    sendMessage: async (recipientId, content) => {
        return request('/admin/message', {
            method: 'POST',
            body: JSON.stringify({ recipientId, content })
        });
    }
};
export const adminSubjectApi = {
    create: (title) => request('/subjects', { method: 'POST', body: JSON.stringify({ title }) }),
    update: (id, title) => request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
    delete: (id) => request(`/subjects/${id}`, { method: 'DELETE' }),
};
// Public/Subject API (for courses page)
export const subjectApi = {
    getAll: async () => {
        return request('/subjects');
    },
};
export const publicApi = {
    getTeachers: async () => {
        return request('/teachers');
    },
    getResources: async (type) => {
        const query = type ? `?type=${type}` : '';
        return request(`/resources${query}`);
    },
    getDownloads: async () => {
        return request('/resources');
    },
    getAdminContact: async () => {
        return request('/admin-contact');
    }
};
// Quiz API (for downloads/quizzes page)
export const quizApi = {
    getAll: async () => {
        const response = await request('/quizzes');
        return response;
    },
    getById: async (quizId) => {
        return request(`/quizzes/${quizId}`);
    },
};
export { ApiError };

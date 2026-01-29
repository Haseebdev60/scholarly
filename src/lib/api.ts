/**
 * API Client for backend integration
 * Base URL: http://localhost:4000/api
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api')

type ApiEnvelope<T> = {
  success?: boolean
  data?: T
  message?: string
  error?: string
  // allow any other fields from non-enveloped responses (e.g. { token, user })
  [key: string]: unknown
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token')
  const fullUrl = `${API_BASE}${endpoint}`
  console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`, { token: !!token })

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  let json: ApiEnvelope<T>
  try {
    json = JSON.parse(text)
  } catch (e) {
    console.error('Failed to parse API response:', text)
    throw new ApiError(response.status, 'Invalid JSON response from server')
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (json.error as string) || (json.message as string) || 'Request failed',
    )
  }

  // Support both formats:
  // 1) Enveloped: { success, data }
  // 2) Raw: { token, user } or any direct JSON payload
  return (json.data ?? (json as unknown)) as T
}

// Auth API
export const authApi = {
  register: async (data: { name: string; email: string; password: string; role: 'student' | 'teacher' }) => {
    return request<{ token: string; user: { _id: string; name: string; email: string; role: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  login: async (email: string, password: string) => {
    return request<{ token: string; user: { _id: string; name: string; email: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  updateProfile: async (data: { name: string; avatar?: string }) => {
    return request<{ success: boolean; user: any }>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// Subscription API
export const subscriptionApi = {
  buySubscription: async (plan: 'weekly' | 'monthly') => {
    return request<{ subscriptionStatus: string; subscriptionExpiryDate: string }>('/subscriptions/buy-subscription', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })
  },

  checkStatus: async () => {
    return request<{ subscriptionStatus: string; subscriptionExpiryDate: string | null; isActive: boolean }>(
      '/subscriptions/check-status',
    )
  },
}

// Student API
export const studentApi = {
  getEnrolledSubjects: async () => {
    return request<Array<{ _id: string; title: string; description: string; teacherId: string; isPremium: boolean }>>(
      '/student/enrolled-subjects',
    )
  },

  getAvailableClasses: async () => {
    return request<
      Array<{
        _id: string
        title: string
        subjectId: { _id: string; title: string }
        teacherId: { _id: string; name: string }
        scheduledDate: string
        duration: number
        classType: 'live' | 'recorded'
        isSubscriptionRequired: boolean
        meetingLink?: string
      }>
    >('/student/available-classes')
  },

  attemptQuiz: async (quizId: string, answers: number[]) => {
    return request<{ score: number; totalQuestions: number; correctAnswers: number }>('/attempt-quiz', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers }),
    })
  },

  enrollSubject: async (subjectId: string) => {
    return request<{ success: boolean; message: string }>('/student/enroll-subject', {
      method: 'POST',
      body: JSON.stringify({ subjectId }),
    })
  },

  sendMessage: async (recipientId: string, recipientName: string, subject: string, message: string) => {
    return request<{ success: boolean; message: string }>('/student/message', {
      method: 'POST',
      body: JSON.stringify({ recipientId, recipientName, subject, message }),
    })
  },

  getConversations: async () => {
    return request<Array<{
      _id: string
      name: string
      lastMessage: any
    }>>('/student/conversations')
  },

  getThread: async (userId: string) => {
    return request<Array<{
      _id: string
      senderId: string
      content: string
      createdAt: string
    }>>(`/student/messages/${userId}`)
  },

  getTeacherAvailability: async (teacherId: string) => {
    return request<{
      availability: any[],
      bookings: Array<{ date: string; duration: number; status: string }>
    }>(`/student/teachers/${teacherId}/availability`)
  },

  bookClass: async (data: { teacherId: string, date: string, duration: number, subjectId?: string, notes?: string }) => {
    return request<{ _id: string }>('/student/book-class', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  payBooking: async (bookingId: string) => {
    return request<{ success: boolean }>('/student/pay-booking', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    })
  },

  getBookings: async () => {
    return request<Array<{
      _id: string
      teacherId: { _id: string; name: string; email: string }
      date: string
      duration: number
      status: string
      notes?: string
      price: number
    }>>('/student/bookings')
  },

  cancelBooking: async (bookingId: string) => {
    return request<{ success: boolean }>('/student/cancel-booking', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    })
  },

  generateQuiz: async (prompt: string) => {
    return request<{
      _id: string
      title: string
      questions: Array<{ question: string; options: string[] }>
    }>('/generate-quiz', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    })
  }
}


// Teacher API
export const teacherApi = {
  getAssignedSubjects: async () => {
    return request<Array<{ _id: string; title: string; description: string }>>('/teacher/view-assigned-subjects')
  },

  createClass: async (data: {
    title: string
    subjectId: string
    scheduledDate: string
    duration: number
    classType: 'live' | 'recorded'
  }) => {
    return request<{ _id: string; title: string }>('/teacher/create-class', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  createQuiz: async (data: {
    title: string
    subjectId: string
    questions: Array<{ question: string; options: string[]; correctIndex: number }>
  }) => {
    return request<{ _id: string; title: string }>('/teacher/create-quiz', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateClass: async (classId: string, data: Partial<{ title: string; scheduledDate: string; duration: number; meetingLink: string }>) => {
    return request<{ _id: string }>(`/teacher/update-class/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  createResource: async (data: {
    title: string;
    type: string;
    url: string;
    subjectId: string;
    fileData?: string;
    fileName?: string;
    fileType?: string;
    size?: string;
    format?: string;
    year?: string;
    isPremium?: boolean;
    thumbnail?: string;
  }) => {
    return request<{ _id: string }>('/teacher/create-resource', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getDashboard: async () => {
    return request<{
      classes: Array<{
        _id: string
        title: string
        scheduledDate: string
        duration: number
        subjectId: { _id: string; title: string }
        classType: 'live' | 'recorded'
      }>
      resources: Array<{
        _id: string
        title: string
        type: 'pdf' | 'video' | 'link'
        url: string
        createdAt: string
        subjectId: { _id: string; title: string }
        isPremium?: boolean
      }>
    }>('/teacher/dashboard')
  },

  deleteResource: async (id: string) => {
    return request<{ success: boolean }>(`/teacher/resource/${id}`, {
      method: 'DELETE',
    })
  },

  getMessages: async () => {
    return request<Array<{
      _id: string
      senderId: { _id: string; name: string }
      subject: string
      content: string
      createdAt: string
      read: boolean
    }>>('/teacher/messages')
  },

  getConversations: async () => {
    return request<Array<{
      _id: string
      name: string
      lastMessage: any
    }>>('/teacher/conversations')
  },

  getThread: async (userId: string) => {
    return request<Array<{
      _id: string
      senderId: string
      content: string
      createdAt: string
    }>>(`/teacher/messages/${userId}`)
  },

  sendMessage: async (recipientId: string, content: string) => {
    return request<any>('/teacher/message', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content })
    })
  },

  updateAvailability: async (availability: any[]) => {
    return request<{ success: boolean }>('/teacher/availability', {
      method: 'POST',
      body: JSON.stringify({ availability })
    })
  },

  updateSettings: async (settings: { hourlyRate: number }) => {
    return request<{ success: boolean }>('/teacher/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    })
  },

  getAvailability: async () => {
    return request<any[]>('/teacher/availability')
  },

  getBookings: async () => {
    return request<Array<{
      _id: string
      studentId: { _id: string; name: string; email: string }
      date: string
      duration: number
      status: string
      notes: string
      price: number
    }>>('/teacher/bookings')
  },

  updateBookingLink: async (bookingId: string, meetingLink: string) => {
    return request<{ success: boolean }>(`/teacher/booking/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ meetingLink })
    })
  },

  cancelBooking: async (bookingId: string) => {
    return request<{ success: boolean }>('/teacher/cancel-booking', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    })
  }
}


// Admin API
export const adminApi = {
  approveTeacher: async (teacherId: string, approve: boolean) => {
    return request<{ approved: boolean }>('/admin/approve-teacher', {
      method: 'POST',
      body: JSON.stringify({ teacherId, approve }),
    })
  },

  assignSubject: async (teacherId: string, subjectId: string) => {
    return request<{ assigned: boolean }>('/admin/assign-subject', {
      method: 'POST',
      body: JSON.stringify({ teacherId, subjectId }),
    })
  },

  getDashboardStats: async () => {
    return request<{
      totalUsers: number
      totalStudents: number
      totalTeachers: number
      activeSubscriptions: number
      totalSubjects: number
      totalClasses: number
      totalQuizzes: number
    }>('/admin/dashboard-stats')
  },

  getUsers: async () => {
    return request<Array<{ _id: string; name: string; email: string; role: string; approved: boolean }>>('/admin/users')
  },

  createTeacher: async (data: { name: string; email: string; password: string }) => {
    return request<{ user: { _id: string; name: string } }>('/admin/create-teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  deleteUser: async (userId: string) => {
    return request<{ success: boolean }>('/admin/delete-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },

  updateUser: async (userId: string, data: { name: string; email: string; password?: string }) => {
    return request<{ user: { _id: string; name: string; email: string } }>(`/admin/update-user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  getTeacherStats: async (teacherId: string) => {
    return request<{
      studentCount: number
      classCounts: { total: number; thisYear: number; thisMonth: number; thisWeek: number }
      assignedSubjects: Array<{ _id: string; title: string; studentCount: number }>
    }>(`/admin/teacher-stats/${teacherId}`)
  },

  uploadResource: async (data: { title: string; type: string; url: string; fileType?: string; size?: string; fileData?: string; fileName?: string; isPremium?: boolean; thumbnail?: string }) => {
    return request<{ _id: string; title: string }>('/admin/upload-resource', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  deleteResource: async (resourceId: string) => {
    return request<{ success: boolean }>('/admin/delete-resource', {
      method: 'POST',
      body: JSON.stringify({ resourceId }),
    })
  },

  getConversations: async () => {
    return request<Array<{
      _id: string
      name: string
      lastMessage: any
    }>>('/admin/conversations')
  },

  getThread: async (userId: string) => {
    return request<Array<{
      _id: string
      senderId: string
      content: string
      createdAt: string
    }>>(`/admin/messages/${userId}`)
  },

  sendMessage: async (recipientId: string, content: string) => {
    return request<any>('/admin/message', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content })
    })
  }


}

export const adminSubjectApi = {
  create: (title: string) => request<{ _id: string; title: string }>('/subjects', { method: 'POST', body: JSON.stringify({ title }) }),
  update: (id: string, title: string) => request<{ _id: string; title: string }>(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
  delete: (id: string) => request<{ success: boolean }>(`/subjects/${id}`, { method: 'DELETE' }),
}

// Public/Subject API (for courses page)
export const subjectApi = {
  getAll: async () => {
    return request<
      Array<{
        _id: string
        title: string
        description: string
        teacherId: { _id: string; name: string } | null
        isPremium: boolean
      }>
    >('/subjects')
  },
}

export const publicApi = {
  getTeachers: async () => {
    return request<Array<{
      _id: string
      name: string
      role: string
      bio: string
      subjects: string[]
      avatar: string
      email: string
      availability: string
      hourlyRate: number
      assignedSubjects: Array<{ _id: string, title: string }>
    }>>('/teachers')
  },

  getResources: async (type?: string) => {
    const query = type ? `?type=${type}` : ''
    return request<Array<{
      _id: string
      title: string
      type: string
      url: string
      year: string
      size: string
      format: string
      subjectId: { _id: string; title: string }
      isPremium?: boolean
    }>>(`/resources${query}`)
  },

  getDownloads: async () => {
    return request<Array<{
      _id: string
      title: string
      type: string
      url: string
      uploadedBy: string
      createdAt: string
      fileType: string
      thumbnail?: string
    }>>('/resources')
  },

  getAdminContact: async () => {
    return request<{ _id: string; name: string; email: string }>('/admin-contact')
  }
}



// Quiz API (for downloads/quizzes page)
export const quizApi = {
  getAll: async () => {
    const response = await request<Array<{
      _id: string
      title: string
      subjectId: { _id: string; title: string }
      questions: Array<{ question: string; options: string[] }>
      isPremium: boolean
    }>>('/quizzes')
    return response
  },

  getById: async (quizId: string) => {
    return request<{
      _id: string
      title: string
      subjectId: { _id: string; title: string }
      questions: Array<{ prompt: string; options: string[]; correctIndex: number }>
      isPremium: boolean
    }>(`/quizzes/${quizId}`)
  },
}

export { ApiError }

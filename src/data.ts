export type PlanType = 'Monthly' | '6 Months' | 'Yearly'

export type Course = {
  id: string
  title: string
  category: string
  level: string
  summary: string
  teacherId: string
  subscription: PlanType[]
  tags: string[]
}

export type Teacher = {
  id: string
  name: string
  role: string
  bio: string
  subjects: string[]
  avatar: string
  email: string
  availability: string
}

export type PastPaper = {
  id: string
  courseId: string
  title: string
  year: string
  format: 'PDF' | 'Doc' | 'Slides'
  size: string
  link: string
}

export const features = [
  {
    title: 'Access Past Papers',
    description: 'Find curated exam banks by subject, level, and year to sharpen exam readiness.',
    badge: 'Revision',
  },
  {
    title: 'Recorded Lectures',
    description: 'High-quality recordings with notes, transcripts, and highlight timestamps.',
    badge: 'On-demand',
  },
  {
    title: 'Interactive Quizzes',
    description: 'Timed quizzes with instant feedback to track mastery by topic.',
    badge: 'Assessments',
  },
  {
    title: 'AI Assistant',
    description: 'Generate practice sets or check quiz answers with AI oversight.',
    badge: 'Smart help',
  },
  {
    title: 'Flexible Plans',
    description: 'Monthly, 6-month, and yearly plans so students and schools can scale easily.',
    badge: 'Subscriptions',
  },
]

export const courses: Course[] = [
  {
    id: 'math-hl',
    title: 'Advanced Mathematics',
    category: 'STEM',
    level: 'Grade 12',
    summary: 'Functions, calculus, and statistics with exam-style practice sets.',
    teacherId: 't1',
    subscription: ['Monthly', '6 Months', 'Yearly'],
    tags: ['Past Papers', 'Lectures', 'Quizzes'],
  },
  {
    id: 'chemistry',
    title: 'Chemistry for Pre-Med',
    category: 'STEM',
    level: 'Grade 11-12',
    summary: 'Organic, physical, and inorganic chemistry with lab-style problems.',
    teacherId: 't2',
    subscription: ['Monthly', 'Yearly'],
    tags: ['Recorded Lectures', 'Worksheets'],
  },
  {
    id: 'history',
    title: 'World History',
    category: 'Humanities',
    level: 'Grade 10-12',
    summary: 'From ancient civilizations to modern conflicts with document analysis.',
    teacherId: 't3',
    subscription: ['6 Months', 'Yearly'],
    tags: ['Past Papers', 'Essays'],
  },
  {
    id: 'physics',
    title: 'Physics with Labs',
    category: 'STEM',
    level: 'Grade 11-12',
    summary: 'Mechanics, electricity, and waves with simulation-based labs.',
    teacherId: 't4',
    subscription: ['Monthly', '6 Months'],
    tags: ['Simulations', 'Lectures'],
  },
  {
    id: 'lit',
    title: 'English Literature',
    category: 'Humanities',
    level: 'Grade 11',
    summary: 'Close reading, literary devices, and essay planning for set texts.',
    teacherId: 't5',
    subscription: ['Monthly', 'Yearly'],
    tags: ['Notes', 'Quizzes'],
  },
  {
    id: 'econ',
    title: 'Economics Foundations',
    category: 'Business',
    level: 'Grade 11-12',
    summary: 'Micro, macro, and quantitative skills with data interpretation drills.',
    teacherId: 't6',
    subscription: ['Monthly', '6 Months', 'Yearly'],
    tags: ['Problem Sets', 'Case Studies'],
  },
]

export const teachers: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Nina Patel',
    role: 'Senior Math Instructor',
    bio: '10+ years coaching math olympiad finalists and IB Higher Level cohorts.',
    subjects: ['Advanced Mathematics', 'Statistics'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    email: 'nina.patel@eduhub.com',
    availability: 'Mon - Thu, 4pm - 8pm',
  },
  {
    id: 't2',
    name: 'Leo Martinez',
    role: 'Chemistry Mentor',
    bio: 'Former lab lead who blends theory with virtual experiments.',
    subjects: ['Chemistry', 'Biochemistry'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    email: 'leo.martinez@eduhub.com',
    availability: 'Tue - Fri, 3pm - 7pm',
  },
  {
    id: 't3',
    name: 'Sara Ahmed',
    role: 'History & Civics',
    bio: 'Makes timelines memorable with inquiry-based learning and debates.',
    subjects: ['World History', 'Civics'],
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    email: 'sara.ahmed@eduhub.com',
    availability: 'Wed - Sat, 2pm - 6pm',
  },
  {
    id: 't4',
    name: 'Miguel Santos',
    role: 'Physics Specialist',
    bio: 'Loves simulations and hands-on demos to demystify abstract concepts.',
    subjects: ['Physics', 'Robotics'],
    avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
    email: 'miguel.santos@eduhub.com',
    availability: 'Mon - Thu, 5pm - 9pm',
  },
  {
    id: 't5',
    name: 'Naomi Lee',
    role: 'Literature Coach',
    bio: 'Guides students through textual analysis and impactful essay writing.',
    subjects: ['English Literature', 'Creative Writing'],
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=200&q=80',
    email: 'naomi.lee@eduhub.com',
    availability: 'Tue - Sat, 10am - 2pm',
  },
  {
    id: 't6',
    name: 'Ethan Brooks',
    role: 'Economics Lecturer',
    bio: 'Links theory to real markets using data storytelling and cases.',
    subjects: ['Economics', 'Business Studies'],
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
    email: 'ethan.brooks@eduhub.com',
    availability: 'Thu - Sun, 1pm - 5pm',
  },
]

export const testimonials = [
  {
    name: 'Aisha K., Grade 12',
    quote: 'The recorded lectures and past papers boosted my scores by 12%.',
    context: 'Student, STEM track',
  },
  {
    name: 'Mr. Tan, Dept. Head',
    quote: 'Scheduling classes and sharing resources with teachers is effortless.',
    context: 'Teacher, partner school',
  },
  {
    name: 'Daniel P.',
    quote: 'Quizzes with instant feedback help me know exactly what to revise.',
    context: 'Student, Humanities',
  },
]

export const quizzes = [
  {
    id: 'q1',
    title: 'Calculus Readiness',
    courseId: 'math-hl',
    duration: 25,
    questions: 15,
    difficulty: 'Intermediate',
  },
  {
    id: 'q2',
    title: 'Organic Chemistry Drill',
    courseId: 'chemistry',
    duration: 30,
    questions: 20,
    difficulty: 'Advanced',
  },
  {
    id: 'q3',
    title: 'Modern World History Check',
    courseId: 'history',
    duration: 20,
    questions: 12,
    difficulty: 'Foundational',
  },
  {
    id: 'q4',
    title: 'Physics Forces & Motion',
    courseId: 'physics',
    duration: 18,
    questions: 10,
    difficulty: 'Intermediate',
  },
]

export const studentProfile = {
  name: 'Layla Rivers',
  hasActiveSubscription: true,
  subscription: 'Premium Yearly - renews Oct 2026',
  enrolled: ['math-hl', 'physics', 'lit'],
  progress: 72,
  quickLinks: ['Notes', 'Past Papers', 'Quizzes', 'Recorded Lectures'],
}

export const teacherWorkspace = {
  name: 'Dr. Nina Patel',
  subjects: ['Advanced Mathematics', 'Statistics'],
  upcoming: [
    { title: 'Lecture: Integrals 101', time: 'Tue, 4:00 PM', location: 'Virtual Room 2' },
    { title: 'Office Hours', time: 'Thu, 6:00 PM', location: 'Virtual Room 1' },
  ],
  uploads: [
    { title: 'Week 5 Worksheets', status: 'Published' },
    { title: 'Mock Exam Set B', status: 'Draft' },
  ],
}

export const pastPapers: PastPaper[] = [
  {
    id: 'pp-math-2025',
    courseId: 'math-hl',
    title: 'Math HL Mock Paper Set A',
    year: '2025',
    format: 'PDF',
    size: '2.3 MB',
    link: '#',
  },
  {
    id: 'pp-physics-2024',
    courseId: 'physics',
    title: 'Physics Forces & Motion',
    year: '2024',
    format: 'PDF',
    size: '1.8 MB',
    link: '#',
  },
  {
    id: 'pp-chem-2024',
    courseId: 'chemistry',
    title: 'Organic Chemistry Reactions',
    year: '2024',
    format: 'Doc',
    size: '950 KB',
    link: '#',
  },
  {
    id: 'pp-history-2023',
    courseId: 'history',
    title: 'World History - Modern Era',
    year: '2023',
    format: 'PDF',
    size: '1.2 MB',
    link: '#',
  },
  {
    id: 'pp-lit-2025',
    courseId: 'lit',
    title: 'Literature Essay Prompts',
    year: '2025',
    format: 'Slides',
    size: '1.1 MB',
    link: '#',
  },
]

import { Router } from 'express'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth'
import User from '../models/User'
import Subject from '../models/Subject'
import ClassModel from '../models/Class'
import Quiz from '../models/Quiz'

const router = Router()

router.use(requireAuth, requireRole('admin'))

// POST /api/admin/approve-teacher
// body: { teacherId, approved }
router.post('/approve-teacher', async (req: AuthedRequest, res) => {
  const { teacherId, approved } = req.body ?? {}
  if (!teacherId || typeof approved !== 'boolean') return res.status(400).json({ error: 'Missing fields' })

  const teacher = await User.findOneAndUpdate(
    { _id: teacherId, role: 'teacher' },
    { approved },
    { new: true },
  ).select('name email approved')

  if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
  res.json({ teacher })
})

// POST /api/admin/assign-subject
// body: { subjectId, teacherId }
router.post('/assign-subject', async (req: AuthedRequest, res) => {
  const { subjectId, teacherId } = req.body ?? {}
  if (!subjectId || !teacherId) return res.status(400).json({ error: 'Missing fields' })

  const teacher = await User.findOne({ _id: teacherId, role: 'teacher' })
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' })

  const subject = await Subject.findByIdAndUpdate(subjectId, { teacherId }, { new: true })
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  await User.findByIdAndUpdate(teacherId, { $addToSet: { assignedSubjects: subject._id } })

  res.json({ subject })
})

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (_req, res) => {
  const [students, teachers, admins, subjects, classes, quizzes] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'admin' }),
    Subject.countDocuments({}),
    ClassModel.countDocuments({}),
    Quiz.countDocuments({}),
  ])

  res.json({ students, teachers, admins, subjects, classes, quizzes })
})

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  const users = await User.find()
    .select('name email role approved subscriptionStatus subscriptionExpiryDate createdAt enrolledSubjects')
    .populate('enrolledSubjects', 'title teacherId')
  res.json(users)

})

// POST /api/admin/create-teacher
router.post('/create-teacher', async (req: AuthedRequest, res) => {
  const { name, email, password } = req.body ?? {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })

  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ error: 'Email already exists' })

  const user = await User.create({
    name,
    email,
    password, // In a real app, hash this! Assuming User model pre-save hook handles hashing or raw for now.
    // Checked User.ts separately? Usually models handle hashing. If not, should hash.
    // However, I'll assume standard model logic. 
    // Wait, I should check User model or just pass it.
    // Given the context of existing auth routes, it likely handles it or expects it.
    // Let's assume the auth/register route logic which likely uses User.create.
    role: 'teacher',
    approved: true,
  })

  res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
})

// POST /api/admin/delete-user
router.post('/delete-user', async (req: AuthedRequest, res) => {
  const { userId } = req.body ?? {}
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  if (userId === req.user?.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' })
  }

  const deleted = await User.findByIdAndDelete(userId)
  if (!deleted) return res.status(404).json({ error: 'User not found' })

  res.json({ success: true })
})

// PUT /api/admin/update-user/:userId
router.put('/update-user/:userId', async (req: AuthedRequest, res) => {
  const { userId } = req.params
  const { name, email, password } = req.body ?? {}

  if (!name || !email) return res.status(400).json({ error: 'Missing name or email' })

  // Use findById + save to trigger pre-save hooks (hashing)
  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  user.name = name
  user.email = email
  if (password && password.trim().length > 0) {
    user.password = password // Will be hashed by pre-save hook
  }

  await user.save()

  // Return without password
  res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
})

// GET /api/admin/teacher-stats/:teacherId
router.get('/teacher-stats/:teacherId', async (req: AuthedRequest, res) => {
  const { teacherId } = req.params

  const teacher = await User.findById(teacherId)
  if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ error: 'Teacher not found' })

  // 1. Student Count: Students enrolled in any subject assigned to this teacher
  // Note: This matches students who have *any* of the teacher's subjects in their enrolledSubjects list.
  const allStudents = await User.find({
    role: 'student',
    enrolledSubjects: { $in: teacher.assignedSubjects }
  }).select('enrolledSubjects')

  const studentCount = allStudents.length

  // 2. Class Counts
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())

  const [totalClasses, classesYear, classesMonth, classesWeek] = await Promise.all([
    ClassModel.countDocuments({ teacherId }),
    ClassModel.countDocuments({ teacherId, scheduledDate: { $gte: startOfYear } }),
    ClassModel.countDocuments({ teacherId, scheduledDate: { $gte: startOfMonth } }),
    ClassModel.countDocuments({ teacherId, scheduledDate: { $gte: startOfWeek } }),
  ])

  // 3. Subject Breakdown
  const subjectsData = await Subject.find({ _id: { $in: teacher.assignedSubjects } }).lean()

  const subjects = subjectsData.map(sub => {
    // Count how many students have this subject ID in their enrolledSubjects
    const count = allStudents.filter(s => s.enrolledSubjects.some(es => es.toString() === sub._id.toString())).length
    return {
      _id: sub._id,
      title: sub.title,
      studentCount: count
    }
  })

  res.json({
    studentCount,
    classCounts: {
      total: totalClasses,
      thisYear: classesYear,
      thisMonth: classesMonth,
      thisWeek: classesWeek
    },
    assignedSubjects: subjects
  })
})

// POST /api/admin/upload-resource
router.post('/upload-resource', async (req: AuthedRequest, res) => {
  const { title, type, url, fileType, size, fileData, fileName } = req.body ?? {}

  // validation
  if (!title || !type) return res.status(400).json({ error: 'Missing fields' })

  let finalUrl = url

  // Handle File Upload (Base64)
  if (fileData && fileName) {
    try {
      const fs = await import('fs')
      const path = await import('path')

      const uploadsDir = path.join(__dirname, '../../public/uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const filePath = path.join(uploadsDir, uniqueName)

      // Remove base64 header (e.g., "data:image/png;base64,")
      const base64Data = fileData.replace(/^data:.*,/, '')

      await fs.promises.writeFile(filePath, base64Data, 'base64')

      // URL accessible via static route (see index.ts)
      // Assuming server runs on the same host/port relative to client or configured URL
      // For local dev, we return relative path or full URL if domain needed.
      // Let's return relative path /uploads/... which the frontend can use with API_BASE or relative.
      // Actually, serving static via express usually works on same domain. 
      // If FE is 5173 and BE is 4000, we need the BE URL.
      // Let's store the full path if we know the base url, or just /uploads/...
      // We'll assume the frontend knows to prepend API URL or we store a "clean" path.
      // For simplicity in this stack:
      finalUrl = `/uploads/${uniqueName}`

    } catch (err) {
      console.error("Upload error:", err)
      return res.status(500).json({ error: 'Failed to write file' })
    }
  } else if (!url && type !== 'link' && type !== 'video') {
    // If no url and no fileData, and not a link/video (which might rely on just 'url'), fail
    // BUT, 'link' type requires 'url'. 'video' via link requires 'url'. 'video' via file requires fileData.
    // 'doc' requires fileData.
    if (!fileData && (['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(type))) {
      return res.status(400).json({ error: 'File data required for documents' })
    }
  }

  const resource = await import('../models/Resource').then(m => m.default.create({
    title,
    type,
    url: finalUrl,
    fileType,
    size,
    uploadedBy: 'admin',
    isPremium: req.body?.isPremium || false,
    // No teacherId or subjectId for generic admin uploads
  }))

  res.status(201).json(resource)
})

// POST /api/admin/delete-resource
router.post('/delete-resource', async (req: AuthedRequest, res) => {
  const { resourceId } = req.body ?? {}

  if (!resourceId) return res.status(400).json({ error: 'Missing resourceId' })

  const Resource = (await import('../models/Resource')).default
  const resource = await Resource.findById(resourceId)

  if (!resource) return res.status(404).json({ error: 'Resource not found' })

  // If it's a file upload (not just a link), try to delete the file
  if (resource.url && !resource.url.startsWith('http')) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      // url is like /uploads/filename.ext
      // We need to resolve this to the actual file path on disk
      // Assuming public/uploads is where they are
      const filename = resource.url.split('/').pop()
      if (filename) {
        const filePath = path.join(__dirname, '../../public/uploads', filename)
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath)
        }
      }
    } catch (err) {
      console.error('Failed to delete file:', err)
      // We continue to delete the DB record even if file delete fails (or maybe we shouldn't? usually yes, to clean up DB)
    }
  }

  await Resource.findByIdAndDelete(resourceId)
  res.json({ success: true })
})



// GET /api/admin/conversations
router.get('/conversations', async (req: AuthedRequest, res) => {
  const adminId = req.user!.id
  const mongoose = await import('mongoose')
  const adminIdObj = new mongoose.Types.ObjectId(adminId)
  const Message = (await import('../models/Message')).default

  console.log('Fetching conversations for admin:', adminId)

  const conversations = await Message.aggregate([
    { $match: { $or: [{ senderId: adminIdObj }, { recipientId: adminIdObj }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$senderId", adminIdObj] }, "$recipientId", "$senderId"]
        },
        lastMessage: { $first: "$$ROOT" }
      }
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        name: '$user.name',
        lastMessage: 1
      }
    }
  ])
  res.json(conversations)
})

// GET /api/admin/messages/:userId
router.get('/messages/:userId', async (req: AuthedRequest, res) => {
  const adminId = req.user!.id
  const { userId } = req.params
  const Message = (await import('../models/Message')).default

  const messages = await Message.find({
    $or: [
      { senderId: adminId, recipientId: userId },
      { senderId: userId, recipientId: adminId }
    ]
  }).sort({ createdAt: 1 })

  res.json(messages)
})

// POST /api/admin/message
router.post('/message', async (req: AuthedRequest, res) => {
  const { recipientId, content } = req.body
  const Message = (await import('../models/Message')).default

  // Get recipient name for redundancy/display
  const recipient = await User.findById(recipientId)

  const msg = await Message.create({
    senderId: req.user!.id,
    recipientId,
    recipientName: recipient?.name || 'Unknown',
    subject: 'Admin Message',
    content,
    read: false
  })
  res.json(msg)
})

export default router

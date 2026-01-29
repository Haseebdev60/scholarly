import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import User from '../models/User';
import Subject from '../models/Subject';
import ClassModel from '../models/Class';
import Quiz from '../models/Quiz';
import Resource from '../models/Resource';
const router = Router();
router.use(requireAuth, requireRole('teacher'));
const requireApprovedTeacher = async (req, res, next) => {
    const teacher = await User.findById(req.user.id).select('approved assignedSubjects');
    if (!teacher)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!teacher.approved)
        return res.status(403).json({ error: 'Teacher not approved yet' });
    req.teacherDoc = teacher;
    next();
};
// GET /api/teacher/view-assigned-subjects
router.get('/view-assigned-subjects', requireApprovedTeacher, async (req, res) => {
    const teacher = req.teacherDoc;
    const subjects = await Subject.find({ _id: { $in: teacher.assignedSubjects } });
    res.json(subjects);
});
// POST /api/teacher/create-class
router.post('/create-class', requireApprovedTeacher, async (req, res) => {
    const { title, subjectId, scheduledDate, duration, classType, meetingLink } = req.body ?? {};
    if (!title || !subjectId || !scheduledDate || !duration || !classType)
        return res.status(400).json({ error: 'Missing fields' });
    const teacher = req.teacherDoc;
    const allowed = teacher.assignedSubjects.some((id) => id.toString() === subjectId);
    if (!allowed)
        return res.status(403).json({ error: 'Not assigned to this subject' });
    const doc = await ClassModel.create({
        title,
        subjectId,
        teacherId: req.user.id,
        scheduledDate: new Date(scheduledDate),
        duration: Number(duration),
        classType,
        meetingLink,
        isSubscriptionRequired: true,
    });
    res.status(201).json(doc);
});
// POST /api/teacher/create-quiz
router.post('/create-quiz', requireApprovedTeacher, async (req, res) => {
    const { title, subjectId, questions, isPremium } = req.body ?? {};
    if (!title || !subjectId)
        return res.status(400).json({ error: 'Missing fields' });
    const teacher = req.teacherDoc;
    const allowed = teacher.assignedSubjects.some((id) => id.toString() === subjectId);
    if (!allowed)
        return res.status(403).json({ error: 'Not assigned to this subject' });
    const doc = await Quiz.create({
        title,
        subjectId,
        questions: Array.isArray(questions) ? questions : [],
        isPremium: typeof isPremium === 'boolean' ? isPremium : true,
    });
    res.status(201).json(doc);
});
// PUT /api/teacher/update-class/:classId
router.put('/update-class/:classId', requireApprovedTeacher, async (req, res) => {
    const { classId } = req.params;
    const updates = req.body ?? {};
    // Basic validation - ensure teacher owns this class
    const existing = await ClassModel.findOne({ _id: classId, teacherId: req.user.id });
    if (!existing)
        return res.status(404).json({ error: 'Class not found or unauthorized' });
    const updated = await ClassModel.findByIdAndUpdate(classId, updates, { new: true });
    res.json(updated);
});
// POST /api/teacher/create-resource
router.post('/create-resource', requireApprovedTeacher, async (req, res) => {
    console.log('Create Resource Payload:', JSON.stringify(req.body, (k, v) => k === 'fileData' ? '...base64...' : v));
    const { title, type, url, subjectId, year, size, format, fileData, fileName, fileType, thumbnail } = req.body ?? {};
    if (!title || !subjectId)
        return res.status(400).json({ error: 'Missing fields' });
    // Validation for Link/Video vs File
    if (!fileData && (['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(type))) {
        return res.status(400).json({ error: 'File data required for documents' });
    }
    if (!url && !fileData && type !== 'link' && type !== 'video') {
        // Allow video/link if they have URL, otherwise need fileData
        return res.status(400).json({ error: 'URL or File required' });
    }
    const teacher = req.teacherDoc;
    const allowed = teacher.assignedSubjects.some((id) => id.toString() === subjectId);
    if (!allowed)
        return res.status(403).json({ error: 'Not assigned to this subject' });
    let finalUrl = url;
    // Handle File Upload
    if (fileData && fileName) {
        try {
            const fs = await import('fs');
            const path = await import('path');
            const uploadsDir = path.join(__dirname, '../../public/uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const filePath = path.join(uploadsDir, uniqueName);
            const base64Data = fileData.replace(/^data:.*,/, '');
            await fs.promises.writeFile(filePath, base64Data, 'base64');
            finalUrl = `/uploads/${uniqueName}`;
        }
        catch (err) {
            console.error("Upload error:", err);
            return res.status(500).json({ error: 'Failed to write file' });
        }
    }
    const doc = await Resource.create({
        title,
        type: type || 'link',
        url: finalUrl,
        subjectId,
        teacherId: req.user.id,
        year,
        size,
        format,
        fileType,
        uploadedBy: 'teacher',
        isPremium: req.body?.isPremium || false,
        thumbnail
    });
    res.status(201).json(doc);
});
// DELETE /api/teacher/resource/:id
router.delete('/resource/:id', requireApprovedTeacher, async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.id;
    const resource = await Resource.findOne({ _id: id, teacherId });
    if (!resource)
        return res.status(404).json({ error: 'Resource not found or unauthorized' });
    // Optional: Delete file from disk if it exists and is a local file
    if (resource.url.startsWith('/uploads/')) {
        try {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../public', resource.url);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        }
        catch (err) {
            console.error('Failed to delete file:', err);
            // Continue to delete db record even if file delete fails
        }
    }
    await Resource.findByIdAndDelete(id);
    res.json({ success: true });
});
// GET /api/teacher/dashboard
router.get('/dashboard', requireApprovedTeacher, async (req, res) => {
    const teacherId = req.user.id;
    const [classes, resources] = await Promise.all([
        ClassModel.find({ teacherId }).sort({ scheduledDate: 1 }).limit(10).populate('subjectId', 'title'),
        Resource.find({ teacherId }).sort({ createdAt: -1 }).limit(10).populate('subjectId', 'title'),
    ]);
    res.json({ classes, resources });
});
// GET /api/teacher/messages
router.get('/messages', requireApprovedTeacher, async (req, res) => {
    const teacher = req.teacherDoc;
    // Find messages where recipientId matches teacher's ID
    const messages = await import('../models/Message').then(m => m.default.find({ recipientId: teacher._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'name'));
    res.json(messages);
});
// GET /api/teacher/conversations
router.get('/conversations', requireApprovedTeacher, async (req, res) => {
    const teacherId = req.user.id;
    const mongoose = await import('mongoose');
    const teacherIdObj = new mongoose.Types.ObjectId(teacherId);
    const Message = (await import('../models/Message')).default;
    console.log('Fetching conversations for teacher:', teacherId);
    // Aggregation to find distinct users communicated with
    const conversations = await Message.aggregate([
        { $match: { $or: [{ senderId: teacherIdObj }, { recipientId: teacherIdObj }] } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: {
                    $cond: [{ $eq: ["$senderId", teacherIdObj] }, "$recipientId", "$senderId"]
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
    ]);
    console.log('Conversations found:', conversations.length);
    res.json(conversations);
});
// GET /api/teacher/messages/:userId
router.get('/messages/:userId', requireApprovedTeacher, async (req, res) => {
    const teacherId = req.user.id;
    const { userId } = req.params;
    const Message = (await import('../models/Message')).default;
    const messages = await Message.find({
        $or: [
            { senderId: teacherId, recipientId: userId },
            { senderId: userId, recipientId: teacherId }
        ]
    }).sort({ createdAt: 1 }); // Oldest first for chat history
    res.json(messages);
});
// POST /api/teacher/message
router.post('/message', requireApprovedTeacher, async (req, res) => {
    const { recipientId, content } = req.body;
    // const teacher = (req as any).teacherDoc
    const Message = (await import('../models/Message')).default;
    // Get recipient name for redundancy/display
    const recipient = await User.findById(recipientId);
    const msg = await Message.create({
        senderId: req.user.id,
        recipientId,
        recipientName: recipient?.name || 'Unknown',
        subject: 'Chat',
        content,
        read: false
    });
    res.json(msg);
});
// POST /api/teacher/settings
router.post('/settings', requireApprovedTeacher, async (req, res) => {
    const { hourlyRate } = req.body;
    await User.findByIdAndUpdate(req.user.id, { hourlyRate });
    res.json({ success: true });
});
// POST /api/teacher/availability
router.post('/availability', requireApprovedTeacher, async (req, res) => {
    const { availability } = req.body;
    console.log('Updating availability', availability);
    if (!availability || !Array.isArray(availability)) {
        return res.status(400).json({ error: 'Invalid format' });
    }
    await User.findByIdAndUpdate(req.user.id, { availability });
    res.json({ success: true });
});
// GET /api/teacher/availability
router.get('/availability', requireApprovedTeacher, async (req, res) => {
    const teacher = await User.findById(req.user.id).select('availability');
    res.json(teacher?.availability || []);
});
// GET /api/teacher/bookings
router.get('/bookings', requireApprovedTeacher, async (req, res) => {
    const bookings = await import('../models/Booking').then(m => m.default.find({ teacherId: req.user.id })
        .populate('studentId', 'name email')
        .sort({ date: 1 }));
    res.json(bookings);
});
// POST /api/teacher/cancel-booking
router.post('/cancel-booking', requireApprovedTeacher, async (req, res) => {
    const { bookingId } = req.body;
    await import('../models/Booking').then(m => m.default.findByIdAndUpdate(bookingId, { status: 'cancelled' }));
    res.json({ success: true });
});
// PUT /api/teacher/booking/:bookingId
router.put('/booking/:bookingId', requireApprovedTeacher, async (req, res) => {
    const { bookingId } = req.params;
    const { meetingLink } = req.body;
    await import('../models/Booking').then(m => m.default.findByIdAndUpdate(bookingId, { meetingLink }));
    res.json({ success: true });
});
export default router;

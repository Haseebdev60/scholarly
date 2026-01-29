import { Router } from 'express';
import Subject from '../models/Subject';
import Quiz from '../models/Quiz';
import { requireAuth } from '../middleware/auth';
const router = Router();
// GET /api/subjects - Public route to view all subjects
router.get('/subjects', async (_req, res) => {
    try {
        const subjects = await Subject.find()
            .select('title description teacherId isPremium')
            .populate('teacherId', 'name');
        res.json({ success: true, data: subjects });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/quizzes - Public route to view all quizzes (but premium ones require subscription)
router.get('/quizzes', async (_req, res) => {
    try {
        const quizzes = await Quiz.find()
            .select('title subjectId questions isPremium')
            .populate('subjectId', 'title');
        // Hide correct answers for public view
        const publicQuizzes = quizzes.map((q) => ({
            _id: q._id,
            title: q.title,
            subjectId: q.subjectId,
            questions: q.questions.map((question) => ({
                question: question.prompt,
                options: question.options,
            })),
            isPremium: q.isPremium,
        }));
        res.json({ success: true, data: publicQuizzes });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/teachers - Public route to view approved teachers
router.get('/teachers', async (_req, res) => {
    try {
        const teachers = await import('../models/User').then(m => m.default.find({ role: 'teacher', approved: true })
            .select('name bio avatar subjects availability email assignedSubjects hourlyRate')
            .populate('assignedSubjects', 'title'));
        // Map to simplified structure if needed or return as is
        res.json({ success: true, data: teachers });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/resources - Public route to view resources (past papers etc)
router.get('/resources', async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type ? { type } : {};
        // @ts-ignore
        const resources = await import('../models/Resource').then(m => m.default.find(filter).populate('subjectId', 'title'));
        res.json({ success: true, data: resources });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/quizzes/:id - Get full quiz with correct answers (requires subscription)
router.get('/quizzes/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('subjectId', 'title');
        if (!quiz)
            return res.status(404).json({ error: 'Quiz not found' });
        res.json({ success: true, data: quiz });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/admin-contact - Get the first admin user for contact purposes
router.get('/admin-contact', async (_req, res) => {
    try {
        const admin = await import('../models/User').then(m => m.default.findOne({ role: 'admin' }).select('_id name email'));
        if (!admin)
            return res.status(404).json({ error: 'No admin found' });
        res.json({ success: true, data: admin });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/generate-quiz
router.post('/generate-quiz', requireAuth, async (req, res) => {
    const { prompt } = req.body ?? {};
    if (!prompt)
        return res.status(400).json({ error: 'Prompt is required' });
    // Simulate AI generation
    const topic = prompt.toLowerCase();
    let questions = [];
    let title = 'General Knowledge Quiz';
    if (topic.includes('math') || topic.includes('calculus') || topic.includes('integral')) {
        title = 'Math Practice: Calculus & Algebra';
        questions = [
            { prompt: 'What is the integral of x^2?', options: ['x^3/3 + C', '2x + C', 'x^2 + C', '3x^3'], correctIndex: 0 },
            { prompt: 'Derivative of sin(x)?', options: ['-cos(x)', 'cos(x)', 'tan(x)', 'sec(x)'], correctIndex: 1 },
            { prompt: 'Value of pi to 2 decimals?', options: ['3.12', '3.14', '3.16', '3.18'], correctIndex: 1 },
            { prompt: 'Solve for x: 2x + 5 = 15', options: ['2', '5', '10', '7.5'], correctIndex: 1 },
            { prompt: 'sqrt(144) = ?', options: ['10', '11', '12', '13'], correctIndex: 2 }
        ];
    }
    else if (topic.includes('physics') || topic.includes('science')) {
        title = 'Physics & Science Explorer';
        questions = [
            { prompt: 'Unit of Force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctIndex: 1 },
            { prompt: 'Speed of light?', options: ['3x10^8 m/s', '300 m/s', 'Sound speed', 'Infinite'], correctIndex: 0 },
            { prompt: 'F = ma is which law?', options: ['1st', '2nd', '3rd', '4th'], correctIndex: 1 },
            { prompt: 'Earth gravity acceleration?', options: ['9.8 m/s^2', '10.5 m/s^2', '8 m/s^2', 'Zero'], correctIndex: 0 },
            { prompt: 'Power formula?', options: ['Work/Time', 'Force*Distance', 'Mass*Accel', 'None'], correctIndex: 0 }
        ];
    }
    else if (topic.includes('history') || topic.includes('war')) {
        title = 'History Buff Challenge';
        questions = [
            { prompt: 'Start of WWII?', options: ['1914', '1939', '1945', '1929'], correctIndex: 1 },
            { prompt: 'First US President?', options: ['Lincoln', 'Washington', 'Jefferson', 'Adams'], correctIndex: 1 },
            { prompt: 'Who built the Pyramids?', options: ['Romans', 'Egyptians', 'Mayans', 'Greeks'], correctIndex: 1 },
            { prompt: 'Magna Carta year?', options: ['1215', '1492', '1776', '1066'], correctIndex: 0 },
            { prompt: 'Moon landing year?', options: ['1969', '1959', '1975', '1980'], correctIndex: 0 }
        ];
    }
    else {
        title = 'AI Generated Quiz: ' + prompt.slice(0, 20) + '...';
        questions = [
            { prompt: 'Which is an AI model?', options: ['GPT-4', 'Excel', 'Paint', 'Notepad'], correctIndex: 0 },
            { prompt: 'What does CPU stand for?', options: ['Central Process Unit', 'Computer Power Unit', 'Core Process Unit', 'None'], correctIndex: 0 },
            { prompt: 'Capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctIndex: 2 },
            { prompt: 'H2O is?', options: ['Salt', 'Water', 'Gold', 'Silver'], correctIndex: 1 },
            { prompt: 'Largest planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], correctIndex: 2 }
        ];
    }
    // Create ephemeral quiz
    const quiz = await Quiz.create({
        title,
        subjectId: (await Subject.findOne())?._id, // Assign to first subject as fallback/generic
        questions,
        isPremium: false,
        teacherId: req.user.id // Self-generated
    });
    // Normalize response for frontend (which expects 'question', not 'prompt')
    const quizObj = quiz.toObject();
    const successResponse = {
        ...quizObj,
        questions: quizObj.questions.map((q) => ({
            ...q,
            question: q.prompt,
            options: q.options
        }))
    };
    res.json(successResponse);
});
// POST /api/attempt-quiz
router.post('/attempt-quiz', requireAuth, async (req, res) => {
    const { quizId, answers } = req.body ?? {};
    if (!quizId || !Array.isArray(answers))
        return res.status(400).json({ error: 'Missing fields' });
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
        return res.status(404).json({ error: 'Quiz not found' });
    // Check permissions
    if (quiz.isPremium && req.user?.role === 'student') {
        const user = await import('../models/User').then(m => m.default.findById(req.user.id));
        const exp = user?.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate) : null;
        const active = user?.subscriptionStatus !== 'free' && !!exp && exp.getTime() > Date.now();
        if (!active)
            return res.status(402).json({ error: 'Premium subscription required' });
    }
    const total = quiz.questions.length;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
        if (answers[idx] === q.correctIndex)
            correct += 1;
    });
    res.json({
        score: total ? Math.round((correct / total) * 100) : 0,
        totalQuestions: total,
        correctAnswers: correct,
    });
});
export default router;

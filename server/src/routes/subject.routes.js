import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import Subject from '../models/Subject';
const router = Router();
// Protect all routes: Admin only
router.use(requireAuth, requireRole('admin'));
// POST /api/subjects - Create a new subject
router.post('/', async (req, res) => {
    const { title } = req.body;
    if (!title)
        return res.status(400).json({ error: 'Title is required' });
    const existing = await Subject.findOne({ title });
    if (existing)
        return res.status(400).json({ error: 'Subject already exists' });
    const subject = await Subject.create({ title });
    res.json(subject);
});
// PUT /api/subjects/:id - Update a subject
router.put('/:id', async (req, res) => {
    const { title } = req.body;
    if (!title)
        return res.status(400).json({ error: 'Title is required' });
    const subject = await Subject.findByIdAndUpdate(req.params.id, { title }, { new: true });
    if (!subject)
        return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
});
// DELETE /api/subjects/:id - Delete a subject
router.delete('/:id', async (req, res) => {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject)
        return res.status(404).json({ error: 'Subject not found' });
    res.json({ success: true });
});
export default router;

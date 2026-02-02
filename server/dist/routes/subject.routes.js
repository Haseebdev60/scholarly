"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Subject_1 = __importDefault(require("../models/Subject"));
const router = (0, express_1.Router)();
// Protect all routes: Admin only
router.use(auth_1.requireAuth, (0, auth_1.requireRole)('admin'));
// POST /api/subjects - Create a new subject
router.post('/', async (req, res) => {
    const { title } = req.body;
    if (!title)
        return res.status(400).json({ error: 'Title is required' });
    const existing = await Subject_1.default.findOne({ title });
    if (existing)
        return res.status(400).json({ error: 'Subject already exists' });
    const subject = await Subject_1.default.create({ title });
    res.json(subject);
});
// PUT /api/subjects/:id - Update a subject
router.put('/:id', async (req, res) => {
    const { title } = req.body;
    if (!title)
        return res.status(400).json({ error: 'Title is required' });
    const subject = await Subject_1.default.findByIdAndUpdate(req.params.id, { title }, { new: true });
    if (!subject)
        return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
});
// DELETE /api/subjects/:id - Delete a subject
router.delete('/:id', async (req, res) => {
    const subject = await Subject_1.default.findByIdAndDelete(req.params.id);
    if (!subject)
        return res.status(404).json({ error: 'Subject not found' });
    res.json({ success: true });
});
exports.default = router;

const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function formatValidationErrors(err) {
    return Object.values(err.errors).map((e) => e.message);
}

async function createExercise(req, res) {
    try {
        const exercise = await Exercise.create(req.body);
        return res.status(201).json({ ok: true, exercise });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ ok: false, errors: formatValidationErrors(err) });
        }
        throw err;
    }
}

async function listExercises(req, res) {
    const { muscleGroup, equipment, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (muscleGroup) filter.muscleGroup = muscleGroup;
    if (equipment) filter.equipment = equipment;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [exercises, total] = await Promise.all([
        Exercise.find(filter)
            .sort({ name: 1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Exercise.countDocuments(filter)
    ]);

    return res.json({
        ok: true,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        exercises
    });
}

async function getExercise(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ ok: false, error: 'Invalid exercise id.' });
    }

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
        return res.status(404).json({ ok: false, error: 'Exercise not found.' });
    }
    return res.json({ ok: true, exercise });
}

async function updateExercise(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ ok: false, error: 'Invalid exercise id.' });
    }

    try {
        const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!exercise) {
            return res.status(404).json({ ok: false, error: 'Exercise not found.' });
        }
        return res.json({ ok: true, exercise });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ ok: false, errors: formatValidationErrors(err) });
        }
        throw err;
    }
}

async function deleteExercise(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ ok: false, error: 'Invalid exercise id.' });
    }

    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
        return res.status(404).json({ ok: false, error: 'Exercise not found.' });
    }
    return res.json({ ok: true, deleted: exercise });
}

module.exports = {
    createExercise,
    listExercises,
    getExercise,
    updateExercise,
    deleteExercise
};
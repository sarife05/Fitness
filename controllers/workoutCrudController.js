const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const WorkoutItem = require('../models/WorkoutItem');

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function formatValidationErrors(err) {
    return Object.values(err.errors).map((e) => e.message);
}

async function createWorkout(req, res) {
    const { items, ...workoutData } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            ok: false,
            error: 'A workout must include at least one item in "items".'
        });
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const [workout] = await Workout.create([workoutData], { session });
        const itemDocs = items.map((item) => ({ ...item, workoutId: workout._id }));
        const createdItems = await WorkoutItem.create(itemDocs, { session, ordered: true });

        await session.commitTransaction();
        return res.status(201).json({ ok: true, workout, items: createdItems });
    } catch (err) {
        await session.abortTransaction();
        if (err.name === 'ValidationError') {
            return res.status(400).json({ ok: false, errors: formatValidationErrors(err) });
        }
        throw err;
    } finally {
        session.endSession();
    }
}

async function listWorkouts(req, res) {
    const { dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (dateFrom || dateTo) {
        filter.date = {};
        if (dateFrom) filter.date.$gte = new Date(dateFrom);
        if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [workouts, total] = await Promise.all([
        Workout.find(filter)
            .sort({ date: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Workout.countDocuments(filter)
    ]);

    return res.json({
        ok: true,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        workouts
    });
}

async function getWorkout(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ ok: false, error: 'Invalid workout id.' });
    }
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
        return res.status(404).json({ ok: false, error: 'Workout not found.' });
    }
    const items = await WorkoutItem.find({ workoutId: workout._id }).populate('exerciseId');
    return res.json({ ok: true, workout, items });
}

async function updateWorkout(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ ok: false, error: 'Invalid workout id.' });
    }
    try {
        const { items, ...workoutData } = req.body; // items ignored here on purpose
        const workout = await Workout.findByIdAndUpdate(req.params.id, workoutData, {
            new: true,
            runValidators: true
        });
        if (!workout) {
            return res.status(404).json({ ok: false, error: 'Workout not found.' });
        }
        return res.json({ ok: true, workout });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ ok: false, errors: formatValidationErrors(err) });
        }
        throw err;
    }
}

async function deleteWorkout(req, res) {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ ok: false, error: 'Invalid workout id.' });
    }
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) {
        return res.status(404).json({ ok: false, error: 'Workout not found.' });
    }
    await WorkoutItem.deleteMany({ workoutId: workout._id });
    return res.json({ ok: true, deleted: workout });
}
async function listItems(req, res) {
    if (!isValidId(req.params.workoutId)) {
        return res.status(400).json({ ok: false, error: 'Invalid workout id.' });
    }
    const workout = await Workout.findById(req.params.workoutId);
    if (!workout) {
        return res.status(404).json({ ok: false, error: 'Workout not found.' });
    }
    const items = await WorkoutItem.find({ workoutId: workout._id }).populate('exerciseId');
    return res.json({ ok: true, items });
}

async function addItem(req, res) {
    if (!isValidId(req.params.workoutId)) {
        return res.status(400).json({ ok: false, error: 'Invalid workout id.' });
    }
    const workout = await Workout.findById(req.params.workoutId);
    if (!workout) {
        return res.status(404).json({ ok: false, error: 'Workout not found.' });
    }
    try {
        const item = await WorkoutItem.create({ ...req.body, workoutId: workout._id });
        return res.status(201).json({ ok: true, item });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ ok: false, errors: formatValidationErrors(err) });
        }
        throw err;
    }
}

async function updateItem(req, res) {
    const { workoutId, itemId } = req.params;
    if (!isValidId(workoutId) || !isValidId(itemId)) {
        return res.status(400).json({ ok: false, error: 'Invalid id.' });
    }
    try {
        const item = await WorkoutItem.findOneAndUpdate(
            { _id: itemId, workoutId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) {
            return res.status(404).json({ ok: false, error: 'Item not found in this workout.' });
        }
        return res.json({ ok: true, item });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ ok: false, errors: formatValidationErrors(err) });
        }
        throw err;
    }
}

async function deleteItem(req, res) {
    const { workoutId, itemId } = req.params;
    if (!isValidId(workoutId) || !isValidId(itemId)) {
        return res.status(400).json({ ok: false, error: 'Invalid id.' });
    }

    const itemCount = await WorkoutItem.countDocuments({ workoutId });
    if (itemCount <= 1) {
        return res.status(400).json({
            ok: false,
            error: 'Cannot delete the last item of a workout. Delete the whole workout instead.'
        });
    }

    const item = await WorkoutItem.findOneAndDelete({ _id: itemId, workoutId });
    if (!item) {
        return res.status(404).json({ ok: false, error: 'Item not found in this workout.' });
    }
    return res.json({ ok: true, deleted: item });
}

module.exports = {
    createWorkout,
    listWorkouts,
    getWorkout,
    updateWorkout,
    deleteWorkout,
    listItems,
    addItem,
    updateItem,
    deleteItem
};